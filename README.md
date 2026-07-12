# 🚀 AssetFlow

<div align="center">

### Enterprise Asset & Resource Management System

*A modern enterprise platform for managing organizational assets, employees, departments, bookings, maintenance, audits, analytics, and notifications.*

---

![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)
![Python](https://img.shields.io/badge/Python-3.13-blue?logo=python)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

# 📖 Overview

AssetFlow is an **Enterprise Resource Planning (ERP)** solution built to simplify and automate asset lifecycle management.

The system enables organizations to manage:

- Asset Inventory
- Employee Allocation
- Department Management
- Asset Booking
- Maintenance Requests
- Audit Management
- Analytics & Reports
- Notifications
- User Management

AssetFlow is built using a modern full-stack architecture with a responsive enterprise UI and scalable backend services.

---

# ✨ Features

## 👤 Authentication

- Secure Login
- Clerk Authentication
- Role-Based Access Control
- Session Management

---

## 👥 User Management

- Employee Management
- Role Assignment
- Profile Management
- Access Control

---

## 🏢 Department Management

- Create Departments
- Update Departments
- Department Analytics
- Department Assets

---

## 📦 Asset Management

- Asset Registration
- Categories
- Asset Status Tracking
- Asset Allocation
- Asset Transfers
- Asset History

---

## 📅 Booking Management

- Resource Booking
- Calendar View
- Booking Approval
- Booking History

---

## 🔧 Maintenance

- Maintenance Requests
- Service Scheduling
- Maintenance History
- Asset Health Tracking

---

## 📋 Audit Management

- Audit Cycles
- Asset Verification
- Audit Dashboard
- Verification Status
- Audit Summary
- Discrepancy Reports

---

## 📊 Reports & Analytics

- Dashboard KPIs
- Asset Utilization
- Department Analytics
- Maintenance Trends
- Booking Analytics
- Audit Analytics
- Export Reports

---

## 🔔 Notifications

- Notification Center
- Activity Timeline
- Approval Notifications
- Maintenance Alerts
- Audit Notifications
- Booking Updates
- Read / Unread Management

---

# 🏗 Project Architecture

```
AssetFlow
│
├── frontend
│
├── backend
│
├── database
│
└── documentation
```

---

# 💻 Tech Stack

## Frontend

- React 19
- React Router DOM
- Axios
- React Hook Form
- Recharts
- React Icons
- CSS
- Clerk Authentication

---

## Backend

- FastAPI
- Python
- Beanie ODM
- Pydantic
- Uvicorn

---

## Database

- MongoDB Atlas

---

## Cloud

- Cloudinary

---

## Version Control

- Git
- GitHub

---

# 📁 Frontend Structure

```
src/

assets/

components/
    common/
    forms/
    layout/
    ui/
    workflows/

constants/

context/

hooks/

layouts/

pages/

routes/

services/

styles/

utils/

App.jsx

main.jsx
```

---

# 📁 Backend Structure

```
backend/

app/

api/

models/

schemas/

services/

database/

config/

constants/

utils/

main.py
```

---

# 🎨 Design System

AssetFlow follows a centralized **Neumorphism Design System**.

### Design Principles

- Soft UI
- Enterprise Dashboard
- Fully Responsive
- Accessibility First
- Component Driven
- Reusable Architecture
- Clean Layouts

---

# 📱 Responsive Design

Supports

- Desktop
- Laptop
- Tablet
- Mobile

---

# 🔒 Authentication

Authentication is implemented using **Clerk**.

Supports

- Login
- Logout
- Session Management
- Protected Routes
- Role-Based Authorization

---

# 📊 Database Collections

```
users

employees

departments

assets

categories

bookings

maintenance

audit_cycles

audit_records

reports

report_snapshots

analytics_cache

notifications

activity_logs

notification_preferences
```

---

# 🔌 API Modules

```
Authentication

Users

Departments

Employees

Assets

Categories

Bookings

Maintenance

Audit

Reports

Notifications

Activity Logs
```

---

# 🧩 Development Workflow

Each feature follows the same workflow.

```
Setup

↓

Foundation

↓

Frontend Development

↓

Backend Development

↓

Database

↓

API Integration

↓

Testing

↓

Commit

↓

Push

↓

Merge
```

---

# 👨‍💻 Team Responsibilities

## Member 1

Frontend Foundation

- Layout
- Navigation
- Theme
- Shared Components
- Authentication
- Dashboard Foundation

---

## Member 2

Asset Lifecycle

- Assets
- Categories
- Allocation
- Transfers

---

## Member 3

Operations

- Booking
- Maintenance
- Employee Management
- Department Management

---

## Member 4

Enterprise Modules

### Audit

- Frontend
- Backend
- Database
- APIs

### Reports

- Analytics Dashboard
- KPIs
- Charts
- Export

### Notifications

- Notification Center
- Activity Timeline
- Backend APIs
- MongoDB

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/your-org/AssetFlow.git

cd AssetFlow
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## Backend

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

---

# ⚙ Environment Variables

## Backend

```
APP_NAME=

APP_VERSION=

ENVIRONMENT=

SECRET_KEY=

MONGODB_URI=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

CLERK_SECRET_KEY=
```

---

## Frontend

```
VITE_API_BASE_URL=

VITE_CLERK_PUBLISHABLE_KEY=
```

---

# 🧪 Testing

Run frontend

```bash
npm run dev
```

Run backend

```bash
uvicorn app.main:app --reload
```

Swagger

```
http://127.0.0.1:8000/docs
```

---

# 📈 Future Enhancements

- QR Code Integration
- RFID Tracking
- AI Asset Prediction
- Predictive Maintenance
- Real-time Notifications
- WebSocket Support
- OCR Asset Verification
- Mobile Application
- Multi-Tenant Support
- AI Chat Assistant

---

# 🤝 Contributing

1. Fork Repository

2. Create Feature Branch

3. Commit Changes

4. Push Branch

5. Create Pull Request

---

# 📜 License

MIT License



<div align="center">

### AssetFlow

**Enterprise Asset & Resource Management Platform**

Built with ❤️ by the AssetFlow Development Team.

</div>
