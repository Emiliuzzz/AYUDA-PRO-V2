from rest_framework import serializers
from subjects.models.request import SubjectRequest
from subjects.models.subject import Subject
from users.serializers.user_serializers import StudentSerializer
from subjects.serializers.subject_serializers import SubjectSerializer

class SubjectRequestSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    accepted_by = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = SubjectRequest
        fields = [
            'id', 'student', 'subject', 'subject_name', 
            'description', 'proposed_price', 'preferred_datetime',
            'accepted_by', 'status', 'admin_notes', 'created_at'
        ]
        read_only_fields = ['status', 'admin_notes', 'created_at', 'accepted_by']

class SubjectRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubjectRequest
        fields = ['subject', 'subject_name', 'description', 'proposed_price', 'preferred_datetime']

    def validate(self, data):
        if not data.get('subject') and not data.get('subject_name'):
            raise serializers.ValidationError("Debes seleccionar una materia o escribir el nombre de una nueva.")
        return data
