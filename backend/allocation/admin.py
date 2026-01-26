from django.contrib import admin
from .models import Allocation

@admin.register(Allocation)
class AllocationAdmin(admin.ModelAdmin):
    list_display = ['student', 'room', 'bed', 'semester', 'allocated_at']
    list_filter = ['semester', 'room__hostel']
    search_fields = ['student__email', 'student__username', 'room__room_number']
    readonly_fields = ['allocated_at']
    raw_id_fields = ['student', 'room', 'bed']
