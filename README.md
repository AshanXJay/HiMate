# HiMate - Smart Hostel Allocation System

A comprehensive hostel management and roommate matching system for Uva Wellassa University. HiMate uses a sophisticated 3-tier algorithm to match students with compatible roommates based on their lifestyle preferences.

## 🎯 Features

### Student Features
- **Google OAuth Login** - Secure authentication using university email (@std.uwu.ac.lk)
- **Preference Survey** - Multi-step wizard to collect compatibility preferences
- **Room Allocation** - View assigned room, bed, and roommate details
- **Location Map** - View hostel location on Google Maps
- **Swap Requests** - Request to swap rooms with another student (requires partner approval)
- **Outpass Requests** - Request permission to leave hostel with verification code
- **Maintenance Tickets** - Report room issues with category and priority

### Warden Features
- **Dashboard Overview** - Stats on students, occupancy, pending requests
- **Smart Allocation** - Run 3-tier algorithm to match compatible students
- **Hostel Management** - CRUD operations for hostels and rooms
- **Request Management** - Approve/reject swaps, outpasses, and tickets
- **Room Grid View** - Visual overview of room occupancy status

## 🧠 Algorithm

HiMate implements a **Three-Tier Matching System**:

1. **Tier 1 - Biological Filter (Hard Constraints)**
   - Chronotype matching (wake time < 2 hours difference)
   - Light sensitivity compatibility

2. **Tier 2 - Behavioral Score (Weighted Euclidean Distance)**
   - Cleanliness preferences (weight: 3.0)
   - Guest tolerance (weight: 2.0)

3. **Tier 3 - Social Balance (Complementarity)**
   - Dominance scoring to avoid alpha-alpha conflicts
   - Personality complementarity bonuses

## 🏗️ Tech Stack

### Backend
- **Django 5.2** - Web framework
- **Django REST Framework** - API development
- **PostgreSQL/SQLite** - Database
- **Simple JWT** - Authentication
- **Google OAuth** - Social login

### Frontend
- **React 19** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **Google OAuth** - Authentication

## 📁 Project Structure

```
HiMate/
├── backend/
│   ├── core/              # Django settings
│   ├── users/             # User authentication & profiles
│   ├── housing/           # Hostels, rooms, beds
│   ├── allocation/        # Room allocation algorithm
│   ├── student_requests/  # Swaps, outpasses, status tracking
│   └── operations/        # Maintenance tickets, dashboard
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── AuthContext.jsx
│   │   └── App.jsx
│   └── public/
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run migrations
python manage.py migrate

# Run server
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
# Create .env file with:
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_API_URL=http://127.0.0.1:8000

# Run development server
npm start
```

## 🔧 Environment Variables

### Backend (.env)
```
SECRET_KEY=your-django-secret-key
DEBUG=True
GOOGLE_CLIENT_ID=your-google-client-id
WARDEN_EMAIL=warden@example.com
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_API_URL=http://127.0.0.1:8000
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/google/` - Google OAuth login

### Users
- `GET /api/me/` - Get current user data
- `PATCH /api/profile/update/` - Update profile

### Housing
- `GET /api/housing/hostels/` - List hostels
- `POST /api/housing/hostels/{id}/generate_rooms/` - Generate rooms
- `GET /api/housing/rooms/?hostel={id}` - List rooms

### Allocation
- `POST /api/allocation/run/` - Run smart allocation
- `GET /api/allocation/preview/` - Preview allocation
- `GET /api/allocation/my-room/` - Get student's room
- `GET /api/allocation/stats/` - Get statistics

### Requests
- `POST /api/requests/swap/` - Create swap request
- `POST /api/requests/swap/{id}/respond/` - Partner response
- `POST /api/requests/swap/{id}/approve/` - Warden approval
- `POST /api/requests/outpass/` - Create outpass
- `POST /api/requests/outpass/{id}/approve/` - Approve outpass
- `GET /api/requests/outpass/verify/{code}/` - Verify outpass

### Operations
- `POST /api/operations/ticket/` - Create ticket
- `GET /api/operations/dashboard/stats/` - Dashboard stats
- `GET /api/operations/dashboard/requests/` - Pending requests

## 📱 Pages

### Student Pages
- `/login` - Google OAuth login
- `/dashboard` - Student dashboard
- `/survey` - Preference wizard
- `/request/swap` - Swap request form
- `/request/outpass` - Outpass request form
- `/request/ticket` - Maintenance ticket form
- `/request/:type/:id` - Request detail view
- `/rooms` - Room grid view

### Warden Pages
- `/admin/dashboard` - Warden dashboard
- `/admin/allocation` - Allocation control
- `/admin/hostels` - Hostel management
- `/admin/requests/:type` - Request management

## 🔐 User Roles

| Role | Access |
|------|--------|
| `STUDENT` | Personal dashboard, requests, profile |
| `WARDEN` | Full admin access, allocation, approvals |

## 📄 License

This project is developed for Uva Wellassa University.

## 👥 Contributors

- Development team for ICT Department
