from django.urls import path
from tutors.views.tutor_views import TutorListView, TutorMeView

urlpatterns = [
    path('', TutorListView.as_view(), name='tutor-list'),
    path('me/', TutorMeView.as_view(), name='tutor-me'),
]
