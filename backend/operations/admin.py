from django.contrib import admin
from .models import MaintenanceTicket

@admin.register(MaintenanceTicket)
class MaintenanceTicketAdmin(admin.ModelAdmin):
    list_display = ['id', 'category', 'priority', 'title', 'status', 'student', 'created_at']
    list_filter = ['status', 'category', 'priority']
    search_fields = ['title', 'description', 'student__email']
    readonly_fields = ['created_at', 'updated_at', 'resolved_at']
    
    fieldsets = (
        ('Ticket Info', {
            'fields': ('student', 'room', 'category', 'priority', 'title', 'description')
        }),
        ('Status', {
            'fields': ('status', 'feedback', 'assigned_to')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'resolved_at'),
            'classes': ('collapse',)
        }),
    )
