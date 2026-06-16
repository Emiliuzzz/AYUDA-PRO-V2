from rest_framework import serializers
from users.models import User
from users.models.student import Student

class UserSerializer(serializers.ModelSerializer):
    is_approved = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'first_name', 'last_name', 'bio', 'phone', 'avatar', 'is_superuser', 'is_staff', 'is_active', 'is_approved')

    def get_is_approved(self, obj):
        if obj.role == 'TUTOR' and hasattr(obj, 'tutor_profile'):
            return obj.tutor_profile.is_active
        return True

class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Student
        fields = ('id', 'user', 'university', 'career', 'current_semester')

class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'bio', 'phone', 'avatar')

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=User.Roles.choices)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
