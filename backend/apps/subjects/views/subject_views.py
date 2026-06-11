from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from subjects.models import Subject
from subjects.serializers.subject_serializers import SubjectSerializer

class SubjectListView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SubjectSerializer

    def get(self, request):
        subjects = Subject.objects.all()
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Solo tutores y admins pueden crear materias
        if request.user.role not in ['TUTOR', 'ADMIN']:
            return Response({"error": "Solo los tutores pueden proponer nuevas materias."}, 
                            status=status.HTTP_403_FORBIDDEN)
        
        serializer = SubjectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
