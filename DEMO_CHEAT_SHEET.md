# 🎯 BeMIS DEMO CHEAT SHEET
## Quick Reference Card for Capstone Presentation

---

## 🔐 LOGIN CREDENTIALS

**SECRETARY (Demo):**
```
Email: brgy1@mamburao.gov.ph
Pass:  password123
```

**ADMIN (Demo):**
```
Email: admin@mamburao.gov.ph
Pass:  password123
```

**URLS:**
```
System:  http://localhost:5173/
Backend: http://localhost:5000/api/health
```

---

## 📱 QUICK DEMO FLOW (15-20 min)

### 1. LANDING PAGE (2 min)
```
GO TO: http://localhost:5173/
- Show: Logo branding "BeMIS — Mamburao"
- Show: 7 modules in hero section
- Show: Statistics (15 barangays, 7 modules)
- Show: "Portal Access" button
```

### 2. LOGIN (1 min)
```
- Click: "Portal Access"
- Enter: brgy1@mamburao.gov.ph / password123
- Click: Sign In
```

### 3. SECRETARY DASHBOARD (2 min)
```
Highlight:
- Stats cards (Households, Pending Certs, Cases, Monthly)
- Charts (Monthly trends, case distribution)
- "Issue Certificate" button
- Offline status indicator
```

### 4. CERTIFICATIONS - MAIN FEATURE (5 min)
```
PATH: Issuances → Certifications

SHOW:
- Certificate list with statuses
- Search & filter
- OR Numbers, Issue dates

CLICK: "Issue Certificate"
FILL:
- Resident selector
- System auto-checks cases
- Certificate type
- Purpose
- Optional DSS check

SUBMIT: Shows certificate created
ACTION: Click "Process" then "Release"
```

### 5. CASES MODULE (2 min)
```
PATH: Katarungang Pambarangay → Case List

SHOW:
- Case list with statuses
- Case numbers
- Complainant/Respondent
- Click case to see details
```

### 6. RESIDENTS (2 min)
```
PATH: Inhabitants → Resident Profiling

SHOW:
- Resident database
- Search functionality
- Filters
- Resident details
```

### 7. ADMIN SETTINGS (3 min)
```
LOGOUT from Secretary
LOGIN as: admin@mamburao.gov.ph / password123

PATH: Settings

SHOW 4 TABS:
1. Pending Approvals - approve/reject users
2. User Management - all users table
3. Barangay Profiles - 15 barangays listed
4. System Info - BeMIS v2.0 details
```

### 8. REPORTS (2 min)
```
PATH: Reports → Reports & Analytics

SHOW:
- Report options (Resident, Certification, Cases)
- Export buttons (CSV, PDF)
- Statistics
```

---

## 🎬 TALKING POINTS

**Opening:**
"Ang BeMIS ay comprehensive digital solution para sa Mamburao. Nag-automate ng resident profiling, certifications, at case management."

**On Dashboard:**
"Real-time overview ng barangay operations. Nakikita ng Secretary ang important metrics at quick access sa main functions."

**On Certifications:**
"Ito ang core feature. May AI eligibility check na automatic nag-screen ng active cases. Nag-generate ng professional PDF certificates."

**On Cases:**
"Digital tracking ng mediation cases. May hearing schedule management at case history."

**On Residents:**
"Central database ng lahat ng residents. Organized by household, searchable, at linked sa certification eligibility."

**On Admin:**
"Admin nakikita lahat ng barangays. Nag-manage ng user approvals, nag-monitor ng system-wide statistics."

**Closing:**
"Ang system ay offline-first, AI-powered, at mobile-ready. Ready na para sa production deployment."

---

## ⚡ KEY FEATURES TO MENTION

1. ✅ **Offline-First** - Works without internet
2. ✅ **AI Decision Support** - Smart eligibility checking
3. ✅ **Role-Based Access** - Secretary vs Admin separation
4. ✅ **Real-Time Sync** - Firebase integration
5. ✅ **10 Modules** - Comprehensive coverage
6. ✅ **Mobile PWA** - Works on phones
7. ✅ **Professional UI** - Clean and intuitive

---

## 🚨 IF SOMETHING BREAKS

**Issue: System won't load**
```
FIX: Check terminals
- Backend: http://localhost:5000 should show "API Health: ✅"
- Frontend: http://localhost:5173 should show landing page
```

**Issue: Can't login**
```
FIX: Try these in order:
1. Refresh page (F5)
2. Clear browser cache
3. Try different browser
4. Restart both servers
```

**Issue: Certification can't be issued**
```
FIX: Check:
- Resident is selected
- Certificate type is selected
- Purpose is filled
- No case conflicts
- No declined cases
```

**Issue: Demo feels slow**
```
FIX: 
- Close other browser tabs
- Reduce number of open programs
- Use faster internet connection
```

---

## 📸 IMPORTANT SECTIONS TO SCREENSHOT

Have these ready as backup if demo fails:

1. Landing page with BeMIS branding
2. Secretary dashboard with stats
3. Certificate list with statuses
4. Issue certificate form with DSS check
5. Case list
6. Admin settings with all users
7. Reports section with export options
8. Residents database
9. Certifications PDF output

---

## 💬 LIKELY QUESTIONS & SHORT ANSWERS

**Q: Ano ang stack?**
A: "React frontend, Node.js backend, Firebase database, PWA technology."

**Q: Scalable ba para sa 15 barangays?**
A: "Yes. Firebase handles unlimited concurrent users. Tested with mock data for all 15 barangays."

**Q: Secure ba?**
A: "Yes. JWT authentication, role-based access, encrypted passwords, no cross-barangay data leak."

**Q: Offline kaya talaga?**
A: "Yes. LocalStorage + In-memory database. Automatic Firebase sync when back online."

**Q: May real-time chat o notification?**
A: "May chatbot AI assistant. Real-time notifications via Firebase."

**Q: Production ready ba?**
A: "Yes. Code is clean, documented, and tested. Ready for deployment sa LGU servers."

---

## ✍️ BEFORE PRESENTATION CHECKLIST

- [ ] Both terminals running (backend + frontend)
- [ ] Browsers open at http://localhost:5173
- [ ] Tested login with both accounts
- [ ] Practiced clicking through all modules
- [ ] Have notes/script printed out
- [ ] Backup laptop charged
- [ ] Screenshots saved in case demo fails
- [ ] Presentation outfit ready
- [ ] Got coffee/water
- [ ] Deep breathing ✨

---

## 🎓 FINAL TIPS

✅ **Be confident** - You built this amazing system!
✅ **Go slow** - Let committee see clearly
✅ **Explain why** - Not just features, but benefits
✅ **Handle errors gracefully** - "Let me try refreshing..." (stay calm)
✅ **Make eye contact** - Talk to committee, not just screen
✅ **Smile** - You're about to graduate! 🎉

---

**YOU GOT THIS! 💪 Good luck sa presentation! 🎓**
