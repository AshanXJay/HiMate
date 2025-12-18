# 📘 HiMate - Backend Guide (Simple & Easy)

This document explains **every single file** in our Django Backend. It is designed so that even a beginner can understand where to look for code.

---

## 📂 Root Folder (`c:\Github\HiMate\backend`)
This is the main folder for the server code.

### 📄 **`manage.py`**
*   **What it is**: The "Remote Control" for Django.
*   **What it does**: We use this to run commands.
    *   `python manage.py runserver` -> Starts the website.
    *   `python manage.py makemigrations` -> Prepares database changes.
    *   `python manage.py migrate` -> Applies database changes.

### 📄 **`db.sqlite3`**
*   **What it is**: The Database File.
*   **What it does**: It stores ALL the data (users, rooms, allocation info) in a single file. You don't need to install MySQL or PostgreSQL; this file is the entire database.

### 📄 **`README.md`**
*   **Description**: Setup instructions for the backend.

### 📁 **`venv/`**
*   **Description**: The virtual environment folder containing all Python libraries. You don't touch this.

---

## ⚙️ The Core Brain (`/backend/core`)
This folder controls the settings for the *entire* website.

### 📄 **`settings.py`**
*   **What it is**: The Configuration Center.
*   **Key things inside**:
    *   `INSTALLED_APPS`: A list of all the features (Housing, Users) we turned on.
    *   `DATABASES`: configurations telling Django to use `db.sqlite3`.
    *   `CORS_ALLOWED_ORIGINS`: A whitelist allowing our Frontend (`localhost:3000`) to talk to this Backend.

### 📄 **`urls.py`**
*   **What it is**: The Traffic Controller.
*   **What it does**: It is the first place a request goes. It looks at the link (e.g., `/api/rooms/`) and points it to the correct app folder.

### 📄 **`wsgi.py`** & **`asgi.py`**
*   **Description**: Server entry points for deployment. Ignored during local development.

### 📄 **`__init__.py`**
*   **Description**: Tells Python this folder is a package. Usually empty.

---

## 🧱 The Functional Apps
Django projects are built of "Apps". Each App handles **one specific job**.

### 1. 👤 Users App (`/backend/users`)
**Job**: Handles Login, Sign Up, and Student Profiles.

*   **`models.py`**:
    *   `CustomUser`: Represents a human. Has an `email` and a `role` (Student or Warden).
    *   `StudentProfile`: Extra info for students (Wake up time, Cleanliness score, Enrollment Number).
*   **`views.py`**:
    *   `GoogleLoginView`: The logic that takes a Google Token, checks if it's a `@std.uwu.ac.lk` email, and logs you in.
*   **`serializers.py`**: Converts Python objects to JSON.
*   **`urls.py`**: Defines API paths like `/api/auth/google/`.
*   **`admin.py`**: Registers models to the Admin Panel.
*   **`apps.py`**: App configuration.
*   **`tests.py`**: Unit tests for this app.
*   **`migrations/`**: Folder containing database change history.

### 2. 🏠 Housing App (`/backend/housing`)
**Job**: Manages the Hostels and Rooms.

*   **`models.py`**: `Hostel` and `Room` definitions.
*   **`views.py`**: API to list rooms (`/api/housing/hostels/`).
*   **`serializers.py`**: JSON formatting for rooms.
*   **`urls.py`**, **`admin.py`**, **`apps.py`**, **`tests.py`**: Standard files.
*   **`management/commands/seed_hostels.py`**:
    *   **Special Script**: Run via `python manage.py seed_hostels`. It populates the database with dummy hostels and rooms.

### 3. 🤝 Allocation App (`/backend/allocation`)
**Job**: The Brain. It decides who sleeps where.

*   **`services.py`**:
    *   **CRITICAL FILE**: Contains the `allocate_students()` algorithm. It matches students based on preferences and assigns rooms.
*   **`models.py`**: `Allocation` model (Student <-> Room link).
*   **`views.py`**: API to trigger allocation logic or get current student's room.
*   **`serializers.py`**: JSON formatting for allocations.
*   **`urls.py`**, **`admin.py`**, **`apps.py`**, **`tests.py`**: Standard files.

### 4. 📝 Student Requests App (`/backend/student_requests`)
**Job**: Handles forms students submit.

*   **`models.py`**: `SwapRequest` and `OutPass` models.
*   **`views.py`**: APIs to submit these forms.
*   **`serializers.py`**, **`urls.py`**, etc.: Standard files.

### 5. 🛠️ Operations App (`/backend/operations`)
**Job**: Dashboard stats and maintenance.

*   **`models.py`**: `MaintenanceTicket`.
*   **`views.py`**: APIs for stats and tickets.
*   **`serializers.py`**, **`urls.py`**, etc.: Standard files.
