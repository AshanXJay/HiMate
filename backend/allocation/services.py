from users.models import StudentProfile, CustomUser
from housing.models import Room
from allocation.models import Allocation
from django.db import transaction

def calculate_compatibility(student_a, student_b):
    # Placeholder for compatibility logic
    return 50

def run_allocation(semester="Fall 2025"):
    unassigned_students = CustomUser.objects.filter(role=CustomUser.Role.STUDENT, allocation__isnull=True, is_profile_complete=True)
    available_rooms = Room.objects.filter(status=Room.Status.AVAILABLE)
    
    room_iter = iter(available_rooms)
    current_room = next(room_iter, None)
    
    count = 0
    
    # Determine gender of room and student to match?
    # Assuming rooms have gender_type and users have gender.
    
    # Split students by gender
    male_students = unassigned_students.filter(gender=CustomUser.Gender.MALE)
    female_students = unassigned_students.filter(gender=CustomUser.Gender.FEMALE)
    
    # Split rooms by gender
    male_rooms = available_rooms.filter(hostel__gender_type='MALE')  # Assuming hostel has gender_type
    female_rooms = available_rooms.filter(hostel__gender_type='FEMALE')

    def allocate_list(students, rooms):
        c = 0
        r_iter = iter(rooms)
        cur_room = next(r_iter, None)
        if not cur_room: return 0
        
        for s in students:
            if cur_room.current_occupancy >= cur_room.capacity:
                cur_room.status = Room.Status.FULL
                cur_room.save()
                cur_room = next(r_iter, None)
                if not cur_room: break
            
            Allocation.objects.create(student=s, room=cur_room, semester=semester)
            cur_room.current_occupancy += 1
            c += 1
        
        if cur_room:
            if cur_room.current_occupancy >= cur_room.capacity:
                cur_room.status = Room.Status.FULL
            cur_room.save()
        return c

    with transaction.atomic():
        count += allocate_list(male_students, male_rooms)
        count += allocate_list(female_students, female_rooms)
        
    return count
