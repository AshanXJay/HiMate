from django.db import models

class Hostel(models.Model):
    class GenderType(models.TextChoices):
        MALE = 'MALE', 'Male'
        FEMALE = 'FEMALE', 'Female'

    name = models.CharField(max_length=100)
    gender_type = models.CharField(max_length=10, choices=GenderType.choices)
    caretaker_name = models.CharField(max_length=100)
    
    # New fields for batch allocation and location
    allocated_batches = models.CharField(max_length=50, blank=True, help_text="Comma-separated batch years, e.g., '21,22,23'")
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    address = models.TextField(blank=True)

    def __str__(self):
        return self.name
    
    def get_batches_list(self):
        """Returns list of batch years"""
        if self.allocated_batches:
            return [b.strip() for b in self.allocated_batches.split(',')]
        return []

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
    floor = models.IntegerField(default=1)

    class Meta:
        unique_together = ('hostel', 'room_number')
        ordering = ['hostel', 'room_number']

    def __str__(self):
        return f"{self.hostel.name} - {self.room_number}"
    
    def update_occupancy(self):
        """Update current occupancy based on allocated beds"""
        self.current_occupancy = self.beds.filter(is_occupied=True).count()
        if self.current_occupancy >= self.capacity:
            self.status = self.Status.FULL
        elif self.current_occupancy > 0:
            self.status = self.Status.AVAILABLE
        self.save()

class Bed(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='beds')
    bed_number = models.CharField(max_length=10)  # e.g., "A", "B", "C", "D" or "1", "2", "3", "4"
    is_occupied = models.BooleanField(default=False)

    class Meta:
        unique_together = ('room', 'bed_number')
        ordering = ['room', 'bed_number']

    def __str__(self):
        return f"{self.room} - Bed {self.bed_number}"
