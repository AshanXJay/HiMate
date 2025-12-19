from rest_framework import generics, permissions, views
from rest_framework.response import Response
from .models import MaintenanceTicket
from .serializers import MaintenanceTicketSerializer
from users.models import CustomUser
from housing.models import Room
from allocation.models import Allocation

class MaintenanceTicketCreateView(generics.CreateAPIView):
    serializer_class = MaintenanceTicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

class DashboardStatsView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        student_count = CustomUser.objects.filter(role=CustomUser.Role.STUDENT).count()
        allocation_count = Allocation.objects.count()
        available_rooms_count = Room.objects.filter(status=Room.Status.AVAILABLE).count()
        
        return Response({
            "student_count": student_count,
            "allocation_count": allocation_count,
            "available_rooms_count": available_rooms_count
        })
