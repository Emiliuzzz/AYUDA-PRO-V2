from rest_framework import serializers
from reviews.models import Review

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'

class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ('session', 'rating', 'comment')

    def validate_session(self, value):
        # Validar que la sesión pertenezca al usuario que califica
        user = self.context['request'].user
        if value.student.user != user:
            raise serializers.ValidationError("Solo el estudiante de la sesión puede calificarla.")
        
        # Validar que la sesión no tenga ya una evaluación
        if hasattr(value, 'review'):
            raise serializers.ValidationError("Esta sesión ya ha sido calificada.")
        
        return value
