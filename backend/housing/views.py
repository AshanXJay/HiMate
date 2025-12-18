from rest_framework import generics
from .models import Hostel, Room
from .serializers import HostelSerializer, RoomSerializer

class HostelListView(generics.ListAPIView):
    queryset = Hostel.objects.all()
    serializer_class = HostelSerializer

class HostelRoomsListView(generics.ListAPIView):
    serializer_class = RoomSerializer

    def get_queryset(self):
        hostel_id = self.kwargs['id']
        return Room.objects.filter(hostel_id=hostel_id)
