from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Avg, Count
from django.utils import timezone
from tutors.models import Tutor
from tutors.serializers.tutor_serializers import TutorSerializer, TutorUpdateSerializer

class TutorListView(ListAPIView):
    queryset = Tutor.objects.filter(is_active=True)
    serializer_class = TutorSerializer
    permission_classes = [permissions.AllowAny]

class TutorMeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TutorUpdateSerializer

    def get(self, request):
        if request.user.role != 'TUTOR':
            return Response({"error": "Solo los tutores pueden acceder a esta información."}, status=status.HTTP_403_FORBIDDEN)
        
        tutor = getattr(request.user, 'tutor_profile', None)
        if not tutor:
            return Response({"error": "Perfil de tutor no encontrado."}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = TutorSerializer(tutor)
        return Response(serializer.data)

    def put(self, request):
        if request.user.role != 'TUTOR':
            return Response({"error": "Solo los tutores pueden editar este perfil."}, status=status.HTTP_403_FORBIDDEN)
            
        tutor = getattr(request.user, 'tutor_profile', None)
        serializer = TutorUpdateSerializer(tutor, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(TutorSerializer(tutor).data)

class TutorStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'TUTOR':
            return Response({"error": "Acceso denegado."}, status=403)
        
        tutor = getattr(request.user, 'tutor_profile', None)
        if not tutor:
            return Response({"error": "Perfil de tutor no encontrado."}, status=404)

        from reviews.models import Review
        from study_sessions.models import Session

        # Real Rating
        avg_rating = Review.objects.filter(session__tutor=tutor).aggregate(Avg('rating'))['rating__avg'] or 0
        
        # Unique Active Students
        active_students = Session.objects.filter(
            tutor=tutor, 
            status__in=['SCHEDULED', 'COMPLETED']
        ).values('student').distinct().count()

        # Monthly Income (Completed sessions this month)
        now = timezone.now()
        monthly_sessions = Session.objects.filter(
            tutor=tutor,
            status='COMPLETED',
            start_time__month=now.month,
            start_time__year=now.year
        )
        
        total_income = 0
        for session in monthly_sessions:
            duration = session.end_time - session.start_time
            hours = duration.total_seconds() / 3600
            total_income += float(hours) * float(tutor.hourly_rate)

        return Response({
            "average_rating": round(float(avg_rating), 1),
            "active_students": active_students,
            "monthly_income": round(total_income)
        })
