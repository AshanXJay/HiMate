from django.db import models
from django.conf import settings
from housing.models import Room, Bed

class Allocation(models.Model):
    student = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='allocation')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='allocations')
    bed = models.OneToOneField(Bed, on_delete=models.SET_NULL, null=True, blank=True, related_name='allocation')
    semester = models.CharField(max_length=50)
    allocated_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def __str__(self):
        bed_info = f" - Bed {self.bed.bed_number}" if self.bed else ""
        return f"{self.student.username} -> {self.room}{bed_info}"
