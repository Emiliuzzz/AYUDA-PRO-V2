from django.urls import path
from subjects.views.subject_views import SubjectListView
from subjects.views.request_views import SubjectRequestListCreateView, SubjectRequestAdminActionView, AcceptSubjectRequestView

urlpatterns = [
    path('', SubjectListView.as_view(), name='subject-list'),
    path('requests/', SubjectRequestListCreateView.as_view(), name='subject-request-list'),
    path('requests/<int:pk>/action/', SubjectRequestAdminActionView.as_view(), name='subject-request-action'),
    path('requests/<int:pk>/accept/', AcceptSubjectRequestView.as_view(), name='subject-request-accept'),
]
