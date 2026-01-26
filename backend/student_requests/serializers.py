from rest_framework import serializers
from .models import HostelRequest, SwapRequest, OutPass, StatusHistory, RequestStatus
from users.models import StudentProfile
import uuid

class StatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = StatusHistory
        fields = ['id', 'content_type', 'object_id', 'old_status', 'new_status', 
                  'changed_by', 'changed_by_name', 'notes', 'created_at']
    
    def get_changed_by_name(self, obj):
        if obj.changed_by:
            if hasattr(obj.changed_by, 'profile'):
                return obj.changed_by.profile.full_name or obj.changed_by.username
            return obj.changed_by.username
        return 'System'

class HostelRequestSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_enrollment = serializers.SerializerMethodField()
    status_history = serializers.SerializerMethodField()
    
    class Meta:
        model = HostelRequest
        fields = ['id', 'student', 'student_name', 'student_enrollment', 
                  'academic_year', 'semester', 'status', 'reason', 
                  'created_at', 'updated_at', 'status_history']
        read_only_fields = ['student', 'status', 'created_at', 'updated_at']
    
    def get_student_name(self, obj):
        if hasattr(obj.student, 'profile'):
            return obj.student.profile.full_name or obj.student.username
        return obj.student.username
    
    def get_student_enrollment(self, obj):
        if hasattr(obj.student, 'profile'):
            return obj.student.profile.enrollment_number
        return None
    
    def get_status_history(self, obj):
        history = StatusHistory.objects.filter(
            content_type='hostel_request',
            object_id=obj.id
        )
        return StatusHistorySerializer(history, many=True).data

class SwapRequestSerializer(serializers.ModelSerializer):
    student_a_name = serializers.SerializerMethodField()
    student_b_name = serializers.SerializerMethodField()
    student_a_room = serializers.SerializerMethodField()
    student_b_room = serializers.SerializerMethodField()
    status_history = serializers.SerializerMethodField()
    
    class Meta:
        model = SwapRequest
        fields = ['id', 'student_a', 'student_b', 'student_b_enrollment',
                  'student_a_name', 'student_b_name', 'student_a_room', 'student_b_room',
                  'reason', 'student_b_agreed', 'student_b_response_at',
                  'status', 'warden_notes', 'created_at', 'updated_at', 'status_history']
        read_only_fields = ['student_a', 'student_b', 'status', 'student_b_agreed', 
                           'student_b_response_at', 'warden_notes', 'created_at', 'updated_at']
    
    def get_student_a_name(self, obj):
        if hasattr(obj.student_a, 'profile'):
            return obj.student_a.profile.full_name or obj.student_a.username
        return obj.student_a.username
    
    def get_student_b_name(self, obj):
        if hasattr(obj.student_b, 'profile'):
            return obj.student_b.profile.full_name or obj.student_b.username
        return obj.student_b.username
    
    def get_student_a_room(self, obj):
        if hasattr(obj.student_a, 'allocation'):
            alloc = obj.student_a.allocation
            return f"{alloc.room.hostel.name} - {alloc.room.room_number}"
        return None
    
    def get_student_b_room(self, obj):
        if hasattr(obj.student_b, 'allocation'):
            alloc = obj.student_b.allocation
            return f"{alloc.room.hostel.name} - {alloc.room.room_number}"
        return None
    
    def get_status_history(self, obj):
        history = StatusHistory.objects.filter(
            content_type='swap_request',
            object_id=obj.id
        )
        return StatusHistorySerializer(history, many=True).data
    
    def validate_student_b_enrollment(self, value):
        """Validate that student B exists"""
        try:
            profile = StudentProfile.objects.get(enrollment_number=value)
            return value
        except StudentProfile.DoesNotExist:
            raise serializers.ValidationError("Student with this enrollment number not found.")

class SwapRequestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating swap requests"""
    class Meta:
        model = SwapRequest
        fields = ['student_b_enrollment', 'reason']
    
    def validate_student_b_enrollment(self, value):
        try:
            profile = StudentProfile.objects.get(enrollment_number=value)
            return value
        except StudentProfile.DoesNotExist:
            raise serializers.ValidationError("Student with this enrollment number not found.")
    
    def create(self, validated_data):
        enrollment = validated_data['student_b_enrollment']
        profile = StudentProfile.objects.get(enrollment_number=enrollment)
        validated_data['student_b'] = profile.user
        return super().create(validated_data)

class OutPassSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_enrollment = serializers.SerializerMethodField()
    status_history = serializers.SerializerMethodField()
    days_count = serializers.SerializerMethodField()
    
    class Meta:
        model = OutPass
        fields = ['id', 'student', 'student_name', 'student_enrollment',
                  'leave_date', 'return_date', 'days_count', 'reason', 
                  'destination', 'emergency_contact', 'status', 
                  'warden_notes', 'approved_at', 'verification_code',
                  'created_at', 'updated_at', 'status_history']
        read_only_fields = ['student', 'status', 'warden_notes', 'approved_at', 
                           'verification_code', 'created_at', 'updated_at']
    
    def get_student_name(self, obj):
        if hasattr(obj.student, 'profile'):
            return obj.student.profile.full_name or obj.student.username
        return obj.student.username
    
    def get_student_enrollment(self, obj):
        if hasattr(obj.student, 'profile'):
            return obj.student.profile.enrollment_number
        return None
    
    def get_days_count(self, obj):
        return (obj.return_date - obj.leave_date).days + 1
    
    def get_status_history(self, obj):
        history = StatusHistory.objects.filter(
            content_type='outpass',
            object_id=obj.id
        )
        return StatusHistorySerializer(history, many=True).data

class OutPassCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating outpass requests"""
    class Meta:
        model = OutPass
        fields = ['leave_date', 'return_date', 'reason', 'destination', 'emergency_contact']
    
    def validate(self, data):
        if data['return_date'] < data['leave_date']:
            raise serializers.ValidationError("Return date must be after leave date.")
        return data
