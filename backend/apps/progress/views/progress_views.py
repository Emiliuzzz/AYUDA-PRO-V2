from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from progress.models import Progress
from progress.serializers.progress_serializers import ProgressSerializer, ProgressCreateSerializer

class ProgressListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProgressSerializer

    def get(self, request):
        # El alumno ve su propio progreso
        progress = Progress.objects.filter(student__user=request.user)
        serializer = ProgressSerializer(progress, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Solo los tutores deberían poder crear reportes de progreso
        if request.user.role != 'TUTOR':
            return Response({"error": "Solo los tutores pueden crear reportes de progreso."}, 
                            status=status.HTTP_403_FORBIDDEN)
        
        serializer = ProgressCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
