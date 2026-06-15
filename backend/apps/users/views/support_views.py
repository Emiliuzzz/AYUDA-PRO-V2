from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from users.models.support import SupportTicket
from rest_framework import serializers

class SupportTicketSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    user_id = serializers.ReadOnlyField(source='user.id')
    class Meta:
        model = SupportTicket
        fields = ['id', 'user_id', 'username', 'subject', 'message', 'status', 'created_at']
        read_only_fields = ['status', 'created_at']

class SupportTicketView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role == 'ADMIN' or request.user.is_superuser:
            tickets = SupportTicket.objects.all()
        else:
            tickets = SupportTicket.objects.filter(user=request.user)
        serializer = SupportTicketSerializer(tickets, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SupportTicketSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
