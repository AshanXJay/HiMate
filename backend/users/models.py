from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver
import re

class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'STUDENT', 'Student'
        WARDEN = 'WARDEN', 'Warden'

    class Gender(models.TextChoices):
        MALE = 'MALE', 'Male'
        FEMALE = 'FEMALE', 'Female'

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.STUDENT)
    gender = models.CharField(max_length=10, choices=Gender.choices, default=Gender.MALE)
    is_profile_complete = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'role', 'gender']

    def __str__(self):
        return self.email

class StudentProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=200, blank=True)
    enrollment_number = models.CharField(max_length=50, blank=True, unique=True)
    
    # Survey Data
    wake_up_time = models.TimeField(null=True, blank=True)
    requires_darkness = models.BooleanField(default=False)
    cleanliness = models.IntegerField(default=3)  # Scale 1-5
    guest_tolerance = models.IntegerField(default=3)  # Scale 1-5
    dominance = models.IntegerField(default=3)  # Scale 1-5

    def __str__(self):
        return f"{self.enrollment_number} ({self.user.username})"

@receiver(post_save, sender=CustomUser)
def create_student_profile(sender, instance, created, **kwargs):
    if created and instance.role == CustomUser.Role.STUDENT:
        # Generic parsing logic
        # Email format: degYrNum@std.uwu.ac.lk -> cst21045@std.uwu.ac.lk
        email = instance.email
        profile = StudentProfile.objects.create(user=instance)
        
        # Regex to parse UWU email
        match = re.search(r'^([a-zA-Z]{3,4})(\d{2})(\d{3})@std\.uwu\.ac\.lk$', email)
        if match:
            deg = match.group(1).upper()
            yr = match.group(2)
            num = match.group(3)
            # Format: UWU/DEG/YR/NUM
            enrollment = f"UWU/{deg}/{yr}/{num}"
            profile.enrollment_number = enrollment
            profile.full_name = instance.username # Default to username if no name
            profile.save()
            print(f"Generated Enrollment: {enrollment}")
