<div align="center">

# 🚀 AssetFlow

### Enterprise Asset & Resource Management System

<img src="docs/logo.png" width="180"/>

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green?logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-success?logo=mongodb)
![Clerk](https://img.shields.io/badge/Authentication-Clerk-purple)
![Cloudinary](https://img.shields.io/badge/Storage-Cloudinary-blue)
![License](https://img.shields.io/badge/License-MIT-orange)

### Odoo Hackathon

**An Enterprise Resource Planning (ERP) platform for intelligent Asset & Resource Management**

</div>

---

# 📌 Overview

AssetFlow is a modern Enterprise Asset & Resource Management System designed to simplify how organizations manage physical assets, shared resources, maintenance workflows, audit cycles, and operational reporting.

Instead of relying on spreadsheets or manual tracking, AssetFlow provides a centralized ERP platform that enables organizations to monitor the complete lifecycle of assets while maintaining transparency, accountability, and operational efficiency.

The platform is designed to be generic, making it suitable for:

- 🏢 Corporate Offices
- 🏫 Educational Institutions
- 🏥 Hospitals
- 🏭 Manufacturing Industries
- 🏛 Government Organizations
- 🚗 Logistics Companies
- 🏢 Co-working Spaces

---

# 🎯 Problem Statement

Organizations often struggle with:

- Manual asset tracking
- Double allocation of equipment
- Resource booking conflicts
- Missing maintenance records
- Difficult audit processes
- Lack of centralized reports
- Poor visibility of asset lifecycle

AssetFlow solves these problems by providing a structured ERP workflow with role-based management and automated lifecycle tracking.

---

# 🌟 Key Features

## 🔐 Authentication

- Clerk Authentication
- Secure Login
- Secure Signup
- Session Management
- Forgot Password
- Role-Based Access

---

## 📊 Dashboard

- Live KPI Cards
- Asset Overview
- Active Bookings
- Pending Transfers
- Upcoming Returns
- Maintenance Summary
- Recent Activities
- Quick Actions

---

## 🏢 Organization Management

- Department Management
- Employee Directory
- Asset Categories
- Role Assignment
- Department Hierarchy

---

## 📦 Asset Management

- Register Assets
- Asset Directory
- QR Code Generation
- Asset Tag Generation
- Asset Timeline
- Search & Filters
- Cloudinary Upload
- Asset Lifecycle Tracking

---

## 🔄 Asset Allocation

- Allocate Assets
- Return Assets
- Transfer Requests
- Conflict Detection
- Allocation History

---

## 📅 Resource Booking

- Calendar Booking
- Meeting Rooms
- Equipment Booking
- Vehicle Booking
- Overlap Validation
- Booking History

---

## 🛠 Maintenance

- Raise Request
- Approval Workflow
- Technician Assignment
- Progress Tracking
- Resolution History

---

## 📝 Audit Module

- Audit Cycle
- Auditor Assignment
- Asset Verification
- Discrepancy Report
- Audit History

---

## 📈 Reports & Analytics

- Asset Utilization
- Maintenance Reports
- Booking Reports
- Department Reports
- Asset Distribution
- Export CSV
- Export PDF

---

## 🔔 Notifications

- Real-time Alerts
- Booking Reminders
- Maintenance Alerts
- Transfer Notifications
- Audit Notifications

---

## 📜 Activity Logs

- Complete Audit Trail
- User Activities
- Role Changes
- Asset Updates
- Booking History

---

# 🏗 System Architecture

```
                Clerk Authentication
                        │
                        ▼
                 React Frontend
                        │
                        ▼
                  FastAPI Backend
                        │
     ┌──────────────────┼───────────────────┐
     ▼                  ▼                   ▼
 MongoDB Atlas     Cloudinary         Clerk JWT
```

---

# 👥 User Roles

## Admin

- Manage Departments
- Manage Employees
- Assign Roles
- Create Audit Cycles
- View Reports

---

## Asset Manager

- Register Assets
- Allocate Assets
- Approve Transfers
- Manage Maintenance

---

## Department Head

- View Department Assets
- Approve Transfers
- Book Shared Resources

---

## Employee

- View Assigned Assets
- Book Resources
- Raise Maintenance Requests
- Request Transfers

---

# 🔄 Asset Lifecycle

```
Available
    │
    ▼
Allocated
    │
    ▼
Returned
    │
    ▼
Available
    │
    ▼
Maintenance
    │
    ▼
Available
    │
    ▼
Retired
    │
    ▼
Disposed
```

Lost status is updated through Audit Verification.

---

# 💻 Technology Stack

## Frontend

- React.js
- JavaScript
- Tailwind CSS
- React Router
- Axios
- React Hook Form
- Recharts
- React Calendar
- React Icons

---

## Backend

- FastAPI
- Python
- Beanie ODM
- Motor
- Pydantic

---

## Database

MongoDB Atlas

---

## Authentication

Clerk

---

## File Storage

Cloudinary

---

## Deployment

Frontend

- Netlify

Backend

- Netlify

---

# 📁 Project Structure

```
AssetFlow/

frontend/

backend/

docs/

README.md
```

---

# 📂 Frontend Structure

```
src/

components/

pages/

layouts/

routes/

hooks/

services/

context/

utils/

assets/

styles/
```

---

# 📂 Backend Structure

```
backend/

app/

api/

models/

schemas/

services/

database/

middleware/

utils/

main.py
```

---

# 🗃 Database Collections

```
employees

departments

categories

assets

asset_history

allocations

transfers

bookings

maintenance

audits

audit_records

notifications

activity_logs
```

---

# 🔐 Security

- Clerk Authentication
- JWT Verification
- Protected APIs
- Role-Based Access
- Input Validation
- Secure Cloud Storage

---

# 📊 ERP Workflow

```
Authentication

↓

Organization Setup

↓

Asset Registration

↓

Allocation

↓

Booking

↓

Maintenance

↓

Audit

↓

Reports

↓

Notifications
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/yourusername/AssetFlow.git
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

pip install -r requirements.txt

uvicorn app.main:app --reload
```

---

# Environment Variables

Frontend

```env
VITE_CLERK_PUBLISHABLE_KEY=

VITE_API_URL=
```

Backend

```env
CLERK_SECRET_KEY=

MONGO_URI=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=
```

---

# 👨‍💻 Team

| Member | Responsibility |
|----------|----------------|
| Member 1 | Authentication, Dashboard, Organization |
| Member 2 | Asset Management |
| Member 3 | Allocation, Booking, Maintenance |
| Member 4 | Audit, Reports, Integration |

---

# 🎯 Future Scope

- Mobile Application
- AI Predictive Maintenance
- IoT Integration
- RFID Asset Tracking
- Barcode Scanner
- OCR Invoice Upload
- Offline Synchronization
- Email Notifications
- SMS Alerts
- Analytics Dashboard

---

# 📜 License

This project is licensed under the MIT License.

---

<div align="center">

### Built with ❤️ for Odoo Hackathon 2026

**Team AssetFlow**

</div>
