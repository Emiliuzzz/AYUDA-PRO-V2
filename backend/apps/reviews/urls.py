from django.urls import path
from reviews.views.review_views import ReviewCreateView

urlpatterns = [
    path('', ReviewCreateView.as_view(), name='review-create'),
]
