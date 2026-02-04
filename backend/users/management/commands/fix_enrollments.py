"""
Management command to fix empty enrollment numbers in the database.
"""
import uuid
import re
from django.core.management.base import BaseCommand
from users.models import StudentProfile, CustomUser


class Command(BaseCommand):
    help = 'Fix empty or duplicate enrollment numbers in StudentProfile'

    def handle(self, *args, **options):
        # Find profiles with empty enrollment_number
        empty_profiles = StudentProfile.objects.filter(enrollment_number='')
        
        self.stdout.write(f"Found {empty_profiles.count()} profiles with empty enrollment numbers")
        
        for profile in empty_profiles:
            user = profile.user
            email = user.email
            
            # Try to generate from email
            match = re.search(r'^([a-zA-Z]{2,4})(\d{2})(\d{3})@std\.uwu\.ac\.lk$', email)
            if match:
                deg = match.group(1).upper()
                yr = match.group(2)
                num = match.group(3)
                enrollment = f"UWU/{deg}/{yr}/{num}"
                profile.batch = yr
            else:
                # Fallback: Generate unique ID
                short_id = str(uuid.uuid4())[:8].upper()
                enrollment = f"UWU/GEN/{short_id}"
            
            # Ensure uniqueness
            while StudentProfile.objects.filter(enrollment_number=enrollment).exclude(pk=profile.pk).exists():
                short_id = str(uuid.uuid4())[:8].upper()
                enrollment = f"UWU/GEN/{short_id}"
            
            profile.enrollment_number = enrollment
            profile.save()
            self.stdout.write(self.style.SUCCESS(f"Fixed: {user.email} -> {enrollment}"))
        
        # Also create profiles for students who don't have one
        students_without_profile = CustomUser.objects.filter(
            role=CustomUser.Role.STUDENT
        ).exclude(
            id__in=StudentProfile.objects.values_list('user_id', flat=True)
        )
        
        self.stdout.write(f"Found {students_without_profile.count()} students without profiles")
        
        for user in students_without_profile:
            email = user.email
            
            match = re.search(r'^([a-zA-Z]{2,4})(\d{2})(\d{3})@std\.uwu\.ac\.lk$', email)
            if match:
                deg = match.group(1).upper()
                yr = match.group(2)
                num = match.group(3)
                enrollment = f"UWU/{deg}/{yr}/{num}"
                batch = yr
            else:
                short_id = str(uuid.uuid4())[:8].upper()
                enrollment = f"UWU/GEN/{short_id}"
                batch = ''
            
            # Ensure uniqueness
            while StudentProfile.objects.filter(enrollment_number=enrollment).exists():
                short_id = str(uuid.uuid4())[:8].upper()
                enrollment = f"UWU/GEN/{short_id}"
            
            StudentProfile.objects.create(
                user=user,
                enrollment_number=enrollment,
                full_name=user.get_full_name() or user.username,
                batch=batch
            )
            self.stdout.write(self.style.SUCCESS(f"Created profile: {user.email} -> {enrollment}"))
        
        self.stdout.write(self.style.SUCCESS('Done!'))
