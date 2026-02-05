from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import StudentProfile
from student_requests.models import HostelRequest, HostelRequestStatus
from housing.models import Hostel, Room, Bed
from datetime import time
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Populates the database with demo students and requests for allocation demonstration'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('Creating/Resetting demo data...'))

        # 1. Create Data for "The Morning Larks" (Group A - Compatible)
        # ----------------------------------------------------------------
        # These 4 students should match perfectly:
        # - Wake up: 05:00 - 06:00
        # - Cleanliness: High (5)
        # - Light Sensitivity: No (False) - or all True
        # Emails format: cst2200X (matches regex for Batch 22)
        larks_data = [
            ("cst22001@std.uwu.ac.lk", "Kamal Lark", "UWU/CST/22/001", time(5, 30), False, 5, 2, 4), # Leader
            ("cst22002@std.uwu.ac.lk", "Nimal Lark", "UWU/CST/22/002", time(6, 0), False, 5, 2, 2),  # Follower
            ("cst22003@std.uwu.ac.lk", "Sunil Lark", "UWU/CST/22/003", time(5, 45), False, 4, 3, 3),
            ("cst22004@std.uwu.ac.lk", "Amal Lark", "UWU/CST/22/004", time(6, 0), False, 5, 1, 2),
        ]

        # 2. Create Data for "The Night Owls" (Group B - Compatible)
        # ----------------------------------------------------------------
        # These 4 students should match perfectly:
        # - Wake up: 09:00 - 10:00
        # - Cleanliness: Low/Avg (2-3)
        # - Light Sensitivity: Yes (True) - all need darkness
        owls_data = [
            ("cst22005@std.uwu.ac.lk", "Kasun Owl", "UWU/CST/22/005", time(9, 30), True, 2, 5, 5), # High Guest Tolerance
            ("cst22006@std.uwu.ac.lk", "Dasun Owl", "UWU/CST/22/006", time(10, 0), True, 3, 4, 2),
            ("cst22007@std.uwu.ac.lk", "Pasun Owl", "UWU/CST/22/007", time(9, 45), True, 2, 5, 3),
            ("cst22008@std.uwu.ac.lk", "Nuwan Owl", "UWU/CST/22/008", time(10, 15), True, 3, 4, 2),
        ]

        # 3. Create Data for "The Mixed Group" (Group C - Mix but compatible enough)
        # ----------------------------------------------------------------
        mixed_data = [
            ("cst22009@std.uwu.ac.lk", "Shehan Mix", "UWU/CST/22/009", time(7, 30), False, 3, 3, 3),
            ("cst22010@std.uwu.ac.lk", "Lahiru Mix", "UWU/CST/22/010", time(8, 0), False, 4, 3, 2),
            ("cst22011@std.uwu.ac.lk", "Kavindu Mix", "UWU/CST/22/011", time(7, 45), False, 3, 4, 3),
            ("cst22012@std.uwu.ac.lk", "Hesh Mix", "UWU/CST/22/012", time(7, 30), False, 3, 3, 3),
            # Extra students to test overflow or smaller rooms
            ("cst22013@std.uwu.ac.lk", "Extra One", "UWU/CST/22/013", time(8, 0), False, 3, 3, 3),
            ("cst22014@std.uwu.ac.lk", "Extra Two", "UWU/CST/22/014", time(8, 0), False, 3, 3, 3),
        ]

        # Process all groups
        all_students = larks_data + owls_data + mixed_data
        
        created_count = 0
        req_count = 0

        for email, name, enrollment, wake, dark, clean, guest, dom in all_students:
            # 1. Create User
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email.split('@')[0],
                    'first_name': name.split()[0],
                    'last_name': name.split()[1] if len(name.split()) > 1 else '',
                    'role': User.Role.STUDENT,
                    'gender': User.Gender.MALE, # All male for this demo batch
                    'is_profile_complete': True
                }
            )
            
            if created:
                user.set_password('student123')
                user.save()
            
            # 2. Update/Create Profile
            # Check for conflicting enrollment number on OTHER users
            conflicting_profile = StudentProfile.objects.filter(enrollment_number=enrollment).exclude(user=user).first()
            if conflicting_profile:
                print(f"Deleting conflicting user {conflicting_profile.user.email} for enrollment {enrollment}")
                conflicting_profile.user.delete()

            # Use only 'user' for lookup to avoid OneToOne constraint violation
            # Provide enrollment in defaults so CREATE works
            profile, created = StudentProfile.objects.get_or_create(
                user=user,
                defaults={'enrollment_number': enrollment}
            )
            
            # Now update all fields ensures latest data is applied
            profile.enrollment_number = enrollment
            profile.full_name = name
            profile.wake_up_time = wake
            profile.requires_darkness = dark
            profile.cleanliness = clean
            profile.guest_tolerance = guest
            profile.dominance = dom
            profile.batch = "22" # Set explicit batch
            profile.save()

            # 3. Create Pending Hostel Request
            # Check if active request exists
            if not HostelRequest.objects.filter(student=user, status=HostelRequestStatus.PENDING).exists():
                request = HostelRequest.objects.create(
                    student=user,
                    reason="I live far from university.",
                    status=HostelRequestStatus.PENDING
                )
                req_count += 1
            
            created_count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully processed {created_count} students'))
        self.stdout.write(self.style.SUCCESS(f'Created {req_count} new hostel requests'))

        # Ensure we have a Male Hostel for Batch 22 with enough rooms
        hostel, _ = Hostel.objects.get_or_create(
            name="Demo Boys Hostel (Batch 22)",
            defaults={
                'gender_type': Hostel.GenderType.MALE,
                'caretaker_name': "Mr. Perera",
                'allocated_batches': "22"
            }
        )
        
        # Ensure rooms exist
        if hostel.rooms.count() < 5:
            self.stdout.write("Generating rooms for demo hostel...")
            # Create 5 rooms with 4 beds each
            for i in range(1, 6):
                room_num = f"10{i}"
                room, _ = Room.objects.get_or_create(
                    hostel=hostel,
                    room_number=room_num,
                    defaults={'capacity': 4, 'floor': 1}
                )
                # Create beds
                for char in ['A', 'B', 'C', 'D']:
                    Bed.objects.get_or_create(room=room, bed_number=char)
        
        self.stdout.write(self.style.SUCCESS(f'Hostel "{hostel.name}" is ready with rooms'))
