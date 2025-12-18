# ⚛️ HiMate - Frontend Guide (Simple & Easy)

This document explains **every single file** in our React Frontend.

---

## 📂 Root Folder (`c:\Github\HiMate\frontend`)
This is the workspace folder.

### 📄 **`package.json`**
*   **What it is**: The ID Card & Shopping List.
*   **What it does**: Lists dependencies (`react`, `axios`, etc.) and scripts (`npm start`).

### 📄 **`package-lock.json`**
*   **What it is**: The Receipt.
*   **What it does**: Locks the exact versions of installed libraries.

### 📄 **`.env`**
*   **What it is**: Secrets File.
*   **Description**: Stores environment variables.

### 📄 **`README.md`**
*   **Description**: Instructions on how to run the frontend.

### 📄 **`.gitignore`**
*   **Description**: Tells Git which files to ignore (like `node_modules`).

### 📁 **`node_modules/`**
*   **Description**: The folder where all installed libraries live. Huge. Don't touch.

### 📁 **`public/`**
*   **`index.html`**: The Main HTML file. It has the `<div id="root">` where React lives.
*   **`vite.svg`** (or other icons): Static assets served directly.

---

## 🎨 The Source Code (`/src`)
This is where 99% of our work happens.

### 📄 **`index.js`**
*   **What it does**: The Entry Point. Mounts the `App` component to the HTML.

### 📄 **`App.jsx`**
*   **What it is**: The Main Router.
*   **What it does**: Defines Routes (`/login`, `/dashboard`). Wraps everything in `AuthProvider` and `GoogleOAuthProvider`.

### 📄 **`index.css`**
*   **What it is**: Global Styling.
*   **What it does**: Contains Tailwind directives, Font imports, and Custom CSS variables (Theme).

### 📄 **`AuthContext.jsx`**
*   **What it is**: State Management for Users.
*   **What it does**: Handles Google Login/Logout logic and persistance.

### 📁 **`src/assets/`**
*   **`react.svg`**: Example image file.

---

## 📄 The Pages (`/src/pages`)
Full screen views.

### 1. **`Login.jsx`**
*   **Job**: The Login Screen.
*   **Details**: Features the Centered Glass Card and Google Button.

### 2. **`StudentDashboard.jsx`**
*   **Job**: Student Home.
*   **Details**: Shows Room Info or Survey Status.

### 3. **`WardenDashboard.jsx`**
*   **Job**: Warden Home.
*   **Details**: Shows Admin Stats and Allocation Controls.

### 4. **`Survey.jsx`**
*   **Job**: The Preference Form.
*   **Fields**: Wake Up Time, Light Preference, Cleanliness level.
*   **Logic**: Sends this data to the backend so the algorithm can use it.

---

## 🧩 The Components (`/src/components`)
Reusable UI blocks.

### 📄 **`Navbar.jsx`**
*   **Job**: Top Navigation Bar.
*   **Details**: Conditional rendering (hidden on Login).

### 📄 **`Layout.jsx`**
*   **Job**: Page Wrapper.
*   **Details**: Wrapper for Navbar + Content + Footer.

### 📄 **`RoomGrid.jsx`**
*   **Job**: Visual Room List.
*   **Details**: Renders grid of rooms with status colors.

### 📄 **`AllocationControl.jsx`**
*   **Job**: Admin Button.
*   **Details**: Triggers the Allocation Algorithm.
