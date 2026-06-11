from django.urls import path
from users.views.user_views import RegisterView, MeView
from users.views.admin_views import AdminStatsView, TutorApprovalView, UserManagementView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', MeView.as_view(), name='me'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin_stats'),
    path('admin/users/', UserManagementView.as_view(), name='admin_users_list'),
    path('admin/tutors/', TutorApprovalView.as_view(), name='tutor_approval_list'),
    path('admin/tutors/<int:pk>/approve/', TutorApprovalView.as_view(), name='tutor_approve'),
]
