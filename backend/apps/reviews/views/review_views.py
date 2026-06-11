from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.core.exceptions import ValidationError
from reviews.models import Review
from reviews.serializers.review_serializers import ReviewSerializer, ReviewCreateSerializer
from reviews.services.review_services import review_create

class ReviewCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ReviewCreateSerializer

    def post(self, request):
        serializer = ReviewCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        try:
            review = review_create(**serializer.validated_data)
            return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
