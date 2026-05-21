# 🏗️ BeMIS SYSTEM ARCHITECTURE
## Visual Diagram for Capstone Presentation

---

## 📊 SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                      BEMIS SYSTEM FLOW                          │
└─────────────────────────────────────────────────────────────────┘

                          ┌─────────────┐
                          │  LANDING    │
                          │    PAGE     │
                          └──────┬──────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
              ┌──────────────┐        ┌───────────────┐
              │  LOGIN FORM  │        │  REGISTER     │
              │              │        │  (Secretary)  │
              └──────┬───────┘        └────────┬──────┘
                     │                        │
          ┌──────────┴───────────┬────────────┘
          ▼                      ▼
     ┌────────────┐      ┌──────────────────┐
     │  SECRETARY │      │   ADMIN PENDING  │
     │  DASHBOARD │      │   APPROVAL TAB   │
     └──────┬─────┘      └────────┬─────────┘
            │                     │
            │                 [APPROVE/REJECT]
            │                     │
            ▼                     ▼
    ┌──────────────────────────────────────┐
    │     MAIN DASHBOARD (Stats View)      │
    └──────┬───────────────────────────────┘
           │
    ┌──────┴──────────────────────────────────────────────────┐
    │                                                          │
    ▼                    ▼                   ▼               ▼
┌──────────┐  ┌──────────────────┐  ┌─────────────┐  ┌──────────┐
│INHABITANTS│  │ CERTIFICATIONS   │  │   CASES     │  │REPORTS   │
│ • Residents│  │ (Main Feature)   │  │ (KP)        │  │ & Export │
│ • Households│  │ • Issue Cert     │  │ • File Case │  │          │
│ • PWD      │  │ • Track Status   │  │ • Schedule  │  └──────────┘
│ • Senior   │  │ • Print PDF      │  │ • History   │
│ • Voters   │  └──────────────────┘  └─────────────┘
└──────────┘

    ▼                    ▼                   ▼               ▼
┌──────────┐  ┌──────────────────┐  ┌─────────────┐  ┌──────────┐
│LEGISLATION│  │ INCIDENTS        │  │ ASSETS      │  │SMART     │
│ • Ordinances│  │ • Complaints    │  │ • Equipment │  │TOOLS     │
│ • Resolutions│  │ • Track Status  │  │ • Maintenance│ │ • DSS    │
└──────────┘  └──────────────────┘  └─────────────┘  │ • AI Draft│
                                                      └──────────┘
```

---

## 🔄 CERTIFICATION ISSUANCE FLOW

```
                    ┌──────────────────────┐
                    │ Secretary Clicks      │
                    │ "Issue Certificate"   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Select Resident      │
                    │ From Dropdown        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
          ┌─────────►│ System Auto-Checks   │
          │         │ Cross-Barangay Cases │
          │         └──────────┬───────────┘
          │                    │
          │        ┌───────────┴───────────┐
          │        ▼                       ▼
          │   ┌─────────────┐      ┌─────────────┐
          │   │ FOUND CASES │      │ NO CASES    │
          │   │ (Alert User)│      │ (Clear)     │
          │   └─────────────┘      └────┬────────┘
          │        │                    │
          │        ▼                    ▼
          │   ┌──────────────────────────────────┐
          │   │ Secretary Decides: Accept/Decline│
          │   └──────────┬─────────────────────┘
          │              │
          ▼              │
    ┌──────────┐        ▼
    │ HOLD     │   ┌──────────────────┐
    │CERT      │   │ Fill Certificate │
    │          │   │ Details:         │
    └──────────┘   │ • Type           │
                   │ • Purpose        │
                   │ • (Optional DSS) │
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
              ┌───►│ Click SUBMIT     │◄────────┐
              │    └────────┬─────────┘         │
              │             │                  │
              │  ┌──────────┴──────────┐       │
              │  ▼                     ▼       │
         ┌─────────────┐      ┌──────────────┐│
    ┌───►│DSS APPROVED │      │ DSS DENIED   ││
    │    │ OR FLAGGED  │      │ (BLOCK)      ││
    │    └────────┬────┘      └──────────────┘│
    │             │                           │
    └─────────────┴───────────────────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │ Certificate Created │
        │ Status: PENDING     │
        └──────────┬──────────┘
                   │
    ┌──────────────┼──────────────┐
    ▼              ▼              ▼
┌─────────┐  ┌──────────┐  ┌──────────────┐
│PROCESS  │  │ ON HOLD  │  │ RELEASE      │
│Button   │  │ Button   │  │ Button       │
└────┬────┘  └──────────┘  └────┬─────────┘
     │                          │
     ▼                          ▼
┌────────────┐          ┌─────────────────┐
│PROCESSING  │          │RELEASED STATUS  │
│Status      │          │                 │
└────────────┘          │PDF Generated    │
                        │Ready for Print  │
                        │OR Number Issued │
                        └─────────────────┘
```

---

## 🔐 USER AUTHENTICATION FLOW

```
┌────────────────────────────────┐
│  User Goes to Landing Page     │
│  http://localhost:5173/        │
└────────────┬───────────────────┘
             │
             ▼
    ┌────────────────────┐
    │  Click "Portal     │
    │  Access" Button    │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │  Login Modal Opens │
    │  Enter Email       │
    │  Enter Password    │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │  Validate against  │
    │  Backend (JWT)     │
    └────────┬───────────┘
             │
      ┌──────┴──────┐
      ▼             ▼
  ┌────────┐   ┌──────────┐
  │INVALID │   │  VALID   │
  │Cred    │   │  Login   │
  └────────┘   └────┬─────┘
                    │
             ┌──────┴──────┐
             ▼             ▼
        ┌─────────┐   ┌─────────┐
        │SECRETARY│   │ ADMIN   │
        │Account  │   │ Account │
        └────┬────┘   └────┬────┘
             │             │
             ▼             ▼
     ┌────────────────┐  ┌─────────────┐
     │ Secretary      │  │ Admin       │
     │ Dashboard      │  │ Dashboard   │
     │ (1 barangay)   │  │ (All data)  │
     └────────────────┘  └─────────────┘
```

---

## 🗄️ DATABASE STRUCTURE

```
┌─────────────────────────────────────────────────────────┐
│              FIREBASE FIRESTORE DATABASE                │
└─────────────────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Users      │  │  Residents   │  │ Households   │
│              │  │              │  │              │
│ • ID         │  │ • ID         │  │ • ID         │
│ • Email      │  │ • Name       │  │ • Head ID    │
│ • Password   │  │ • Age        │  │ • Members    │
│ • Role       │  │ • Barangay   │  │ • Address    │
│ • Barangay   │  │ • Address    │  │ • Barangay   │
│ • Verified   │  │ • Status     │  │ • Status     │
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│Certifications│  │   Cases      │  │  Incidents   │
│              │  │              │  │              │
│ • ID         │  │ • ID         │  │ • ID         │
│ • Resident   │  │ • Number     │  │ • Type       │
│ • Type       │  │ • Complainant│  │ • Date       │
│ • Purpose    │  │ • Respondent │  │ • Desc       │
│ • Status     │  │ • Type       │  │ • Status     │
│ • OR Number  │  │ • Status     │  │ • Priority   │
│ • Date       │  │ • Date       │  │ • Date       │
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Ordinances  │  │   Assets     │  │  DRRM/GAD    │
│              │  │              │  │              │
│ • ID         │  │ • ID         │  │ • ID         │
│ • Title      │  │ • Name       │  │ • Title      │
│ • Type       │  │ • Type       │  │ • Type       │
│ • Date       │  │ • Location   │  │ • Date       │
│ • Text       │  │ • Condition  │  │ • Budget     │
│ • Status     │  │ • Value      │  │ • Status     │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 🔄 OFFLINE-FIRST SYNC MECHANISM

```
┌─────────────────────────────────────────────────────┐
│           OFFLINE-FIRST DATA FLOW                   │
└─────────────────────────────────────────────────────┘

WITH INTERNET:
┌─────────────┐    ◄──────►    ┌──────────────┐
│   Browser   │    REAL-TIME   │ Firebase     │
│ LocalStorage│    SYNC        │ Firestore    │
└─────────────┘                └──────────────┘
  (Cached)                       (Cloud Source)

WITHOUT INTERNET:
┌─────────────┐
│   Browser   │
│ LocalStorage│  ◄─ Uses cached data
│             │  ◄─ All features work
└─────────────┘

WHEN INTERNET RETURNS:
┌─────────────┐
│   Browser   │
│ LocalStorage│
└──────┬──────┘
       │ Auto-detects online
       │
       ▼
   Check for:
   • New data
   • Updates
   • Conflicts
       │
       ▼
┌──────────────┐
│ Firebase     │  ◄─ Sync complete
│ Firestore    │  ◄─ Data consistent
└──────────────┘
```

---

## 👥 ROLE-BASED ACCESS CONTROL

```
┌────────────────────────────────────────────────────┐
│         ROLE-BASED PERMISSIONS                     │
└────────────────────────────────────────────────────┘

ADMIN:
├─ See all 15 barangays data
├─ System-wide statistics
├─ User approval management
├─ Barangay profile management
├─ All reports aggregated
├─ Settings access
└─ Full system configuration

SECRETARY:
├─ Only their assigned barangay
├─ Resident management (own barangay)
├─ Certification issuance (own barangay)
├─ Case management (own barangay)
├─ Create reports for own barangay
├─ Cannot see other barangay data
└─ Cannot approve users
```

---

## 🎯 KEY INNOVATION HIGHLIGHTS

```
1. OFFLINE-FIRST
   ├─ Works without internet ✓
   ├─ LocalStorage caching ✓
   ├─ Firebase sync on reconnect ✓
   └─ No data loss ✓

2. AI DECISION SUPPORT
   ├─ Auto-check case history ✓
   ├─ Flag ineligible residents ✓
   ├─ Smart recommendations ✓
   └─ Reduce human error ✓

3. MOBILE-READY
   ├─ Responsive design ✓
   ├─ PWA technology ✓
   ├─ Install as app ✓
   └─ Works on phones/tablets ✓

4. SCALABLE ARCHITECTURE
   ├─ 15 barangays covered ✓
   ├─ Firebase unlimited users ✓
   ├─ Role-based isolation ✓
   └─ Real-time sync ✓

5. COMPREHENSIVE MODULES
   ├─ 10 modules integrated ✓
   ├─ Resident to certification ✓
   ├─ Case management to reports ✓
   └─ AI tools included ✓
```

---

## 📱 TECHNOLOGY STACK

```
FRONTEND:
┌─────────────────────────────────────┐
│ React 19.2.4                        │
│ Vite (Build tool)                   │
│ TailwindCSS (Styling)               │
│ Lucide React (Icons)                │
│ Axios (HTTP Client)                 │
│ React Router (Navigation)           │
│ Recharts (Charts)                   │
│ jsPDF (PDF Generation)              │
│ PouchDB Browser (Offline storage)   │
└─────────────────────────────────────┘

BACKEND:
┌─────────────────────────────────────┐
│ Node.js v18+                        │
│ Express.js (Framework)              │
│ Firebase Admin (Auth & DB)          │
│ Bcrypt (Password hashing)           │
│ JWT (Token authentication)          │
│ Nodemon (Dev server)                │
└─────────────────────────────────────┘

DATABASE:
┌─────────────────────────────────────┐
│ Firebase Firestore (Cloud)          │
│ LocalStorage (Browser cache)        │
│ PouchDB (Offline sync)              │
└─────────────────────────────────────┘

DEPLOYMENT:
┌─────────────────────────────────────┐
│ Vercel (Frontend hosting)           │
│ Firebase Functions (Backend)        │
│ Firebase Firestore (Database)       │
│ PWA (Mobile app)                    │
└─────────────────────────────────────┘
```

---

## 🚀 DEPLOYMENT ARCHITECTURE

```
┌────────────────────────────────────────────────┐
│            PRODUCTION DEPLOYMENT               │
└────────────────────────────────────────────────┘

┌─────────────┐          ┌──────────────┐
│   Users     │          │   Desktop    │
│ (Secretary) ◄─────────►│   Browser    │
│             │          │ (BeMIS UI)   │
└─────────────┘          └──────┬───────┘
      │                         │
      │                         ▼
      │                  ┌─────────────┐
      │                  │ Vercel CDN  │
      │                  │ (Frontend)  │
      │                  └──────┬──────┘
      │                         │
      └────────────┬────────────┘
                   │
                   ▼
          ┌────────────────┐
          │ HTTPS Requests │
          └────────┬───────┘
                   │
                   ▼
       ┌───────────────────────┐
       │  Firebase Services    │
       ├───────────────────────┤
       │ • Authentication      │
       │ • Firestore Database  │
       │ • Cloud Storage       │
       │ • Real-time Sync      │
       └───────────────────────┘
```

---

**Ready to explain the system! 🎓**
