from django.urls import path
from users.views.user_views import RegisterView, MeView, PublicProfileView
from users.views.admin_views import AdminStatsView, TutorApprovalView, UserManagementView, AdminUserDetailView, AdminResetPasswordView
from users.views.support_views import SupportTicketView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', MeView.as_view(), name='me'),
    path('<int:pk>/profile/', PublicProfileView.as_view(), name='public_profile'),
    path('support/', SupportTicketView.as_view(), name='support_tickets'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin_stats'),
    path('admin/users/', UserManagementView.as_view(), name='admin_users_list'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin_user_detail'),
    path('admin/users/<int:pk>/reset-password/', AdminResetPasswordView.as_view(), name='admin_user_reset_password'),
    path('admin/tutors/', TutorApprovalView.as_view(), name='tutor_approval_list'),
    path('admin/tutors/<int:pk>/approve/', TutorApprovalView.as_view(), name='tutor_approve'),
]
