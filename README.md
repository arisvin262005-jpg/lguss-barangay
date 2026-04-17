# Offline-First Barangay Management System
**Project for Mamburao, Occidental Mindoro Barangays**

## Overview
A comprehensive, production-ready, full-stack web application with offline-first capabilities built for barangay management.

## Tech Stack
* **Frontend:** React.js, Vite, Tailwind CSS (PWA-ready)
* **Backend:** Node.js, Express.js
* **Database:** PouchDB (Local), CouchDB (Remote - ready)
* **Features:** Blockchain Audit Trail (Hash Chain), AES-256 Encryption, DSS Rules Engine, GPS Tracking Map.

## Features
1. **Secure Auth & RBAC:** Admin, Secretary, Tanod, Viewer roles with specific access boundaries.
2. **Offline-First Sync:** PouchDB automatically handles local caching and synchronizes to the server upon reconnection.
3. **Resident Profiling:** Add, update, and manage barangay constituents.
4. **Rule-Based Decision Support System (DSS):** Evaluates residents automatically for case clearances before issuing certificates.
5. **Certifications & Reports:** Generates PDFs & CSVs for clearance issuance and masterlists.
6. **KP Case Management:** Secure dispute filing, privacy locks on fields, and mediation status tracking.
7. **Blockchain Audit Trail:** Simulated hash chain ensuring data integrity across changes.
8. **Real-time GPS Tracking:** Monitor Tanods on duty via Leaflet maps.

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+ recommended)
- Optional: CouchDB running locally or online for real sync (Currently uses in-memory mock backend sync for rapid testing).

### 2. Environment Variables
In the `backend` folder, duplicate `.env.example` as `.env`.
Change any keys if needed.

### 3. Installation
Open two terminal windows.

**Terminal 1 (Backend):**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application
The frontend runs at: `http://localhost:5173`
The backend runs at: `http://localhost:5000`

### 5. Demo Accounts
* **Admin:** admin@barangay.gov.ph / admin123
* **Secretary:** secretary@barangay.gov.ph / admin123
* **Tanod:** tanod@barangay.gov.ph / admin123

## Notes
- To use actual CouchDB instead of the in-memory array backend, modify the `syncService.js` and `db.js`.
- GPS tracking data currently simulates random movement. Integration with a real GPS endpoint is required for production devices.
