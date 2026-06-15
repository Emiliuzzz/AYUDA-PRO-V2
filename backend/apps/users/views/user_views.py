from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from users.serializers.user_serializers import RegisterSerializer, UserSerializer, ProfileUpdateSerializer
from users.services.user_services import user_create
from users.models.user import User

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = user_create(**serializer.validated_data)
        
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED
        )

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProfileUpdateSerializer

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)

class PublicProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            user_data = UserSerializer(user).data
            
            # If tutor, add tutor profile data
            tutor = getattr(user, 'tutor_profile', None)
            if tutor:
                from tutors.serializers.tutor_serializers import TutorSerializer
                user_data['tutor_profile'] = TutorSerializer(tutor).data
            
            # If student, add student profile data
            student = getattr(user, 'student_profile', None)
            if student:
                from users.serializers.user_serializers import StudentSerializer
                user_data['student_profile'] = StudentSerializer(student).data
                
            return Response(user_data)
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado."}, status=404)
