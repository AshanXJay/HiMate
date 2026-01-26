from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Hostel, Room, Bed
from .serializers import (
    HostelSerializer, HostelDetailSerializer, 
    RoomSerializer, RoomCreateSerializer, BedSerializer
)

class IsWardenOrReadOnly(permissions.BasePermission):
    """Allow read for all authenticated, write only for warden"""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and (request.user.role == 'WARDEN' or request.user.is_staff)

class HostelViewSet(viewsets.ModelViewSet):
    queryset = Hostel.objects.all()
    permission_classes = [IsWardenOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return HostelDetailSerializer
        return HostelSerializer
    
    @action(detail=True, methods=['get'])
    def rooms(self, request, pk=None):
        """Get all rooms for a specific hostel"""
        hostel = self.get_object()
        rooms = hostel.rooms.all()
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def generate_rooms(self, request, pk=None):
        """Generate rooms and beds for a hostel"""
        hostel = self.get_object()
        num_rooms = int(request.data.get('num_rooms', 10))
        beds_per_room = int(request.data.get('beds_per_room', 4))
        start_floor = int(request.data.get('start_floor', 1))
        
        created_rooms = []
        for i in range(num_rooms):
            floor = start_floor + (i // 10)  # 10 rooms per floor
            room_number = f"{floor}{str((i % 10) + 1).zfill(2)}"  # e.g., 101, 102, etc.
            
            room, created = Room.objects.get_or_create(
                hostel=hostel,
                room_number=room_number,
                defaults={'capacity': beds_per_room, 'floor': floor}
            )
            
            if created:
                # Create beds for the room
                for j in range(beds_per_room):
                    Bed.objects.create(
                        room=room,
                        bed_number=chr(65 + j)  # A, B, C, D, etc.
                    )
                created_rooms.append(room_number)
        
        return Response({
            'message': f'Created {len(created_rooms)} rooms',
            'rooms': created_rooms
        })

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    permission_classes = [IsWardenOrReadOnly]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return RoomCreateSerializer
        return RoomSerializer
    
    def get_queryset(self):
        queryset = Room.objects.all()
        hostel_id = self.request.query_params.get('hostel', None)
        status_filter = self.request.query_params.get('status', None)
        
        if hostel_id:
            queryset = queryset.filter(hostel_id=hostel_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def add_beds(self, request, pk=None):
        """Add beds to a room"""
        room = self.get_object()
        num_beds = int(request.data.get('num_beds', 1))
        existing_count = room.beds.count()
        
        created = []
        for i in range(num_beds):
            bed_number = chr(65 + existing_count + i)
            bed = Bed.objects.create(room=room, bed_number=bed_number)
            created.append(bed.bed_number)
        
        room.capacity = room.beds.count()
        room.save()
        
        return Response({'message': f'Added beds: {created}', 'new_capacity': room.capacity})

# Legacy views for backward compatibility
class HostelListView(generics.ListAPIView):
    queryset = Hostel.objects.all()
    serializer_class = HostelSerializer

class HostelRoomsListView(generics.ListAPIView):
    serializer_class = RoomSerializer

    def get_queryset(self):
        hostel_id = self.kwargs['id']
        return Room.objects.filter(hostel_id=hostel_id)
