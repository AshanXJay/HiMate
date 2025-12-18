from django.db import models
from django.conf import settings
from housing.models import Room

class Allocation(models.Model):
    student = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='allocation')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='allocations')
    semester = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.student.username} -> {self.room}"
