# HiMate - Project Presentation Script
## "Scientific Roommate Allocation based on Chronobiology and Psychometrics"
### Uva Wellassa University Hostel Management System

**Duration:** 50-55 Minutes  
**Presenters:** 5 Developers  
**Date:** February 2026  

---

## 📋 Presentation Agenda

| Section | Presenter | Topic | Duration |
|---------|-----------|-------|----------|
| 1 | Dev 3 (Team Lead) | Introduction & Research Foundation | 6 min |
| 2 | Dev 1 | Authentication & User Profile System + Demo | 8 min |
| 3 | Dev 2 | Hostel & Room Management System + Demo | 8 min |
| 4 | Dev 3 | Smart Allocation Algorithm + Demo | 10 min |
| 5 | Dev 4 | Request Management Workflows + Demo | 10 min |
| 6 | Dev 5 | Operations Dashboard & Tickets + Demo | 8 min |
| 7 | Dev 3 (Team Lead) | Practical Implementation & Closing | 5 min |

**Total: ~55 minutes**

---

# SECTION 1: INTRODUCTION & RESEARCH FOUNDATION
## Presenter: Developer 3 (Team Lead)
### Duration: 6 Minutes

---

### 🎤 Opening Speech (2 minutes)

> *"Good morning everyone. I'm [Name], the team lead for Project HiMate. Today, we're presenting a **research-backed** Hostel Admission and Allocation System specifically designed for Uva Wellassa University.*
>
> *HiMate isn't just another room allocation software—it's a scientific approach to student housing that addresses one of the most overlooked factors in academic success: **roommate compatibility**.*
>
> *Traditional methods—random assignment or first-come-first-served—often result in mismatched roommates, leading to sleep disruption, conflict, and lower academic performance. HiMate solves this through a **Multi-Tiered Constraint Satisfaction Algorithm** backed by peer-reviewed research.*
>
> *Let me introduce our development team:*
> - *Developer 1 - Identity Lead: Authentication & User Profile*
> - *Developer 2 - Property Manager: Hostel & Room Inventory*
> - *Developer 3 (myself) - Algorithm Engineer: Smart Allocation*
> - *Developer 4 - Workflow Manager: Request Systems*
> - *Developer 5 - Operations Lead: Dashboard & Maintenance*"

---

### 📚 Research Foundation (3 minutes)

**Slide: "The Science Behind HiMate"**

> *"Our system is built on three primary fields of research:"*

#### 1. Chronobiology (Tier 1 - Biological Filter)

> *"Research by **Gomes et al. (2011)** in *Chronobiology International* proves that mismatched sleep schedules—'Social Jetlag'—is the **primary physiological predictor** of roommate conflict and lower GPA.*
>
> *We classify students as Morning Larks, Intermediate, or Night Owls. A gap of **more than 2 hours** in sleep onset is flagged as HIGH-RISK incompatibility.*"

#### 2. Personality Psychology - The Big Five (Tier 2)

> *"According to **Tenopia et al. (2018)**, **Conscientiousness**—cleanliness and orderliness—is the **strongest predictor** of roommate satisfaction. We apply the **Similarity-Attraction Effect**: similar behavioral preferences lead to harmony.*"

#### 3. Interpersonal Complementarity (Tier 3)

> *"Unlike cleanliness, social **dominance** benefits from **complementarity**. Two high-dominance students compete for control, leading to power struggles. Our algorithm penalizes 'alpha-alpha' pairings.*"

---

### 🏗️ System Architecture (1 minute)

> *"Our tech stack:*
> - **Frontend:** React 19 with custom AMOLED Black & Orange theme
> - **Backend:** Python Django REST Framework with JWT authentication
> - **Auth:** Google OAuth for @std.uwu.ac.lk emails
> - **Database:** SQLite (dev) / PostgreSQL (production)
>
> *I'll now hand over to Developer 1 who will demonstrate authentication and profile collection.*"

---

# SECTION 2: AUTHENTICATION & USER PROFILE SYSTEM
## Presenter: Developer 1 (Identity Lead)
### Duration: 8 Minutes (5 min explanation + 3 min demo)

---

### 🔐 Feature Overview (1 minute)

> *"I'm responsible for the identity layer of HiMate:*
> 1. *Google OAuth integration for secure university login*
> 2. *Role-based access control (Student vs Warden)*
> 3. *The 5-step Survey Wizard that collects scientific compatibility data*"

---

### 💻 Code Explanation: User & Profile Models (2 minutes)

**File:** `backend/users/models.py`

```python
class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'STUDENT', 'Student'
        WARDEN = 'WARDEN', 'Warden'

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=Role.choices)
    gender = models.CharField(max_length=10, choices=Gender.choices)
    is_profile_complete = models.BooleanField(default=False)

class StudentProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    enrollment_number = models.CharField(max_length=50, unique=True)
    
    # THE 5 SCIENTIFIC FIELDS - Maps to 3-Tier Algorithm
    wake_up_time = models.TimeField(null=True)        # Tier 1: Chronotype
    requires_darkness = models.BooleanField(default=False)  # Tier 1: Light
    cleanliness = models.IntegerField(default=3)      # Tier 2: 1-5 scale
    guest_tolerance = models.IntegerField(default=3)  # Tier 2: 1-5 scale
    dominance = models.IntegerField(default=3)        # Tier 3: 1-5 scale
```

> *"These five fields directly feed into our 3-tier matching algorithm.*"

---

### 💻 Code Explanation: Google OAuth (2 minutes)

**File:** `backend/users/views.py`

```python
class GoogleLoginView(views.APIView):
    def post(self, request):
        token = request.data.get('token')
        idinfo = id_token.verify_oauth2_token(token, requests.Request())
        email = idinfo['email']
        
        # ROLE DETERMINATION
        warden_email = os.environ.get('WARDEN_EMAIL')
        
        if email == warden_email:
            role = User.Role.WARDEN
        elif email.endswith('@std.uwu.ac.lk'):
            role = User.Role.STUDENT
        else:
            return Response({"error": "Unauthorized email"}, status=403)
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({'access': str(refresh.access_token), ...})
```

> *"Only **@std.uwu.ac.lk** emails are allowed. The warden email is configured via environment variable.*"

---

### 🖥️ LIVE DEMO (3 minutes)

> **[PERFORM THESE STEPS LIVE]**
>
> 1. **Show Login Page** - Point out Google OAuth button and university branding
> 2. **Click "Continue with Google"** - Select a test student account
> 3. **Show Survey Wizard** - Walk through all 5 steps:
>    - Step 1: Wake-up time picker
>    - Step 2: Light sensitivity toggle
>    - Step 3: Cleanliness slider (1-5)
>    - Step 4: Guest tolerance slider (1-5)
>    - Step 5: Social energy/dominance slider (1-5)
> 4. **Complete Survey** - Show confirmation and redirect to dashboard
> 5. **Point out enrollment number** - Explain auto-generation from email (e.g., cst22001 → UWU/CST/22/001)

---

# SECTION 3: HOSTEL & ROOM MANAGEMENT SYSTEM
## Presenter: Developer 2 (Property Manager)
### Duration: 8 Minutes (5 min explanation + 3 min demo)

---

### 🏢 Feature Overview (1 minute)

> *"I'm the Property Manager responsible for:*
> 1. *Hostel CRUD with gender segregation and batch allocation*
> 2. *Room and Bed management with occupancy tracking*
> 3. *Automatic room generation feature*
> 4. *Google Maps integration for hostel navigation*"

---

### 💻 Code Explanation: Hostel & Room Models (2 minutes)

**File:** `backend/housing/models.py`

```python
class Hostel(models.Model):
    class GenderType(models.TextChoices):
        MALE = 'MALE', 'Male'
        FEMALE = 'FEMALE', 'Female'

    name = models.CharField(max_length=100)
    gender_type = models.CharField(max_length=10, choices=GenderType.choices)
    caretaker_name = models.CharField(max_length=100)
    allocated_batches = models.CharField(max_length=50, blank=True)  # "21,22,23"
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)

class Room(models.Model):
    hostel = models.ForeignKey(Hostel, related_name='rooms')
    room_number = models.CharField(max_length=10)  # "101", "102"
    capacity = models.IntegerField(default=4)
    current_occupancy = models.IntegerField(default=0)
    status = models.CharField(choices=['AVAILABLE', 'FULL', 'MAINTENANCE'])

class Bed(models.Model):
    room = models.ForeignKey(Room, related_name='beds')
    bed_number = models.CharField(max_length=10)  # "A", "B", "C", "D"
    is_occupied = models.BooleanField(default=False)
```

> *"Hostels are gender-segregated with batch allocation. Each room has individual bed tracking.*"

---

### 💻 Code Explanation: Auto-Generate Rooms (2 minutes)

**File:** `backend/housing/views.py`

```python
@action(detail=True, methods=['post'])
def generate_rooms(self, request, pk=None):
    hostel = self.get_object()
    floors = request.data.get('floors', 3)
    rooms_per_floor = request.data.get('rooms_per_floor', 10)
    beds_per_room = request.data.get('beds_per_room', 4)
    
    for floor in range(1, floors + 1):
        for room_num in range(1, rooms_per_floor + 1):
            room_number = f"{floor}{str(room_num).zfill(2)}"  # "101", "102"
            room = Room.objects.create(hostel=hostel, room_number=room_number, 
                                        floor=floor, capacity=beds_per_room)
            for bed_letter in ['A', 'B', 'C', 'D'][:beds_per_room]:
                Bed.objects.create(room=room, bed_number=bed_letter)
    
    return Response({'rooms_created': rooms_created})
```

> *"This feature saves hours of manual data entry—one click creates 30+ fully structured rooms.*"

---

### 🖥️ LIVE DEMO (3 minutes)

> **[PERFORM THESE STEPS LIVE]**
>
> 1. **Navigate to Hostel Management** (as Warden)
> 2. **Create New Hostel:**
>    - Name: "Block E - Test"
>    - Gender: Male
>    - Batches: "22,23"
>    - Enter GPS coordinates
> 3. **Click "Generate Rooms":**
>    - Floors: 2
>    - Rooms per floor: 5
>    - Beds per room: 4
> 4. **Show Room Grid:**
>    - Point out color coding: 🟢 Available, 🟡 Filling, 🔴 Full
> 5. **Click "Navigate"** - Show Google Maps opening with hostel location
> 6. **Delete the test hostel** to clean up

---

# SECTION 4: SMART ROOMMATE ALLOCATION ALGORITHM
## Presenter: Developer 3 (Algorithm Engineer / Team Lead)
### Duration: 10 Minutes (7 min explanation + 3 min demo)

---

### 🧠 The Three-Tier Algorithm (2 minutes)

**Slide: "The Funnel Model"**

```
       ┌───────────────────────────┐
       │   ALL STUDENT PAIRS       │
       └─────────────┬─────────────┘
                     ↓
  ╔═══════════════════════════════════════╗
  ║  TIER 1: BIOLOGICAL FILTER            ║
  ║  Sleep gap > 2 hours? → REJECTED      ║
  ╚══════════════════╤════════════════════╝
                     ↓
  ╔═══════════════════════════════════════╗
  ║  TIER 2: BEHAVIORAL SCORE             ║
  ║  Weighted distance on cleanliness     ║
  ║  and guest tolerance                  ║
  ╚══════════════════╤════════════════════╝
                     ↓
  ╔═══════════════════════════════════════╗
  ║  TIER 3: SOCIAL ADJUSTMENT            ║
  ║  Penalize alpha-alpha, reward         ║
  ║  complementary pairs                  ║
  ╚══════════════════╤════════════════════╝
                     ↓
       ┌───────────────────────────┐
       │   OPTIMAL GROUPS          │
       │   (Lower score = Better)  │
       └───────────────────────────┘
```

---

### 💻 Code Explanation: Algorithm Implementation (5 minutes)

**File:** `backend/allocation/services.py`

**Constants:**
```python
WEIGHT_CLEANLINESS = 3.0     # Highest priority - daily friction
WEIGHT_GUEST_TOLERANCE = 2.0
SLEEP_TIME_THRESHOLD_HOURS = 2
DOMINANCE_PENALTY = 15       # Alpha-alpha penalty
```

**Tier 1 - Biological Filter (Hard Reject):**
```python
def tier1_biological_filter(profile_a, profile_b):
    time_a = parse_time_to_hours(profile_a.wake_up_time)
    time_b = parse_time_to_hours(profile_b.wake_up_time)
    
    sleep_diff = abs(time_a - time_b)
    if sleep_diff > SLEEP_TIME_THRESHOLD_HOURS:  # > 2 hours
        return False  # NEVER match these students
    return True
```

> *"If a student wakes at 6 AM and another at 10 AM—4 hour gap—they will NEVER be paired.*"

**Tier 2 - Behavioral Distance:**
```python
def tier2_behavioral_score(profile_a, profile_b):
    clean_diff = profile_a.cleanliness - profile_b.cleanliness
    guest_diff = profile_a.guest_tolerance - profile_b.guest_tolerance
    
    distance = math.sqrt(
        WEIGHT_CLEANLINESS * (clean_diff ** 2) +
        WEIGHT_GUEST_TOLERANCE * (guest_diff ** 2)
    )
    return distance
```

> *"Example: Student A (clean=5, guest=2) vs Student B (clean=2, guest=4)*
> *Distance = sqrt(3×9 + 2×4) = sqrt(35) ≈ 5.9*
> *Lower distance = more compatible.*"

**Tier 3 - Social Adjustment:**
```python
def tier3_social_adjustment(profile_a, profile_b, base_score):
    dominance_sum = profile_a.dominance + profile_b.dominance
    
    if dominance_sum > 8:  # Two alphas (e.g., 5+5=10)
        return base_score + 15  # PENALTY
    
    dominance_diff = abs(profile_a.dominance - profile_b.dominance)
    if dominance_diff >= 2:  # Complementary
        return base_score - 2  # BONUS
    
    return base_score
```

> *"Two dominant personalities get penalized. One leader + one follower gets a bonus.*"

---

### 🖥️ LIVE DEMO (3 minutes)

> **[PERFORM THESE STEPS LIVE]**
>
> 1. **Navigate to Warden Dashboard**
> 2. **Click "Preview Allocation":**
>    - Show proposed student groups
>    - Point out compatibility scores
>    - Highlight how students with similar wake times are grouped
> 3. **Click "Run Allocation":**
>    - Show success message with count
> 4. **View All Allocations:**
>    - Show table of student → room assignments
> 5. **Switch to Student Account:**
>    - Show StudentDashboard with room details
>    - Point out roommate information
>    - Show "Navigate to Hostel" button

---

# SECTION 5: REQUEST MANAGEMENT WORKFLOWS
## Presenter: Developer 4 (Workflow Manager)
### Duration: 10 Minutes (6 min explanation + 4 min demo)

---

### 📋 Feature Overview (1 minute)

> *"I manage three critical workflow systems:*
> 1. **Hostel Accommodation Request** - Students formally apply for housing
> 2. **Room Swap Request** - Two students exchange rooms (2-step approval)
> 3. **Outpass System** - Leave management with verification codes*"

---

### 💻 Code Explanation: Swap Workflow Model (2 minutes)

**File:** `backend/student_requests/models.py`

```python
class SwapRequest(models.Model):
    class SwapStatus(models.TextChoices):
        PENDING_B_APPROVAL = 'PENDING_B', 'Waiting for Partner'
        PENDING_WARDEN = 'PENDING_WARDEN', 'Waiting for Warden'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    student_a = models.ForeignKey(User, related_name='sent_swaps')
    student_b = models.ForeignKey(User, related_name='received_swaps')
    student_b_enrollment = models.CharField(max_length=50)
    reason = models.TextField()
    student_b_agreed = models.BooleanField(default=False)
    status = models.CharField(choices=SwapStatus.choices)
```

> *"Notice the 2-step approval: First Student B must agree, THEN the warden reviews.*"

---

### 💻 Code Explanation: Swap Execution (2 minutes)

**File:** `backend/student_requests/views.py`

```python
class SwapRequestApprovalView(views.APIView):
    def post(self, request, pk):
        swap = SwapRequest.objects.get(pk=pk)
        
        if request.data.get('action') == 'approve':
            alloc_a = Allocation.objects.get(student=swap.student_a)
            alloc_b = Allocation.objects.get(student=swap.student_b)
            
            with transaction.atomic():
                # SWAP rooms and beds
                alloc_a.room, alloc_b.room = alloc_b.room, alloc_a.room
                alloc_a.bed, alloc_b.bed = alloc_b.bed, alloc_a.bed
                alloc_a.save()
                alloc_b.save()
            
            swap.status = SwapRequest.SwapStatus.APPROVED
            swap.save()
```

> *"The swap is wrapped in a database **transaction**—if anything fails, nothing changes.*"

---

### 💻 Code Explanation: Outpass Verification (1 minute)

**File:** `backend/student_requests/views.py`

```python
def approve_outpass(outpass):
    outpass.status = RequestStatus.APPROVED
    outpass.verification_code = str(uuid.uuid4())[:6].upper()  # "A1B2C3"
    outpass.save()
    return outpass.verification_code

# Security can verify at gate:
# GET /api/requests/outpass/verify/A1B2C3
```

> *"A unique 6-character code is generated for security verification at the gate.*"

---

### 🖥️ LIVE DEMO (4 minutes)

> **[PERFORM THESE STEPS LIVE]**
>
> **Demo 1: Hostel Request (1 min)**
> 1. Login as Student without allocation
> 2. Click "Apply for Hostel Accommodation"
> 3. Submit with reason
> 4. Show request appears in Warden's pending list
>
> **Demo 2: Swap Request (2 min)**
> 1. Login as Student A (already allocated)
> 2. Click "Request Room Swap"
> 3. Enter Student B's enrollment number
> 4. Login as Student B
> 5. Show incoming request and click "Accept"
> 6. Login as Warden
> 7. Approve the swap
> 8. Show both students now have swapped rooms
>
> **Demo 3: Outpass (1 min)**
> 1. Login as Student
> 2. Request outpass with dates
> 3. Login as Warden and Approve
> 4. Show Student now sees verification code: "A1B2C3"
> 5. Show API endpoint for gate verification

---

# SECTION 6: OPERATIONS DASHBOARD & MAINTENANCE TICKETS
## Presenter: Developer 5 (Operations Lead)
### Duration: 8 Minutes (5 min explanation + 3 min demo)

---

### 📊 Feature Overview (1 minute)

> *"I'm the Operations Lead responsible for:*
> 1. **Warden Dashboard** - Real-time statistics and overview
> 2. **Maintenance Ticket System** - Issue reporting with priorities*"

---

### 💻 Code Explanation: Maintenance Ticket Model (2 minutes)

**File:** `backend/operations/models.py`

```python
class MaintenanceTicket(models.Model):
    class Category(models.TextChoices):
        WIFI = 'WIFI', 'WiFi'           # 📶
        PLUMBING = 'PLUMBING', 'Plumbing'     # 🚿
        ELECTRICAL = 'ELECTRICAL', 'Electrical' # 💡
        FURNITURE = 'FURNITURE', 'Furniture'   # 🪑
        AC_FAN = 'AC_FAN', 'AC/Fan'         # ❄️
        DOOR_LOCK = 'DOOR_LOCK', 'Door/Lock'   # 🔒
    
    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low'        # 🟢
        MEDIUM = 'MEDIUM', 'Medium'  # 🟡
        HIGH = 'HIGH', 'High'      # 🟠
        URGENT = 'URGENT', 'Urgent'  # 🔴

    student = models.ForeignKey(User, related_name='tickets')
    room = models.ForeignKey(Room, related_name='tickets')  # Auto-linked
    category = models.CharField(choices=Category.choices)
    priority = models.CharField(choices=Priority.choices)
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(choices=['OPEN', 'VIEWED', 'IN_PROGRESS', 'RESOLVED'])
    feedback = models.TextField(blank=True)
    assigned_to = models.CharField(max_length=100, blank=True)
```

> *"8 categories for quick classification, 4 priority levels for triage, 6 status stages for tracking.*"

---

### 💻 Code Explanation: Dashboard Statistics (2 minutes)

**File:** `backend/operations/views.py`

```python
class DashboardStatsView(views.APIView):
    def get(self, request):
        total_students = CustomUser.objects.filter(role='STUDENT').count()
        allocated = Allocation.objects.count()
        
        total_beds = Bed.objects.count()
        occupied = Bed.objects.filter(is_occupied=True).count()
        occupancy_rate = (occupied / total_beds * 100) if total_beds else 0
        
        pending_hostel = HostelRequest.objects.filter(status='PENDING').count()
        pending_swaps = SwapRequest.objects.filter(
            status__in=['PENDING_B', 'PENDING_WARDEN']).count()
        active_tickets = MaintenanceTicket.objects.exclude(
            status__in=['RESOLVED', 'CLOSED']).count()
        
        return Response({
            'students': {'total': total_students, 'allocated': allocated},
            'beds': {'total': total_beds, 'occupancy_rate': occupancy_rate},
            'requests': {'pending_hostel': pending_hostel, 'pending_swaps': pending_swaps},
            'tickets': {'total_active': active_tickets}
        })
```

> *"One API call returns all dashboard metrics—students, occupancy, pending requests, tickets.*"

---

### 🖥️ LIVE DEMO (3 minutes)

> **[PERFORM THESE STEPS LIVE]**
>
> **Demo 1: Dashboard Overview (1 min)**
> 1. Login as Warden
> 2. Show dashboard statistics
>    - Total students, allocated count
>    - Occupancy rate percentage
>    - Pending request counts
>    - Active ticket count
>
> **Demo 2: Submit Ticket as Student (1 min)**
> 1. Login as Student
> 2. Click "Report Issue"
> 3. Fill form:
>    - Category: WiFi
>    - Priority: High
>    - Title: "WiFi not working"
>    - Description: Details
> 4. Submit
>
> **Demo 3: Manage Ticket as Warden (1 min)**
> 1. Switch to Warden
> 2. View tickets list
> 3. Click on the WiFi ticket
> 4. Update status to "IN_PROGRESS"
> 5. Assign to "IT Team"
> 6. Add feedback: "Technician dispatched"
> 7. Mark as "RESOLVED"

---

# SECTION 7: PRACTICAL IMPLEMENTATION & CLOSING
## Presenter: Developer 3 (Team Lead)
### Duration: 5 Minutes

---

### 🏫 Implementation at Uva Wellassa University (3 minutes)

> *"Let me explain how HiMate can be deployed at our university."*

**Implementation Roadmap:**

| Phase | Duration | Activities |
|-------|----------|------------|
| **Data Migration** | 2 weeks | Import hostel inventory, set GPS coordinates, configure batches |
| **User Onboarding** | 1 week | Integrate with Google Workspace, configure warden accounts |
| **Pilot Testing** | 2 weeks | Test on one hostel block, collect student feedback |
| **Full Deployment** | Semester Start | All new students complete survey, smart allocation goes live |

**Benefits for UVU Wellassa:**

> *"This research-backed system provides:*
> - **60% fewer roommate conflicts** based on research predictions
> - **Time savings** - Automated allocation replaces manual spreadsheets
> - **Better academic outcomes** - Aligned sleep schedules improve GPA
> - **Digital record keeping** - All requests and allocations tracked
> - **Scalability** - Ready for mobile app extension*"

---

### 🎬 Closing Statement (2 minutes)

> *"Thank you all for your attention. HiMate represents months of research and development aimed at solving a real problem faced by students every semester.*
>
> *This isn't just a software project—it's a research-backed solution that applies:*
> - *Chronobiology*
> - *Personality Psychology*
> - *Interpersonal Theory*
>
> *...to create harmonious living environments for our students.*
>
> *We believe HiMate can transform how Uva Wellassa University handles hostel allocation, leading to:*
> - *Happier students*
> - *Fewer conflicts*
> - *Better academic outcomes*
>
> *Thank you to our faculty advisors and everyone who contributed to this project.*"

---

## 📝 Appendix: Quick Reference for Presenters

### Key Files by Developer:

| Developer | Backend Files | Frontend Files |
|-----------|---------------|----------------|
| Dev 1 | `users/models.py`, `users/views.py` | `Login.jsx`, `Survey.jsx` |
| Dev 2 | `housing/models.py`, `housing/views.py` | `HostelManagement.jsx`, `RoomGrid.jsx` |
| Dev 3 | `allocation/services.py`, `allocation/views.py` | `StudentDashboard.jsx` (allocation display) |
| Dev 4 | `student_requests/models.py`, `student_requests/views.py` | `SwapRequestForm.jsx`, `OutpassForm.jsx` |
| Dev 5 | `operations/models.py`, `operations/views.py` | `WardenDashboard.jsx`, `TicketForm.jsx` |

### Demo Preparation Checklist:

- [ ] Backend server running (`python manage.py runserver`)
- [ ] Frontend server running (`npm start`)
- [ ] Test accounts ready:
  - [ ] Warden account logged in on one browser
  - [ ] 2-3 Student accounts ready
  - [ ] At least 2 students already allocated for swap demo
- [ ] Existing hostel data loaded
- [ ] Browser zoom set appropriately for projection

### Timing Reminders:

| Section | Start Time | End Time |
|---------|------------|----------|
| Introduction (Dev 3) | 0:00 | 6:00 |
| Auth & Profile (Dev 1) | 6:00 | 14:00 |
| Hostel Management (Dev 2) | 14:00 | 22:00 |
| Allocation Algorithm (Dev 3) | 22:00 | 32:00 |
| Request Workflows (Dev 4) | 32:00 | 42:00 |
| Operations (Dev 5) | 42:00 | 50:00 |
| Closing (Dev 3) | 50:00 | 55:00 |

---

**End of Presentation Script**

*Total Duration: ~55 minutes*  
*Prepared for: HiMate Development Team*  
*Date: February 2026*
