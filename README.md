# 🎓 EduCMS: College Management System

A comprehensive, gamified, and fully-responsive College Management System built with the modern **MERN Stack** (MongoDB, Express, React, Node.js). Designed to streamline academic tracking, staff administration, and student engagement through beautiful, data-rich dashboards.

## 🌟 Key Features

* **Role-Based Portals:** Dedicated, secure dashboards for **Admins**, **Staff/Faculty**, and **Students**.
* **Gamified Student Leaderboards:** "Anonymous Mode Active" competitive peer ranking using dynamic XP points based on CGPA and attendance.
* **Academic Wizardry:** End-to-end management of Timetables, Subjects, Assignments, Marks, and Attendance.
* **Responsive Enterprise Design:** Fully mobile-responsive layouts featuring dark glassmorphism, off-canvas sidebars, and fluid data tables.
* **Smart UI/UX:** Built with Tailwind CSS and Framer Motion for buttery-smooth transitions, skeleton loaders, and interactive components.

## 💻 Tech Stack

### Frontend
* **Framework:** React 18 (via Vite)
* **Styling:** Tailwind CSS v3
* **Icons & Animation:** Lucide React, Framer Motion
* **Routing:** React Router v6

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (via Mongoose)
* **Authentication:** JSON Web Tokens (JWT) & bcrypt

## 🚀 Quick Start

### Prerequisites
Make sure you have Node.js and MongoDB installed on your system.

### 1. Clone the Repository
```bash
git clone https://github.com/amohammedali/College_Management_System.git
cd College_Management_System
```

### 2. Setup the Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory with your MongoDB connection string and JWT secret:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/college_db
JWT_SECRET=your_super_secret_key_here
```
Start the backend server:
```bash
npm run dev
```

### 3. Setup the Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application
The application will be running at `http://localhost:5173`. 

*Note: You can seed initial database data by running `npx tsx src/seedAdmin.ts` and `npx tsx src/seedStudent1.ts` inside the backend directory.*

### 🔑 Sample Test Credentials
Once the application is running and the database is seeded, use these accounts to explore the different portals:

**Admin Access**
- **Email:** `admin@college.com`
- **Password:** `admin123`

**Staff / Faculty Access**
- **Email:** `staff@college.com` (or `m.wilson@college.com`)
- **Password:** `staff123`

**Student Access (Full Dataset)**
- **Email:** `student101@college.com`
- **Password:** `student123`

## 📱 Mobile Responsiveness
The dashboard features an advanced responsive grid system. On screens smaller than 1024px, the sidebar transitions into an off-canvas drawer controlled via a sleek hamburger menu, ensuring 100% width utilization for critical data tables and charts.

## 📜 License
This project is proprietary and built for internal institutional use.
