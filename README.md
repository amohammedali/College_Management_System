# 🎓 EduCMS – College Management System

A comprehensive, gamified, and fully responsive College Management System built using the **MERN Stack (MongoDB, Express.js, React, Node.js)**. EduCMS streamlines academic management, faculty administration, and student engagement through powerful dashboards, real-time tracking, and modern UI/UX.

---

## 🌟 Features

### 🔐 Role-Based Authentication & Portals

* Secure JWT-based authentication
* Dedicated dashboards for:

  * 👨‍💼 Admin
  * 👨‍🏫 Staff / Faculty
  * 🎓 Students

### 🏆 Gamified Student Experience

* Dynamic XP-based leaderboard system
* Ranking calculated using:

  * Academic Performance (CGPA)
  * Attendance Percentage
* Anonymous mode for healthy competition and privacy

### 📚 Academic Management

* Subject Management
* Timetable Scheduling
* Assignment Creation & Submission Tracking
* Marks & Grade Management
* Attendance Monitoring
* Student Performance Analytics

### 👨‍💼 Administration Tools

* Manage Students and Staff
* Department-wise Organization
* Academic Records Management
* Dashboard Statistics & Reports

### 🎨 Modern User Interface

* Dark Glassmorphism Design
* Fully Responsive Layouts
* Interactive Data Tables
* Skeleton Loaders
* Smooth Animations with Framer Motion
* Mobile-Friendly Off-Canvas Navigation

---

## 🛠️ Tech Stack

### Frontend

| Technology      | Usage                        |
| --------------- | ---------------------------- |
| React 18        | User Interface               |
| Vite            | Fast Development Environment |
| React Router v6 | Routing                      |
| Tailwind CSS v3 | Styling                      |
| Framer Motion   | Animations                   |
| Lucide React    | Icons                        |

### Backend

| Technology | Usage               |
| ---------- | ------------------- |
| Node.js    | Runtime Environment |
| Express.js | REST API            |
| MongoDB    | Database            |
| Mongoose   | ODM                 |
| JWT        | Authentication      |
| bcrypt     | Password Hashing    |

---

## 📂 Project Structure

```bash
College_Management_System/
│
├── backend/
│   ├── src/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── controllers/
│   └── seed files
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   └── assets/
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

Make sure the following are installed:

* Node.js (v18+ recommended)
* MongoDB Community Server or MongoDB Atlas
* Git

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/amohammedali/College_Management_System.git

cd College_Management_System
```

---

## 2️⃣ Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=5000

MONGODB_URI=mongodb://127.0.0.1:27017/college_db

JWT_SECRET=your_super_secret_key_here
```

Start the backend server:

```bash
npm run dev
```

Backend will run on:

```bash
http://localhost:5000
```

---

## 3️⃣ Frontend Setup

Open a new terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Frontend will run on:

```bash
http://localhost:5173
```

---

## 🌱 Seed Initial Data

To populate the database with demo users:

```bash
cd backend
```

Create Admin:

```bash
npx tsx src/seedAdmin.ts
```

Create Student Dataset:

```bash
npx tsx src/seedStudent1.ts
```

---

## 🔑 Demo Credentials

### 👨‍💼 Admin Portal

```text
Email: admin@college.com
Password: admin123
```

### 👨‍🏫 Staff / Faculty Portal

```text
Email: staff@college.com
Password: staff123
```

or

```text
Email: m.wilson@college.com
Password: staff123
```

### 🎓 Student Portal

```text
Email: student101@college.com
Password: student123
```

---

## 📱 Mobile Responsiveness

EduCMS is designed with a mobile-first approach.

### Features

* Responsive Dashboard Layouts
* Off-Canvas Sidebar Navigation
* Adaptive Data Tables
* Optimized Mobile Forms
* Touch-Friendly User Experience

On screens smaller than **1024px**, the sidebar automatically transforms into a hamburger menu for maximum screen utilization.

---

## 🔒 Security Features

* JWT Authentication
* Password Hashing with bcrypt
* Protected Routes
* Role-Based Authorization
* Secure API Access

---

## 📈 Future Enhancements

* AI-Powered Academic Assistant
* Student Performance Prediction
* Attendance Face Recognition
* Real-Time Notifications
* Parent Portal
* Fee Management System
* Online Examination Module
* Result Analytics Dashboard

---

## 🤝 Contributing

This project is currently maintained for educational and institutional purposes.

If you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---

## 📜 License

This project is proprietary software developed for educational and institutional use.

Unauthorized commercial redistribution or resale is prohibited.

---

## 👨‍💻 Author

**Mohammed Ali**

Full Stack Developer | MERN Stack Enthusiast | AI & Web Development

GitHub: https://github.com/amohammedali

---

⭐ If you found this project useful, consider giving it a star on GitHub!
