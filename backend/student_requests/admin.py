from django.contrib import admin
from .models import HostelRequest, SwapRequest, OutPass, StatusHistory

@admin.register(HostelRequest)
class HostelRequestAdmin(admin.ModelAdmin):
    list_display = ['student', 'semester', 'status', 'created_at']
    list_filter = ['status', 'semester']
    search_fields = ['student__email', 'student__username']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(SwapRequest)
class SwapRequestAdmin(admin.ModelAdmin):
    list_display = ['student_a', 'student_b', 'status', 'student_b_agreed', 'created_at']
    list_filter = ['status', 'student_b_agreed']
    search_fields = ['student_a__email', 'student_b__email']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(OutPass)
class OutPassAdmin(admin.ModelAdmin):
    list_display = ['student', 'leave_date', 'return_date', 'status', 'verification_code']
    list_filter = ['status']
    search_fields = ['student__email', 'verification_code']
    readonly_fields = ['created_at', 'updated_at', 'verification_code']

@admin.register(StatusHistory)
class StatusHistoryAdmin(admin.ModelAdmin):
    list_display = ['content_type', 'object_id', 'old_status', 'new_status', 'changed_by', 'created_at']
    list_filter = ['content_type']
    readonly_fields = ['created_at']
