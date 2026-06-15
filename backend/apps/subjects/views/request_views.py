from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from subjects.models.request import SubjectRequest
from subjects.serializers.request_serializers import SubjectRequestSerializer, SubjectRequestCreateSerializer
from users.permissions.admin_permissions import IsAdminUser
from django.db import transaction
from django.utils import timezone
from study_sessions.models.session import Session
from study_sessions.serializers.session_serializers import SessionSerializer
from datetime import timedelta

class SubjectRequestListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role == 'ADMIN' or request.user.is_superuser:
            requests = SubjectRequest.objects.all()
        elif request.user.role == 'TUTOR':
            # Tutors see all pending requests to accept them
            requests = SubjectRequest.objects.filter(status='PENDING')
        else:
            # Students only see their own requests
            student = getattr(request.user, 'student_profile', None)
            if not student:
                return Response({"error": "Perfil de estudiante no encontrado."}, status=403)
            requests = SubjectRequest.objects.filter(student=student)
        
        serializer = SubjectRequestSerializer(requests, many=True)
        return Response(serializer.data)

    def post(self, request):
        student = getattr(request.user, 'student_profile', None)
        if not student:
            return Response({"error": "Solo estudiantes pueden crear solicitudes."}, status=403)
            
        serializer = SubjectRequestCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(student=student)
        return Response(SubjectRequestSerializer(serializer.instance).data, status=status.HTTP_201_CREATED)

class SubjectRequestAdminActionView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            subject_request = SubjectRequest.objects.get(pk=pk)
            subject_request.status = request.data.get('status', subject_request.status)
            subject_request.admin_notes = request.data.get('admin_notes', subject_request.admin_notes)
            subject_request.save()
            return Response(SubjectRequestSerializer(subject_request).data)
        except SubjectRequest.DoesNotExist:
            return Response({"error": "Solicitud no encontrada."}, status=404)

class AcceptSubjectRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != 'TUTOR':
            return Response({"error": "Solo los tutores pueden aceptar propuestas."}, status=403)
        
        tutor = getattr(request.user, 'tutor_profile', None)
        if not tutor or not tutor.is_active:
            return Response({"error": "Tu perfil de tutor debe estar activo para aceptar clases."}, status=403)

        try:
            with transaction.atomic():
                sub_request = SubjectRequest.objects.get(pk=pk)
                if sub_request.status != 'PENDING':
                    return Response({"error": "Esta propuesta ya no está disponible."}, status=400)
                
                if not sub_request.subject:
                    return Response({"error": "Esta propuesta debe estar vinculada a una materia existente para ser aceptada automáticamente."}, status=400)

                # Update request
                sub_request.status = 'FULFILLED'
                sub_request.accepted_by = tutor
                sub_request.save()
                
                # Create Session
                start_time = sub_request.preferred_datetime or timezone.now()
                session = Session.objects.create(
                    tutor=tutor,
                    student=sub_request.student,
                    subject=sub_request.subject,
                    start_time=start_time,
                    end_time=start_time + timedelta(hours=1),
                    notes=f"Propuesta aceptada: {sub_request.description}"
                )
                
                return Response({
                    "message": "Propuesta aceptada con éxito.",
                    "session": SessionSerializer(session).data
                })

        except SubjectRequest.DoesNotExist:
            return Response({"error": "Propuesta no encontrada."}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
