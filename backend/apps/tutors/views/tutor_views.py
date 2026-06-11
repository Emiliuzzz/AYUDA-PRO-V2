from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework import status, permissions
from tutors.models import Tutor
from tutors.serializers.tutor_serializers import TutorSerializer, TutorUpdateSerializer

class TutorListView(ListAPIView):
    queryset = Tutor.objects.filter(is_active=True)
    serializer_class = TutorSerializer
    permission_classes = [permissions.AllowAny]

class TutorMeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TutorUpdateSerializer

    def get(self, request):
        if request.user.role != 'TUTOR':
            return Response({"error": "Solo los tutores pueden acceder a esta información."}, status=status.HTTP_403_FORBIDDEN)
        
        tutor = getattr(request.user, 'tutor_profile', None)
        if not tutor:
            return Response({"error": "Perfil de tutor no encontrado."}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = TutorSerializer(tutor)
        return Response(serializer.data)

    def put(self, request):
        if request.user.role != 'TUTOR':
            return Response({"error": "Solo los tutores pueden editar este perfil."}, status=status.HTTP_403_FORBIDDEN)
            
        tutor = getattr(request.user, 'tutor_profile', None)
        serializer = TutorUpdateSerializer(tutor, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(TutorSerializer(tutor).data)
