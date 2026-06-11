from rest_framework import serializers
from study_sessions.models.material import SessionMaterial

class SessionMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionMaterial
        fields = ['id', 'session', 'title', 'file', 'uploaded_at']
        read_only_fields = ['uploaded_at']
