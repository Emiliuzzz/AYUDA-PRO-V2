from rest_framework import serializers
from progress.models import Progress

class ProgressSerializer(serializers.ModelSerializer):
    subject_name = serializers.ReadOnlyField(source='subject.name')
    
    class Meta:
        model = Progress
        fields = ('id', 'subject', 'subject_name', 'notes', 'level_of_understanding', 'updated_at')

class ProgressCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Progress
        fields = ('student', 'subject', 'notes', 'level_of_understanding')
