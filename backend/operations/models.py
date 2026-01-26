from django.db import models
from django.conf import settings
from housing.models import Room

class MaintenanceTicket(models.Model):
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        VIEWED = 'VIEWED', 'Viewed'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        WAITING_PARTS = 'WAITING_PARTS', 'Waiting for Parts'
        RESOLVED = 'RESOLVED', 'Resolved'
        CLOSED = 'CLOSED', 'Closed'
    
    class Category(models.TextChoices):
        WIFI = 'WIFI', 'WiFi'
        PLUMBING = 'PLUMBING', 'Plumbing'
        ELECTRICAL = 'ELECTRICAL', 'Electrical'
        FURNITURE = 'FURNITURE', 'Furniture'
        CLEANING = 'CLEANING', 'Cleaning'
        AC_FAN = 'AC_FAN', 'AC/Fan'
        DOOR_LOCK = 'DOOR_LOCK', 'Door/Lock'
        OTHER = 'OTHER', 'Other'
    
    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        URGENT = 'URGENT', 'Urgent'

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tickets')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='tickets', null=True, blank=True)
    
    category = models.CharField(max_length=20, choices=Category.choices)
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    title = models.CharField(max_length=200, default='Maintenance Issue')
    description = models.TextField()
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    
    # Warden/Staff feedback
    feedback = models.TextField(blank=True, help_text="Response or feedback from maintenance staff")
    assigned_to = models.CharField(max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"#{self.id} {self.category} - {self.status}"
