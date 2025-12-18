# HiMate 🤝
### University Room Allocation Portal

HiMate is a full-stack web application designed for **Uva Wellassa University** to automate the hostel room allocation process. It matches students based on their **preferences** (Sleep schedule, Cleanliness, Social habits) to ensure compatible roommates.

## 🚀 Features
*   **Google Sign-In**: Secure access using University Email (`@std.uwu.ac.lk`).
*   **Role-Based Access**:
    *   **Students**: View room details, fill survey, request swaps.
    *   **Wardens (Admin)**: View dashboard stats, trigger auto-allocation, manage rooms.
*   **Smart Allocation Algorithm**: Automatically pairs students with similar habits.
*   **Dark Mode UI**: Premium AMOLED Black & Orange aesthetic.

## 🛠️ Tech Stack
*   **Frontend**: React (Create React App), Vanilla CSS
*   **Backend**: Django Rest Framework (DRF)
*   **Database**: MySQL
*   **Auth**: Google OAuth 2.0 + JWT

## 📦 Installation & Setup

### Prerequisites
*   Python 3.10+
*   Node.js & npm
*   MySQL Server (installed & running)

### 1. Database Setup
Log in to your MySQL server and create the database:
```sql
CREATE DATABASE himate_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend (Django)
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt

# Configure Environment
cp .env.example .env
# Edit .env with your MySQL credentials, Google Client ID, and Warden Email

# Run Migrations
python manage.py migrate

# Create Superuser
python manage.py createsuperuser

# Start Server
python manage.py runserver
```

### 3. Frontend (React)
```bash
cd frontend
npm install

# Configure Environment
cp .env.example .env
# Edit .env and paste your Google Client ID (Must match backend)

npm start
```

## 📖 Documentation
Detailed structure guides are available in the `docs/` folder:
*   [Backend Structure](docs/Backend_Structure.md)
*   [Frontend Structure](docs/Frontend_Structure.md)

## 📄 License
This project is licensed under the [GNU GPLv3 License](LICENSE).
