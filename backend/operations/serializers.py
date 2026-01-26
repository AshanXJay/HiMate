from rest_framework import serializers
from .models import MaintenanceTicket
from student_requests.models import StatusHistory

class StatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = StatusHistory
        fields = ['id', 'old_status', 'new_status', 'changed_by_name', 'notes', 'created_at']
    
    def get_changed_by_name(self, obj):
        if obj.changed_by:
            if hasattr(obj.changed_by, 'profile'):
                return obj.changed_by.profile.full_name or obj.changed_by.username
            return obj.changed_by.username
        return 'System'

class MaintenanceTicketSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_enrollment = serializers.SerializerMethodField()
    room_info = serializers.SerializerMethodField()
    status_history = serializers.SerializerMethodField()
    
    class Meta:
        model = MaintenanceTicket
        fields = ['id', 'student', 'student_name', 'student_enrollment',
                  'room', 'room_info', 'category', 'priority', 'title', 
                  'description', 'status', 'feedback', 'assigned_to',
                  'created_at', 'updated_at', 'resolved_at', 'status_history']
        read_only_fields = ['student', 'status', 'feedback', 'assigned_to', 
                           'created_at', 'updated_at', 'resolved_at']
    
    def get_student_name(self, obj):
        if hasattr(obj.student, 'profile'):
            return obj.student.profile.full_name or obj.student.username
        return obj.student.username
    
    def get_student_enrollment(self, obj):
        if hasattr(obj.student, 'profile'):
            return obj.student.profile.enrollment_number
        return None
    
    def get_room_info(self, obj):
        if obj.room:
            return {
                'id': obj.room.id,
                'room_number': obj.room.room_number,
                'hostel': obj.room.hostel.name
            }
        # Try to get from student's allocation
        if hasattr(obj.student, 'allocation'):
            alloc = obj.student.allocation
            return {
                'id': alloc.room.id,
                'room_number': alloc.room.room_number,
                'hostel': alloc.room.hostel.name
            }
        return None
    
    def get_status_history(self, obj):
        history = StatusHistory.objects.filter(
            content_type='ticket',
            object_id=obj.id
        )
        return StatusHistorySerializer(history, many=True).data

class MaintenanceTicketCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating tickets"""
    class Meta:
        model = MaintenanceTicket
        fields = ['category', 'priority', 'title', 'description']

class MaintenanceTicketUpdateSerializer(serializers.ModelSerializer):
    """Serializer for warden updating tickets"""
    class Meta:
        model = MaintenanceTicket
        fields = ['status', 'feedback', 'assigned_to', 'priority']
