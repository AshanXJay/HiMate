from django.contrib import admin
from .models import Hostel, Room, Bed

@admin.register(Hostel)
class HostelAdmin(admin.ModelAdmin):
    list_display = ['name', 'gender_type', 'caretaker_name', 'allocated_batches', 'get_rooms_count']
    list_filter = ['gender_type']
    search_fields = ['name', 'caretaker_name']
    
    def get_rooms_count(self, obj):
        return obj.rooms.count()
    get_rooms_count.short_description = 'Rooms'

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['room_number', 'hostel', 'capacity', 'current_occupancy', 'status', 'floor']
    list_filter = ['hostel', 'status', 'floor']
    search_fields = ['room_number', 'hostel__name']

@admin.register(Bed)
class BedAdmin(admin.ModelAdmin):
    list_display = ['bed_number', 'room', 'is_occupied']
    list_filter = ['is_occupied', 'room__hostel']
    search_fields = ['bed_number', 'room__room_number']
