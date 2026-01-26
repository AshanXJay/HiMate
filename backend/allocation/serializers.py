from rest_framework import serializers
from .models import Allocation
from housing.serializers import RoomSerializer, BedSerializer
from users.serializers import UserSerializer

class AllocationSerializer(serializers.ModelSerializer):
    room = RoomSerializer(read_only=True)
    bed = BedSerializer(read_only=True)
    student = UserSerializer(read_only=True)
    hostel_name = serializers.SerializerMethodField()
    hostel_location = serializers.SerializerMethodField()
    roommates = serializers.SerializerMethodField()
    
    class Meta:
        model = Allocation
        fields = ['id', 'student', 'room', 'bed', 'semester', 'allocated_at',
                  'hostel_name', 'hostel_location', 'roommates']
    
    def get_hostel_name(self, obj):
        return obj.room.hostel.name if obj.room else None
    
    def get_hostel_location(self, obj):
        if obj.room and obj.room.hostel:
            hostel = obj.room.hostel
            return {
                'latitude': float(hostel.latitude) if hostel.latitude else None,
                'longitude': float(hostel.longitude) if hostel.longitude else None,
                'address': hostel.address
            }
        return None
    
    def get_roommates(self, obj):
        """Get other students in the same room"""
        if not obj.room:
            return []
        
        roommates = Allocation.objects.filter(
            room=obj.room
        ).exclude(
            student=obj.student
        ).select_related('student__profile', 'bed')
        
        return [
            {
                'name': r.student.profile.full_name if hasattr(r.student, 'profile') else r.student.username,
                'enrollment': r.student.profile.enrollment_number if hasattr(r.student, 'profile') else None,
                'bed': r.bed.bed_number if r.bed else None
            }
            for r in roommates
        ]

class AllocationPreviewSerializer(serializers.Serializer):
    male = serializers.DictField()
    female = serializers.DictField()
