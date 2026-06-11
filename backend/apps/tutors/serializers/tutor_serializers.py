from rest_framework import serializers
from tutors.models import Tutor
from users.serializers.user_serializers import UserSerializer
from subjects.serializers.subject_serializers import SubjectSerializer

class TutorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    subjects = SubjectSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    
    class Meta:
        model = Tutor
        fields = ('id', 'user', 'bio', 'experience_years', 'hourly_rate', 'subjects', 'is_active', 'average_rating', 'total_reviews')

    def get_average_rating(self, obj):
        from django.db.models import Avg
        from reviews.models import Review
        avg = Review.objects.filter(session__tutor=obj).aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 0

    def get_total_reviews(self, obj):
        from reviews.models import Review
        return Review.objects.filter(session__tutor=obj).count()

class TutorUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tutor
        fields = ('bio', 'experience_years', 'hourly_rate', 'subjects', 'is_active')
