from users.models import StudentProfile, CustomUser
from housing.models import Room, Bed, Hostel
from allocation.models import Allocation
from student_requests.models import HostelRequest, RequestStatus
from django.db import transaction
from django.db.models import Q
from datetime import datetime, timedelta
import math
import re

# Algorithm Weights (from methodology)
WEIGHT_CLEANLINESS = 3.0 
WEIGHT_GUEST_TOLERANCE = 2.0
WEIGHT_DOMINANCE = 1.5

# Thresholds
SLEEP_TIME_THRESHOLD_HOURS = 2  # Max difference in sleep onset
DOMINANCE_SUM_THRESHOLD = 8  # Two alphas threshold (5+5 = 10, penalize if > 8)
DOMINANCE_PENALTY = 15  # Penalty for two dominant personalities

def parse_time_to_hours(time_obj):
    """Convert time object to hours (0-24 scale)"""
    if time_obj is None:
        return 6.0 
    return time_obj.hour + time_obj.minute / 60.0

def get_student_batch(user):
    """Extract batch year from email (e.g., cst22001@std.uwu.ac.lk -> '22')"""
    email = user.email
    match = re.search(r'^[a-zA-Z]{3,4}(\d{2})\d{3}@std\.uwu\.ac\.lk$', email)
    if match:
        return match.group(1)
    return None

def tier1_biological_filter(profile_a, profile_b):
    # Check chronotype compatibility (sleep schedule)
    time_a = parse_time_to_hours(profile_a.wake_up_time)
    time_b = parse_time_to_hours(profile_b.wake_up_time)
    
    sleep_diff = abs(time_a - time_b)
    if sleep_diff > SLEEP_TIME_THRESHOLD_HOURS:
        return False
    
    # Check light sensitivity (photophobia)
    if profile_a.requires_darkness and not profile_b.requires_darkness:
        pass 
    
    if profile_b.requires_darkness and not profile_a.requires_darkness:
        pass
    
    return True

def tier2_behavioral_score(profile_a, profile_b):
    """
    Weighted Euclidean Distance
    D = sqrt(W_clean*(A_clean - B_clean)² + W_guest*(A_guest - B_guest)²)
    """
    clean_diff = profile_a.cleanliness - profile_b.cleanliness
    guest_diff = profile_a.guest_tolerance - profile_b.guest_tolerance
    
    distance = math.sqrt(
        WEIGHT_CLEANLINESS * (clean_diff ** 2) +
        WEIGHT_GUEST_TOLERANCE * (guest_diff ** 2)
    )
    
    # Add penalty for light sensitivity mismatch
    if profile_a.requires_darkness != profile_b.requires_darkness:
        distance += 5.0
    
    return distance

def tier3_social_adjustment(profile_a, profile_b, base_score):
    dominance_sum = profile_a.dominance + profile_b.dominance
    
    # Penalize two alphas (high dominance sum)
    if dominance_sum > DOMINANCE_SUM_THRESHOLD:
        return base_score + DOMINANCE_PENALTY
    
    # Slight reward for complementary pairs (one high, one low)
    dominance_diff = abs(profile_a.dominance - profile_b.dominance)
    if dominance_diff >= 2:
        return base_score - 2.0 
    
    return base_score

def calculate_compatibility(student_a, student_b):
    try:
        profile_a = student_a.profile
        profile_b = student_b.profile
    except StudentProfile.DoesNotExist:
        return None  
    
    # Tier 1: Hard constraints
    if not tier1_biological_filter(profile_a, profile_b):
        return None  # Incompatible - never match
    
    # Tier 2: Calculate behavioral distance
    base_score = tier2_behavioral_score(profile_a, profile_b)
    
    # Tier 3: Social adjustment
    final_score = tier3_social_adjustment(profile_a, profile_b, base_score)
    
    return final_score

def find_best_matches(students, max_per_group=4):
    if len(students) < 2:
        return [[s] for s in students]
    
    # Calculate all pairwise compatibility scores
    students = list(students)
    n = len(students)
    scores = {}
    
    for i in range(n):
        for j in range(i + 1, n):
            score = calculate_compatibility(students[i], students[j])
            if score is not None:
                scores[(i, j)] = score
    
    # Sort pairs by compatibility (lower score = better)
    sorted_pairs = sorted(scores.items(), key=lambda x: x[1])
    
    # Greedy grouping
    assigned = set()
    groups = []
    
    for (i, j), score in sorted_pairs:
        if i in assigned or j in assigned:
            continue
        
        # Start a new group with this compatible pair
        group = [students[i], students[j]]
        assigned.add(i)
        assigned.add(j)
        
        # Try to add more compatible students to fill the room
        if max_per_group > 2:
            for k in range(n):
                if k in assigned or len(group) >= max_per_group:
                    continue
                
                # Check if this student is compatible with all in group
                compatible = True
                total_score = 0
                for member_idx, member in enumerate(group):
                    pair_key = (min(k, students.index(member)), max(k, students.index(member)))
                    if pair_key in scores:
                        total_score += scores[pair_key]
                    else:
                        compatible = False
                        break
                
                if compatible and total_score / len(group) < 20:  # Average score threshold
                    group.append(students[k])
                    assigned.add(k)
        
        groups.append(group)
    
    # Handle remaining unassigned students
    unassigned = [students[i] for i in range(n) if i not in assigned]
    if unassigned:
        # Group remaining students together (less optimal but necessary)
        while unassigned:
            group = unassigned[:max_per_group]
            unassigned = unassigned[max_per_group:]
            groups.append(group)
    
    return groups

def get_eligible_students(semester, gender=None, batch=None):
    from student_requests.models import HostelRequest, HostelRequestStatus
    
    # Get students who have a pending hostel request
    pending_request_students = HostelRequest.objects.filter(
        status=HostelRequestStatus.PENDING
    ).values_list('student_id', flat=True)
    
    queryset = CustomUser.objects.filter(
        role=CustomUser.Role.STUDENT,
        allocation__isnull=True,
        is_profile_complete=True,
        id__in=pending_request_students
    )
    
    if gender:
        queryset = queryset.filter(gender=gender)
    
    # Filter by batch if specified
    if batch:
        queryset = queryset.filter(email__regex=rf'^[a-zA-Z]{{3,4}}{batch}\d{{3}}@std\.uwu\.ac\.lk$')
    
    return queryset

def get_suitable_hostel(student, semester):
    batch = get_student_batch(student)
    gender = student.gender
    
    # Find hostels matching gender and batch
    hostels = Hostel.objects.filter(gender_type=gender)
    
    for hostel in hostels:
        batches = hostel.get_batches_list()
        if not batches or batch in batches:
            return hostel
    
    # If no batch-specific hostel, return any gender-matching hostel
    return hostels.first()

def allocate_group_to_room(group, room, semester):
    from student_requests.models import HostelRequest, HostelRequestStatus
    
    available_beds = Bed.objects.filter(room=room, is_occupied=False)[:len(group)]
    
    allocations = []
    for student, bed in zip(group, available_beds):
        allocation = Allocation.objects.create(
            student=student,
            room=room,
            bed=bed,
            semester=semester
        )
        bed.is_occupied = True
        bed.save()
        allocations.append(allocation)
        
        # Update hostel request status to ALLOCATED
        HostelRequest.objects.filter(
            student=student,
            status=HostelRequestStatus.PENDING
        ).update(status=HostelRequestStatus.ALLOCATED)
    
    room.update_occupancy()
    return allocations

def run_allocation(semester=""):
    allocated_count = 0
    
    with transaction.atomic():
        # Process each gender separately
        for gender in [CustomUser.Gender.MALE, CustomUser.Gender.FEMALE]:
            students = get_eligible_students(semester, gender=gender)
            
            if not students.exists():
                continue
            
            # Get suitable hostels for this gender
            hostels = Hostel.objects.filter(gender_type=gender)
            
            # Find optimal roommate groups
            student_groups = find_best_matches(students.all())
            
            for group in student_groups:
                # Find a room with enough available beds
                student = group[0]
                hostel = get_suitable_hostel(student, semester)
                
                if not hostel:
                    continue
                
                # Find room with enough space
                room = Room.objects.filter(
                    hostel=hostel,
                    status__in=[Room.Status.AVAILABLE]
                ).filter(
                    beds__is_occupied=False
                ).distinct().first()
                
                if not room:
                    # Try to find room with any available bed
                    room = Room.objects.filter(
                        hostel=hostel
                    ).filter(
                        beds__is_occupied=False
                    ).distinct().first()
                
                if room:
                    allocations = allocate_group_to_room(group, room, semester)
                    allocated_count += len(allocations)
    
    return allocated_count

def get_allocation_preview(semester=""):
    preview = {
        'male': {'eligible': 0, 'groups': []},
        'female': {'eligible': 0, 'groups': []}
    }
    
    for gender in [CustomUser.Gender.MALE, CustomUser.Gender.FEMALE]:
        students = get_eligible_students(semester, gender=gender)
        gender_key = 'male' if gender == CustomUser.Gender.MALE else 'female'
        
        preview[gender_key]['eligible'] = students.count()
        
        if students.exists():
            groups = find_best_matches(students.all())
            for group in groups:
                group_info = {
                    'students': [
                        {
                            'email': s.email,
                            'enrollment': s.profile.enrollment_number if hasattr(s, 'profile') else None,
                            'name': s.profile.full_name if hasattr(s, 'profile') else s.username
                        }
                        for s in group
                    ],
                    'avg_compatibility': calculate_group_compatibility(group)
                }
                preview[gender_key]['groups'].append(group_info)
    
    return preview

def calculate_group_compatibility(group):
    if len(group) < 2:
        return 0
    
    scores = []
    for i in range(len(group)):
        for j in range(i + 1, len(group)):
            score = calculate_compatibility(group[i], group[j])
            if score is not None:
                scores.append(score)
    
    return sum(scores) / len(scores) if scores else 0
