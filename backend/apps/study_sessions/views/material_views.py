from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from study_sessions.models.material import SessionMaterial
from study_sessions.models.session import Session
from study_sessions.serializers.material_serializers import SessionMaterialSerializer

class SessionMaterialListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, session_id):
        # List materials for a specific session
        try:
            session = Session.objects.get(pk=session_id)
            # Verify user is student or tutor of this session
            if session.tutor.user != request.user and session.student.user != request.user:
                return Response({"error": "No tienes acceso a esta sesión."}, 
                                status=status.HTTP_403_FORBIDDEN)
            
            materials = session.materials.all()
            serializer = SessionMaterialSerializer(materials, many=True)
            return Response(serializer.data)
        except Session.DoesNotExist:
            return Response({"error": "Sesión no encontrada."}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, session_id):
        # Only tutor of the session can upload materials
        try:
            session = Session.objects.get(pk=session_id)
            if session.tutor.user != request.user:
                return Response({"error": "Solo el tutor puede subir material."}, 
                                status=status.HTTP_403_FORBIDDEN)
            
            data = request.data.copy()
            data['session'] = session.id
            serializer = SessionMaterialSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Session.DoesNotExist:
            return Response({"error": "Sesión no encontrada."}, status=status.HTTP_404_NOT_FOUND)
