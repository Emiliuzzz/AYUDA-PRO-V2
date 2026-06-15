from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Count
from django.db.models.functions import TruncMonth
from users.models.user import User
from tutors.models.tutor import Tutor
from users.permissions.admin_permissions import IsAdminUser
from tutors.serializers.tutor_serializers import TutorSerializer

class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            # Total users
            total_users = User.objects.count()
            
            # Users by role
            role_map = dict(User.Roles.choices)
            users_by_role_query = User.objects.values('role').annotate(count=Count('id'))
            users_by_role = [
                {"role": role_map.get(item['role'], item['role']), "count": item['count']}
                for item in users_by_role_query
            ]
            
            # New users per month
            try:
                users_per_month_query = User.objects.annotate(
                    month=TruncMonth('date_joined')
                ).values('month').annotate(count=Count('id')).order_by('-month')[:6]
                
                users_per_month = [
                    {"month": entry['month'].strftime('%Y-%m') if entry['month'] else "Desconocido", "count": entry['count']} 
                    for entry in users_per_month_query
                ]
            except Exception:
                users_per_month = []

            return Response({
                "total_users": total_users,
                "users_by_role": users_by_role,
                "users_per_month": users_per_month
            })
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class TutorApprovalView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        pending_tutors = Tutor.objects.filter(is_active=False)
        serializer = TutorSerializer(pending_tutors, many=True)
        return Response(serializer.data)

    def post(self, request, pk):
        try:
            tutor = Tutor.objects.get(pk=pk)
            tutor.is_active = True
            tutor.save()
            return Response({"message": f"Tutor {tutor.user.username} aprobado con éxito."})
        except Tutor.DoesNotExist:
            return Response({"error": "Tutor no encontrado."}, status=status.HTTP_404_NOT_FOUND)

class UserManagementView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        role_filter = request.query_params.get('role')
        users = User.objects.all().order_by('-date_joined')
        
        if role_filter:
            users = users.filter(role=role_filter)
            
        from users.serializers.user_serializers import UserSerializer
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class AdminUserDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            from users.serializers.user_serializers import UserSerializer
            data = UserSerializer(user).data
            
            # Add profile info if it exists
            if hasattr(user, 'student_profile'):
                from users.serializers.user_serializers import StudentSerializer
                data['student_profile'] = StudentSerializer(user.student_profile).data
            if hasattr(user, 'tutor_profile'):
                from tutors.serializers.tutor_serializers import TutorSerializer
                data['tutor_profile'] = TutorSerializer(user.tutor_profile).data
                
            return Response(data)
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado."}, status=404)

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            
            # 1. Update basic fields (is_active)
            if 'is_active' in request.data:
                user.is_active = request.data['is_active']
            
            # 2. Update Role (only STUDENT or TUTOR)
            new_role = request.data.get('role')
            if new_role and new_role in ['STUDENT', 'TUTOR']:
                if user.role != new_role:
                    user.role = new_role
                    # Ensure profile exists
                    if new_role == 'STUDENT' and not hasattr(user, 'student_profile'):
                        from users.models.student import Student
                        Student.objects.create(user=user)
                    elif new_role == 'TUTOR' and not hasattr(user, 'tutor_profile'):
                        from tutors.models.tutor import Tutor
                        Tutor.objects.create(user=user, hourly_rate=0)
            
            user.save()
            from users.serializers.user_serializers import UserSerializer
            return Response(UserSerializer(user).data)
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado."}, status=404)

class AdminResetPasswordView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            new_password = request.data.get('password')
            if not new_password:
                return Response({"error": "Debes proporcionar una nueva clave."}, status=400)
            
            user.set_password(new_password)
            user.save()
            return Response({"message": f"Clave de {user.username} actualizada con éxito."})
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado."}, status=404)
