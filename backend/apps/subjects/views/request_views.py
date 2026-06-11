from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from subjects.models.request import SubjectRequest
from subjects.serializers.request_serializers import SubjectRequestSerializer, SubjectRequestCreateSerializer
from users.permissions.admin_permissions import IsAdminUser

class SubjectRequestListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Admin sees all, student sees their own
        if request.user.role == 'ADMIN' or request.user.is_superuser:
            requests = SubjectRequest.objects.all()
        else:
            student = getattr(request.user, 'student_profile', None)
            if not student:
                return Response({"error": "Solo estudiantes pueden ver sus solicitudes."}, status=403)
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
