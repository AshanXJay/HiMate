from rest_framework import serializers
from .models import Hostel, Room, Bed

class BedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bed
        fields = ['id', 'bed_number', 'is_occupied']

class RoomSerializer(serializers.ModelSerializer):
    beds = BedSerializer(many=True, read_only=True)
    hostel_name = serializers.CharField(source='hostel.name', read_only=True)
    
    class Meta:
        model = Room
        fields = ['id', 'hostel', 'hostel_name', 'room_number', 'capacity', 
                  'current_occupancy', 'status', 'floor', 'beds']

class RoomCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating rooms"""
    class Meta:
        model = Room
        fields = ['id', 'hostel', 'room_number', 'capacity', 'status', 'floor']

class HostelSerializer(serializers.ModelSerializer):
    rooms_count = serializers.SerializerMethodField()
    available_beds = serializers.SerializerMethodField()
    batches_list = serializers.SerializerMethodField()
    
    class Meta:
        model = Hostel
        fields = ['id', 'name', 'gender_type', 'caretaker_name', 'allocated_batches',
                  'latitude', 'longitude', 'address', 'rooms_count', 'available_beds', 'batches_list']
    
    def get_rooms_count(self, obj):
        return obj.rooms.count()
    
    def get_available_beds(self, obj):
        from housing.models import Bed
        return Bed.objects.filter(room__hostel=obj, is_occupied=False).count()
    
    def get_batches_list(self, obj):
        return obj.get_batches_list()

class HostelDetailSerializer(HostelSerializer):
    rooms = RoomSerializer(many=True, read_only=True)
    
    class Meta(HostelSerializer.Meta):
        fields = HostelSerializer.Meta.fields + ['rooms']
