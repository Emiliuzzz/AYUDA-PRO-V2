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
            # Manually map role codes to display names if needed
            role_map = dict(User.Roles.choices)
            users_by_role_query = User.objects.values('role').annotate(count=Count('id'))
            users_by_role = [
                {"role": role_map.get(item['role'], item['role']), "count": item['count']}
                for item in users_by_role_query
            ]
            
            # New users per month (last 6 months)
            # Fail-safe for monthly stats
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
...
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
