from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.core.exceptions import ValidationError
from django.db.models import Q
from study_sessions.serializers.session_serializers import SessionSerializer, SessionCreateSerializer
from study_sessions.services.session_services import session_create
from study_sessions.models import Session
from tutors.models import Tutor
from subjects.models import Subject

class SessionListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SessionSerializer

    def get(self, request):
        # Listar sesiones donde el usuario sea el estudiante o el tutor
        user = request.user
        sessions = Session.objects.filter(
            Q(student__user=user) | Q(tutor__user=user)
        ).order_by('start_time')
        serializer = SessionSerializer(sessions, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SessionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            # Obtener objetos necesarios
            tutor = Tutor.objects.get(id=serializer.validated_data.pop('tutor_id'))
            subject = Subject.objects.get(id=serializer.validated_data.pop('subject_id'))
            student = request.user.student_profile
            
            session = session_create(
                tutor=tutor,
                student=student,
                subject=subject,
                **serializer.validated_data
            )
            
            return Response(
                SessionSerializer(session).data,
                status=status.HTTP_201_CREATED
            )
        except Tutor.DoesNotExist:
            return Response({"error": "Tutor no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except Subject.DoesNotExist:
            return Response({"error": "Materia no encontrada"}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "Debes tener un perfil de estudiante para reservar."}, status=status.HTTP_403_FORBIDDEN)

class UpdateSessionStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SessionSerializer

    def patch(self, request, pk):
        try:
            session = Session.objects.get(pk=pk)
            # Solo el tutor o el estudiante de la sesión puede cambiar el estado
            if session.tutor.user != request.user and session.student.user != request.user:
                return Response({"error": "No tienes permiso para modificar esta sesión."}, 
                                status=status.HTTP_403_FORBIDDEN)
            
            new_status = request.data.get('status')
            if new_status not in Session.Status.values:
                return Response({"error": "Estado no válido."}, status=status.HTTP_400_BAD_REQUEST)
                
            session.status = new_status
            session.save()
            return Response(SessionSerializer(session).data)
        except Session.DoesNotExist:
            return Response({"error": "Sesión no encontrada."}, status=status.HTTP_404_NOT_FOUND)
