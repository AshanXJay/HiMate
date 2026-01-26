# Project HiMate: Implementation Documentation
Version: 2.0.0 | Updated: 26 January 2026
Mission: "Scientific Roommate Allocation based on Chronobiology and Psychometrics."

================================================================================
## 1. GLOBAL ARCHITECTURE & IMPLEMENTATION STATUS
================================================================================

### 1.1 Implemented Tech Stack

| Layer      | Technology                                | Status |
|------------|-------------------------------------------|--------|
| Frontend   | React 19, React Router Dom 7, Axios       | ✅     |
| Styling    | Custom CSS (AMOLED Black & Orange Theme)  | ✅     |
| Backend    | Python 3.10+, Django 5.2/6.0, DRF         | ✅     |
| Auth       | Google OAuth + SimpleJWT                  | ✅     |
| Database   | SQLite (Dev) / PostgreSQL (Prod)          | ✅     |

### 1.2 Visual Theme (AMOLED Black & Orange)

| Element            | Value                    | CSS Variable           |
|--------------------|--------------------------|------------------------|
| Primary Color      | #FF6600 (Vibrant Orange) | --color-primary        |
| Primary Hover      | #CC5200 (Darker Orange)  | --color-primary-hover  |
| Background         | #000000 (True Black)     | --color-bg             |
| Surface (Cards)    | #111111 (Dark Grey)      | --color-surface        |
| Text Primary       | #FFFFFF                  | --color-text-main      |
| Text Muted         | #888888                  | --color-text-muted     |
| Border             | #333333                  | --color-border         |
| Success            | #4ADE80 (Green)          | --color-success        |
| Error              | #FB7185 (Red)            | --color-error          |
| Warning            | #FBBF24 (Amber)          | --color-warning        |
| Font               | 'Outfit', sans-serif     | --font-family          |
| Glow Effect        | Orange shadow            | --shadow-gl            |

### 1.3 Directory Structure (Current Implementation)

```
/HiMate
├── /backend (Django)
│     ├── manage.py
│     ├── /core (Settings, URLs)
│     ├── /users (Dev 1 - Auth & Profile)
│     ├── /housing (Dev 2 - Hostels, Rooms, Beds)
│     ├── /allocation (Dev 3 - Smart Algorithm)
│     ├── /student_requests (Dev 4 - Swaps & Outpass)
│     └── /operations (Dev 5 - Tickets & Dashboard)
│
└── /frontend (React)
      ├── /src
      │     ├── /components (Shared: Layout, Navbar, RoomGrid, etc.)
      │     ├── /pages
      │     │     ├── Login.jsx
      │     │     ├── Survey.jsx (Wizard)
      │     │     ├── StudentDashboard.jsx
      │     │     ├── WardenDashboard.jsx
      │     │     ├── SwapRequestForm.jsx
      │     │     ├── OutpassForm.jsx
      │     │     ├── TicketForm.jsx
      │     │     ├── RequestDetail.jsx
      │     │     ├── HostelManagement.jsx
      │     │     └── WardenRequestsPage.jsx
      │     ├── AuthContext.jsx
      │     └── App.jsx
```

### 1.4 Database Schema (Implemented)

#### 1. Users (users_customuser) - Dev 1
| Field              | Type                  | Description                    |
|--------------------|-----------------------|--------------------------------|
| id                 | PK                    | Auto increment                 |
| username           | CharField             | Unique username                |
| email              | EmailField            | Unique email (Google OAuth)    |
| first_name         | CharField             | From Google profile            |
| role               | Enum                  | 'STUDENT' or 'WARDEN'          |
| gender             | Enum                  | 'MALE' or 'FEMALE'             |
| is_profile_complete| Boolean               | True after survey completion   |

#### 2. Student Profiles (users_studentprofile) - Dev 1
| Field              | Type      | Description                    |
|--------------------|-----------|--------------------------------|
| user_id            | FK→Users  | One-to-One relationship        |
| enrollment_number  | CharField | University enrollment ID       |
| full_name          | CharField | Student's full name            |
| batch              | CharField | Year batch (e.g., "22")        |
| wake_up_time       | TimeField | Preferred wake time (HH:MM)    |
| requires_darkness  | Boolean   | Needs darkness to sleep        |
| cleanliness        | Int (1-5) | Cleanliness preference         |
| guest_tolerance    | Int (1-5) | Comfort with visitors          |
| dominance          | Int (1-5) | Social energy/assertiveness    |

#### 3. Hostels (housing_hostel) - Dev 2
| Field              | Type      | Description                    |
|--------------------|-----------|--------------------------------|
| id                 | PK        | Auto increment                 |
| name               | CharField | Hostel name (e.g., "Block A")  |
| gender_type        | Enum      | 'MALE' or 'FEMALE'             |
| caretaker_name     | CharField | Name of hostel caretaker       |
| allocated_batches  | CharField | Comma-separated batch years    |
| latitude           | Decimal   | GPS coordinate                 |
| longitude          | Decimal   | GPS coordinate                 |
| address            | TextField | Physical address               |

#### 4. Rooms (housing_room) - Dev 2
| Field              | Type      | Description                    |
|--------------------|-----------|--------------------------------|
| id                 | PK        | Auto increment                 |
| hostel_id          | FK→Hostel | Parent hostel                  |
| room_number        | CharField | Room identifier (e.g., "101")  |
| floor              | Integer   | Floor number                   |
| capacity           | Integer   | Max students (default: 4)      |
| current_occupancy  | Integer   | Current count (computed)       |
| status             | Enum      | 'AVAILABLE', 'FULL', 'MAINTENANCE' |

#### 5. Beds (housing_bed) - Dev 2
| Field              | Type      | Description                    |
|--------------------|-----------|--------------------------------|
| id                 | PK        | Auto increment                 |
| room_id            | FK→Room   | Parent room                    |
| bed_number         | CharField | Bed identifier (e.g., "A")     |
| is_occupied        | Boolean   | Occupancy status               |

#### 6. Allocations (allocation_allocation) - Dev 3
| Field              | Type      | Description                    |
|--------------------|-----------|--------------------------------|
| id                 | PK        | Auto increment                 |
| student_id         | FK→User   | One-to-One (unique)            |
| room_id            | FK→Room   | Assigned room                  |
| bed_id             | FK→Bed    | Assigned bed (optional)        |
| semester           | CharField | Academic semester              |
| allocated_at       | DateTime  | Timestamp of allocation        |

#### 7. Swap Requests (student_requests_swaprequest) - Dev 4
| Field              | Type      | Description                    |
|--------------------|-----------|--------------------------------|
| id                 | PK        | Auto increment                 |
| student_a          | FK→User   | Request initiator              |
| student_b          | FK→User   | Swap partner                   |
| student_b_enrollment| CharField | Partner's enrollment number   |
| reason             | TextField | Reason for swap                |
| student_b_agreed   | Boolean   | Partner approval status        |
| student_b_response_at| DateTime| Partner response timestamp     |
| status             | Enum      | PENDING_B, PENDING_WARDEN, APPROVED, REJECTED |
| warden_notes       | TextField | Warden's notes                 |

#### 8. Outpass Requests (student_requests_outpass) - Dev 4
| Field              | Type      | Description                    |
|--------------------|-----------|--------------------------------|
| id                 | PK        | Auto increment                 |
| student            | FK→User   | Requesting student             |
| leave_date         | DateField | Departure date                 |
| return_date        | DateField | Return date                    |
| reason             | TextField | Purpose of leave               |
| destination        | CharField | Where going                    |
| emergency_contact  | CharField | Contact number                 |
| status             | Enum      | PENDING, APPROVED, REJECTED    |
| verification_code  | CharField | 6-char code for security       |

#### 9. Maintenance Tickets (operations_maintenanceticket) - Dev 5
| Field              | Type      | Description                    |
|--------------------|-----------|--------------------------------|
| id                 | PK        | Auto increment                 |
| student            | FK→User   | Reporting student              |
| room               | FK→Room   | Affected room (auto-filled)    |
| category           | Enum      | WIFI, PLUMBING, ELECTRICAL, etc|
| priority           | Enum      | LOW, MEDIUM, HIGH, URGENT      |
| title              | CharField | Brief description              |
| description        | TextField | Detailed description           |
| status             | Enum      | OPEN, VIEWED, IN_PROGRESS, RESOLVED |
| feedback           | TextField | Staff response                 |
| assigned_to        | CharField | Assigned staff member          |

================================================================================
## 2. DEVELOPER SPECIFICATIONS (COMPLETED FEATURES)
================================================================================

### 👨‍💻 DEVELOPER 1: Identity Lead (Auth & Profile)
**Focus:** Security, Google OAuth & Scientific Data Collection

#### Backend Implementation:
| Task                                      | File Location                    | Status |
|-------------------------------------------|----------------------------------|--------|
| CustomUser model with roles               | users/models.py                  | ✅     |
| StudentProfile with 5 scientific fields   | users/models.py                  | ✅     |
| Google OAuth integration                  | users/views.py                   | ✅     |
| JWT token management                      | users/views.py                   | ✅     |
| Profile update API                        | users/views.py                   | ✅     |
| User serializers                          | users/serializers.py             | ✅     |

#### API Endpoints:
| Method | Endpoint                | Description                    |
|--------|-------------------------|--------------------------------|
| POST   | /api/auth/google/       | Google OAuth login             |
| GET    | /api/me/                | Get current user data          |
| PATCH  | /api/profile/update/    | Update profile (survey data)   |

#### Frontend Implementation:
| Component              | File Location                    | Description               |
|------------------------|----------------------------------|---------------------------|
| Login Page             | pages/Login.jsx                  | Google OAuth button       |
| Survey Wizard          | pages/Survey.jsx                 | 5-step preference wizard  |
| Auth Context           | AuthContext.jsx                  | Token management          |
| RequireAuth HOC        | components/RequireAuth.jsx       | Route protection          |

#### Survey Wizard Steps:
1. **Wake Up Time** - Time picker for natural wake time
2. **Light Sensitivity** - Toggle: Can sleep with lights on?
3. **Cleanliness** - Slider (1-5): Tidiness preference
4. **Guest Tolerance** - Slider (1-5): Visitor comfort
5. **Social Energy** - Slider (1-5): Dominance/introversion

---

### 👨‍💻 DEVELOPER 2: Property Manager (Inventory)
**Focus:** CRUD Operations & Room Management

#### Backend Implementation:
| Task                                      | File Location                    | Status |
|-------------------------------------------|----------------------------------|--------|
| Hostel model with batches & location      | housing/models.py                | ✅     |
| Room model with floor & status            | housing/models.py                | ✅     |
| Bed model for detailed tracking           | housing/models.py                | ✅     |
| Auto room generation action               | housing/views.py                 | ✅     |
| Available beds calculation                | housing/serializers.py           | ✅     |

#### API Endpoints:
| Method | Endpoint                              | Description              |
|--------|---------------------------------------|--------------------------|
| GET    | /api/housing/hostels/                 | List all hostels         |
| POST   | /api/housing/hostels/                 | Create hostel            |
| PUT    | /api/housing/hostels/{id}/            | Update hostel            |
| DELETE | /api/housing/hostels/{id}/            | Delete hostel            |
| POST   | /api/housing/hostels/{id}/generate_rooms/ | Auto-generate rooms  |
| GET    | /api/housing/rooms/?hostel={id}       | List rooms for hostel    |

#### Frontend Implementation:
| Component              | File Location                    | Description               |
|------------------------|----------------------------------|---------------------------|
| Room Grid              | components/RoomGrid.jsx          | Visual room status        |
| Hostel Management      | pages/HostelManagement.jsx       | CRUD for hostels          |

#### Room Status Color Coding:
| Status      | Color  | Meaning                    |
|-------------|--------|----------------------------|
| Available   | Green  | Room has empty beds        |
| Filling     | Yellow | Partially occupied         |
| Full        | Red    | No beds available          |
| Maintenance | Grey   | Under maintenance          |

---

### 👨‍💻 DEVELOPER 3: Algorithm Engineer (The Core)
**Focus:** 3-Tier Matching Algorithm

#### Backend Implementation:
| Task                                      | File Location                    | Status |
|-------------------------------------------|----------------------------------|--------|
| Allocation model with bed tracking        | allocation/models.py             | ✅     |
| 3-Tier compatibility algorithm            | allocation/services.py           | ✅     |
| Smart allocation runner                   | allocation/views.py              | ✅     |
| Preview allocation endpoint               | allocation/views.py              | ✅     |
| Allocation statistics                     | allocation/views.py              | ✅     |

#### The 3-Tier Algorithm (services.py):

**Tier 1: Biological Filter (Hard Constraints)**
- Wake time difference ≤ 2 hours
- Light sensitivity compatibility
- Returns: 0 (incompatible) or passes to Tier 2

**Tier 2: Behavioral Score (Weighted Euclidean Distance)**
```python
Weights:
- Cleanliness: 3.0 (highest impact)
- Guest Tolerance: 2.0
Distance = sqrt(Σ weight × (diff)²)
Score = 100 - (distance × 10)  # Normalized to 0-100
```

**Tier 3: Social Balance (Complementarity)**
```python
dominance_diff = abs(student_a.dominance - student_b.dominance)
if dominance_diff >= 2:
    score += 10  # Bonus for complementary personalities
if both_high_dominance:
    score -= 15  # Penalty for alpha-alpha conflict
```

#### API Endpoints:
| Method | Endpoint                    | Description                    |
|--------|-----------------------------|--------------------------------|
| POST   | /api/allocation/run/        | Execute smart allocation       |
| GET    | /api/allocation/preview/    | Preview before running         |
| GET    | /api/allocation/my-room/    | Student's room details         |
| GET    | /api/allocation/list/       | All allocations (warden)       |
| GET    | /api/allocation/stats/      | Allocation statistics          |

#### Frontend Implementation:
| Component              | File Location                    | Description               |
|------------------------|----------------------------------|---------------------------|
| Allocation Control     | components/AllocationControl.jsx | Admin allocation panel    |
| Student Dashboard      | pages/StudentDashboard.jsx       | Room & roommate display   |

---

### 👨‍💻 DEVELOPER 4: Workflow Manager (Requests)
**Focus:** State Management & Multi-step Workflows

#### Backend Implementation:
| Task                                      | File Location                    | Status |
|-------------------------------------------|----------------------------------|--------|
| SwapRequest model with 2-step approval    | student_requests/models.py       | ✅     |
| OutPass model with verification code      | student_requests/models.py       | ✅     |
| StatusHistory for audit trail             | student_requests/models.py       | ✅     |
| Partner approval workflow                 | student_requests/views.py        | ✅     |
| Warden approval workflow                  | student_requests/views.py        | ✅     |
| Verification code generation              | student_requests/views.py        | ✅     |

#### Swap Request Workflow:
```
1. Student A creates request → Status: PENDING_B
2. Student B receives notification
3. Student B responds:
   - Agree → Status: PENDING_WARDEN
   - Decline → Status: REJECTED
4. Warden reviews:
   - Approve → Execute swap, Status: APPROVED
   - Reject → Status: REJECTED
```

#### Outpass Workflow:
```
1. Student creates outpass request → Status: PENDING
2. Warden reviews:
   - Approve → Generate 6-char verification code, Status: APPROVED
   - Reject → Status: REJECTED
3. Student shows code to security at gate
```

#### API Endpoints:
| Method | Endpoint                           | Description                  |
|--------|------------------------------------|------------------------------|
| POST   | /api/requests/swap/                | Create swap request          |
| GET    | /api/requests/swap/list/           | List swap requests           |
| POST   | /api/requests/swap/{id}/respond/   | Partner response             |
| POST   | /api/requests/swap/{id}/approve/   | Warden approval              |
| POST   | /api/requests/outpass/             | Create outpass               |
| GET    | /api/requests/outpass/list/        | List outpasses               |
| POST   | /api/requests/outpass/{id}/approve/| Warden approval              |
| GET    | /api/requests/outpass/verify/{code}| Verify outpass at gate       |

#### Frontend Implementation:
| Component              | File Location                    | Description               |
|------------------------|----------------------------------|---------------------------|
| Swap Request Form      | pages/SwapRequestForm.jsx        | Request by enrollment #   |
| Outpass Form           | pages/OutpassForm.jsx            | Leave request form        |
| Request Detail         | pages/RequestDetail.jsx          | View & respond to requests|
| Warden Requests Page   | pages/WardenRequestsPage.jsx     | Approve/reject requests   |

---

### 👨‍💻 DEVELOPER 5: Operations Lead (Dashboard)
**Focus:** Data Visualization & Maintenance

#### Backend Implementation:
| Task                                      | File Location                    | Status |
|-------------------------------------------|----------------------------------|--------|
| MaintenanceTicket model with priorities   | operations/models.py             | ✅     |
| Dashboard statistics endpoint             | operations/views.py              | ✅     |
| Pending requests summary                  | operations/views.py              | ✅     |
| Ticket CRUD operations                    | operations/views.py              | ✅     |
| Ticket status updates                     | operations/views.py              | ✅     |

#### Dashboard Statistics Response:
```json
{
  "students": {
    "total": 150,
    "allocated": 120,
    "pending_allocation": 30,
    "profile_complete": 145
  },
  "beds": {
    "total": 200,
    "occupied": 120,
    "available": 80,
    "occupancy_rate": 60.0
  },
  "requests": {
    "pending_hostel": 5,
    "pending_swaps": 3,
    "pending_outpasses": 7
  },
  "tickets": {
    "total_active": 12,
    "by_category": {
      "WIFI": 5,
      "PLUMBING": 3,
      "ELECTRICAL": 4
    }
  }
}
```

#### API Endpoints:
| Method | Endpoint                           | Description                  |
|--------|------------------------------------|------------------------------|
| GET    | /api/operations/dashboard/stats/   | Dashboard statistics         |
| GET    | /api/operations/dashboard/requests/| Pending requests summary     |
| POST   | /api/operations/ticket/            | Create ticket                |
| GET    | /api/operations/ticket/list/       | List tickets                 |
| GET    | /api/operations/ticket/{id}/       | Get ticket details           |
| POST   | /api/operations/ticket/{id}/update/| Update ticket status         |

#### Frontend Implementation:
| Component              | File Location                    | Description               |
|------------------------|----------------------------------|---------------------------|
| Warden Dashboard       | pages/WardenDashboard.jsx        | Stats & occupancy         |
| Ticket Form            | pages/TicketForm.jsx             | Report maintenance issue  |
| Warden Requests Page   | pages/WardenRequestsPage.jsx     | Ticket management         |

#### Ticket Categories:
| Code       | Label      | Icon |
|------------|------------|------|
| WIFI       | WiFi       | 📶   |
| PLUMBING   | Plumbing   | 🚿   |
| ELECTRICAL | Electrical | 💡   |
| FURNITURE  | Furniture  | 🪑   |
| CLEANING   | Cleaning   | 🧹   |
| AC_FAN     | AC/Fan     | ❄️   |
| DOOR_LOCK  | Door/Lock  | 🔒   |
| OTHER      | Other      | 📋   |

#### Priority Levels:
| Priority | Color   | Description                |
|----------|---------|----------------------------|
| LOW      | Green   | Can wait a few days        |
| MEDIUM   | Yellow  | Should be fixed soon       |
| HIGH     | Orange  | Urgent attention needed    |
| URGENT   | Red     | Critical issue!            |

================================================================================
## 3. INTEGRATION & TESTING
================================================================================

### 3.1 Running the Application

#### Backend:
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

#### Frontend:
```bash
cd frontend
npm install
npm start
```

### 3.2 Environment Variables

#### Backend (.env):
```
SECRET_KEY=your-django-secret-key
DEBUG=True
GOOGLE_CLIENT_ID=your-google-client-id
WARDEN_EMAIL=warden@example.com
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

#### Frontend (.env):
```
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_API_URL=http://127.0.0.1:8000
```

### 3.3 Test Scenarios

#### Happy Path:
1. Login with Google (@std.uwu.ac.lk)
2. Complete 5-step survey wizard
3. Warden creates hostel and generates rooms
4. Warden runs smart allocation
5. Student views allocated room and roommates
6. Student requests room swap
7. Partner approves swap
8. Warden approves swap
9. Students view updated rooms
10. Student files maintenance ticket
11. Staff resolves ticket

================================================================================
## 4. FEATURE SUMMARY BY ROLE
================================================================================

### Student Features:
| Feature                | Description                              |
|------------------------|------------------------------------------|
| Google Login           | Secure OAuth authentication              |
| Preference Survey      | 5-step wizard for compatibility data     |
| View Allocation        | See room, bed, and roommates             |
| Map Navigation         | Link to hostel on Google Maps            |
| Request Swap           | Initiate room swap with partner          |
| Respond to Swap        | Accept/decline swap from partner         |
| Request Outpass        | Apply for leave with dates               |
| View Verification Code | Show 6-char code if approved             |
| Report Issue           | File maintenance ticket with priority    |
| Track Requests         | View status of all requests              |

### Warden Features:
| Feature                | Description                              |
|------------------------|------------------------------------------|
| Dashboard              | Stats, occupancy rate, pending counts    |
| Manage Hostels         | CRUD operations for hostels              |
| Generate Rooms         | Bulk create rooms with beds              |
| Run Allocation         | Execute 3-tier matching algorithm        |
| Preview Allocation     | See groups before committing             |
| View All Allocations   | Table of student-room assignments        |
| Approve Swaps          | Review and approve/reject swaps          |
| Approve Outpasses      | Review and approve/reject leave          |
| Manage Tickets         | Update status and provide feedback       |

================================================================================
## 5. PENDING ENHANCEMENTS
================================================================================

| Feature                     | Priority | Developer | Notes                    |
|-----------------------------|----------|-----------|--------------------------|
| Email notifications         | High     | Dev 1     | For approvals/rejections |
| Mobile responsive testing   | High     | All       | Touch-friendly UI        |
| Bulk student import         | Medium   | Dev 1     | CSV upload for students  |
| Room swap history           | Medium   | Dev 4     | Audit trail              |
| Ticket photos               | Medium   | Dev 5     | Attach images to tickets |
| Analytics dashboard         | Low      | Dev 5     | Charts (recharts)        |
| Push notifications          | Low      | Dev 1     | Browser notifications    |

================================================================================
END OF IMPLEMENTATION DOCUMENTATION
================================================================================
