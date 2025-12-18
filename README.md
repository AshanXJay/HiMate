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
*   **Frontend**: React (CRA), TailwindCSS, Axios
*   **Backend**: Django Rest Framework (DRF)
*   **Database**: SQLite (Dev) / PostgreSQL (Prod ready)
*   **Auth**: Google OAuth 2.0 + JWT

## 📦 Installation & Setup

### 1. Backend (Django)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Initial Setup
python manage.py migrate
python manage.py seed_hostels  # Generates dummy rooms
python manage.py runserver
```
*Note: Create a `.env` file in `/backend` with `SECRET_KEY` and `GOOGLE_CLIENT_ID`.*

### 2. Frontend (React)
```bash
cd frontend
npm install
npm start
```
*Note: Create a `.env` file in `/frontend` with `REACT_APP_GOOGLE_CLIENT_ID`.*

## 📖 Documentation
Detailed structure guides are available in the `docs/` folder:
*   [Backend Structure](docs/Backend_Structure.md)
*   [Frontend Structure](docs/Frontend_Structure.md)

## 📄 License
This project is licensed under the [GNU GPLv3 License](LICENSE).
