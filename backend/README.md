# HiMate Backend

Django backend for the HiMate project.

## Setup

1.  Make sure Python 3.10+ is installed.
2.  Navigate to `backend` directory.
3.  Activate virtual environment (if not already):
    *   Windows: `.\venv\Scripts\activate`
    *   Mac/Linux: `source venv/bin/activate`
4.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
    (Or `pip install django djangorestframework djoser djangorestframework-simplejwt django-cors-headers`)

## Running

1.  Run migrations (if needed):
    ```bash
    python manage.py migrate
    ```
2.  Seed data (for testing):
    ```bash
    python manage.py seed_hostels
    ```
3.  Start server:
    ```bash
    python manage.py runserver
    ```
    Server runs at: `http://127.0.0.1:8000/`

## API Endpoints

*   **Auth**: `/api/auth/users/`, `/api/auth/jwt/create/`
*   **Profile**: `/api/profile/update/`
*   **Housing**: `/api/housing/hostels/`
*   **Allocations**: `/api/allocation/my-room/`
*   **Requests**: `/api/requests/swap/`
*   **Dashboard**: `/api/operations/dashboard/stats/`
