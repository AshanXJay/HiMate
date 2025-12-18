from rest_framework import generics, permissions
from .models import SwapRequest, OutPass
from .serializers import SwapRequestSerializer, OutPassSerializer

class SwapRequestCreateView(generics.CreateAPIView):
    serializer_class = SwapRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(student_a=self.request.user)

class OutPassCreateView(generics.CreateAPIView):
    serializer_class = OutPassSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)
