from django.db import models

class Hostel(models.Model):
    class GenderType(models.TextChoices):
        MALE = 'MALE', 'Male'
        FEMALE = 'FEMALE', 'Female'

    name = models.CharField(max_length=100)
    gender_type = models.CharField(max_length=10, choices=GenderType.choices)
    caretaker_name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Room(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Available'
        FULL = 'FULL', 'Full'
        MAINTENANCE = 'MAINTENANCE', 'Maintenance'

    hostel = models.ForeignKey(Hostel, on_delete=models.CASCADE, related_name='rooms')
    room_number = models.CharField(max_length=10)
    capacity = models.IntegerField(default=4)
    current_occupancy = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)

    def __str__(self):
        return f"{self.hostel.name} - {self.room_number}"
