from rest_framework import views, generics, permissions, status
from rest_framework.response import Response
from .models import Allocation
from .serializers import AllocationSerializer
from .services import run_allocation
from django.shortcuts import get_object_or_404

class RunAllocationView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        count = run_allocation()
        return Response({"message": f"Allocated {count} students"}, status=status.HTTP_200_OK)

class MyRoomView(generics.RetrieveAPIView):
    serializer_class = AllocationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return get_object_or_404(Allocation, student=self.request.user)
