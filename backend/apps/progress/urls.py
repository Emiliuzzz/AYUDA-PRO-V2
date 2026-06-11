from django.urls import path
from progress.views.progress_views import ProgressListCreateView

urlpatterns = [
    path('', ProgressListCreateView.as_view(), name='progress-list-create'),
]
