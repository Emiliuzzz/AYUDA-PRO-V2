from rest_framework import serializers
from study_sessions.models import Session
from tutors.serializers.tutor_serializers import TutorSerializer
from subjects.serializers.subject_serializers import SubjectSerializer
from users.serializers.user_serializers import StudentSerializer

class SessionSerializer(serializers.ModelSerializer):
    tutor = TutorSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    student = StudentSerializer(read_only=True)
    
    class Meta:
        model = Session
        fields = '__all__'

class SessionCreateSerializer(serializers.Serializer):
    tutor_id = serializers.IntegerField()
    subject_id = serializers.IntegerField()
    start_time = serializers.DateTimeField()
    end_time = serializers.DateTimeField()
    notes = serializers.CharField(required=False, allow_blank=True)
