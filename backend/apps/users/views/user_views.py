from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from users.serializers.user_serializers import RegisterSerializer, UserSerializer, ProfileUpdateSerializer
from users.services.user_services import user_create

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
