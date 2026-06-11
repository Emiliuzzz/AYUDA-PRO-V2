from rest_framework import serializers
from subjects.models.request import SubjectRequest
from users.serializers.user_serializers import StudentSerializer

class SubjectRequestSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    
    class Meta:
        model = SubjectRequest
        fields = ['id', 'student', 'subject_name', 'description', 'status', 'admin_notes', 'created_at']
        read_only_fields = ['status', 'admin_notes', 'created_at']

class SubjectRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubjectRequest
        fields = ['subject_name', 'description']
