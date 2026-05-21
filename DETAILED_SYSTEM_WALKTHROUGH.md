# 📖 BEMIS - DETAILED SYSTEM EXPLANATION
## Secretary Side at Admin Side - Complete Walkthrough

---

## PART 1: LANDING PAGE & LOGIN

### Landing Page (1 minute)

"Ang landing page ay ang first impression ng system.

**Nakikita ninyo dito:**

1. **Header Section**
   - Logo ng Mamburao Municipal Government
   - Barangay Logo
   - Bagong Pilipinas Government Logo
   - Title: **'BeMIS — Mamburao'** na may subtitle 'DILG · Occ. Mindoro'
   - Navigation menu: Home, Modules, Background, Coverage, FAQs
   - **'Portal Access'** button (click to login)

2. **Hero Section**
   - Main headline: Introducing BeMIS
   - Subheading: Explaining what the system does
   - Brief description ng benefits

3. **7 Core Modules Display**
   
   **Module 1: Offline-First Engine**
   - Icon: Server
   - Description: 'Saves transactions natively using LocalStorage and seamlessly syncs to Firebase Firestore upon internet restoration'
   - Meaning: Works kahit walang internet, automatic sync pagbalik ang connection
   
   **Module 2: Decision Support System (DSS)**
   - Icon: Target/Decision making
   - Description: 'Rule-based mechanism that analyzes past offenses and KP case records'
   - Meaning: AI nag-check ng case history para ma-decide kung eligible ba ang resident para sa certificate
   
   **Module 3: AI Predictive Analytics**
   - Icon: Brain/Circuit
   - Description: 'Identifies crime patterns within municipality using forecasting'
   - Meaning: Machine learning nag-predict ng crime trends para sa patrol optimization
   
   **Module 4: Katarungang Pambarangay**
   - Icon: Scale/Justice
   - Description: 'Secure digital mediation management for filing cases, scheduling hearings'
   - Meaning: Digital case management para sa dispute resolution
   
   **Module 5: Resident Profiling**
   - Icon: Users
   - Description: 'Organizes and tracks comprehensive resident and household demographic data'
   - Meaning: Central database ng lahat ng residents, organized by household
   
   **Module 6: Issuance Management**
   - Icon: FileText
   - Description: 'Handles automated generation of clearances, permits, and certificates'
   - Meaning: Automatic certificate generation with professional formatting
   
   **Module 7: DRRM & GAD Plan**
   - Icon: Shield/Alert
   - Description: 'Supports proactive budgeting and disaster readiness planning'
   - Meaning: Disaster risk reduction at gender advocacy programs tracking

4. **Statistics Section**
   - 15 Barangays Covered
   - 100% System Uptime
   - 7 Integrated Modules
   - 2024 Year Deployed

5. **Portal Access Button**
   - Red button na malinaw visible
   - Click to open login modal"

---

### Login Process (1 minute)

"Mag-click ng 'Portal Access' button.

**Makikita ninyo ang login form:**

**Elements ng Login Form:**
1. **System Logo** - BeMIS logo at title
2. **Email/Username Field**
   - Placeholder text: 'Enter your email'
   - Example: brgy1@mamburao.gov.ph
3. **Password Field**
   - Masked input (dots, hindi visible ang characters)
   - Placeholder: 'Enter your password'
4. **Sign In Button**
   - Blue button na 'SIGN IN'
   - Nag-disable kung walang email or password
5. **Create Account Link**
   - 'New user? Create account here' - para sa registration

**Demo Login:**

**Secretary Account:**
- Email: **brgy1@mamburao.gov.ph**
- Password: **password123**

**Admin Account:**
- Email: **admin@mamburao.gov.ph**
- Password: **password123**

[Click Sign In]

**Pagkatapos mag-click:**
- Loading spinner appears
- Backend validates credentials
- If correct: Dashboard loads
- If wrong: Red error message 'Invalid email or password'"

---

## PART 2: SECRETARY DASHBOARD - DETAILED

### Dashboard Overview (2 minutes)

"Pagkapasok ng Secretary, makikita niya ang **Dashboard**. Ito ang 'home' ng system.

**Top Section - Header:**

1. **Sidebar Logo & Title**
   - BeMIS logo
   - Title 'BeMIS' with subtitle 'Barangay Management & Information'
   - Hamburger menu (expand/collapse)

2. **Top Navigation Bar**
   - User profile picture/icon
   - User name (e.g., 'Monica Robles')
   - Role badge: 'Secretary'
   - Barangay name: 'Barangay 1 (Poblacion)'
   - Online/Offline status (green = online, red = offline)
   - Sync status (shows if data is syncing with cloud)
   - Refresh button
   - Logout button

**Main Dashboard Content:**

1. **Statistics Cards (4 cards in a row)**

   **Card 1: Total Households**
   - Icon: Home
   - Large number (e.g., 245)
   - Label: 'Total Households'
   - Subtitle: 'Registered households'
   - Color: Purple

   **Card 2: Pending Certifications**
   - Icon: FileText
   - Large number (e.g., 12)
   - Label: 'Pending Certs'
   - Subtitle: 'Awaiting processing'
   - Color: Orange

   **Card 3: Active KP Cases**
   - Icon: Scale
   - Large number (e.g., 8)
   - Label: 'Active KP Cases'
   - Subtitle: 'Under Mediation'
   - Color: Red

   **Card 4: Certificates Issued This Month**
   - Icon: TrendingUp
   - Large number (e.g., 34)
   - Label: 'Certs (Month)'
   - Subtitle: 'Issued this month'
   - Color: Blue

   **Purpose:** Quick overview ng current barangay status

2. **Charts Section (2-3 charts)**

   **Chart 1: Monthly Certifications Issued (Bar Chart)**
   - X-axis: Months (Jan to Dec)
   - Y-axis: Number of certificates
   - Shows trend throughout the year
   - Secretary makikita if may pattern (e.g., peak months)

   **Chart 2: Case Status Distribution (Pie Chart)**
   - Filed (blue slice)
   - Under Mediation (orange slice)
   - Settled (green slice)
   - Dismissed (gray slice)
   - Shows breakdown ng cases

   **Chart 3: Incident Trends (Line Chart)**
   - X-axis: Time period
   - Y-axis: Incident count
   - Shows if incidents are increasing or decreasing

3. **Quick Action Section**

   **Buttons available:**
   
   - **'Refresh' Button**
     - Icon: Clock/RefreshCw
     - Reloads data from server
     - Used if makita niyo may discrepancy
   
   - **'Add Resident' Button**
     - Icon: Plus
     - Click to open form para mag-add ng new resident
     - Leads to resident registration form
   
   - **'File Case' Button**
     - Icon: Plus
     - Click to open form para mag-file ng new case
     - Leads to case filing form
   
   - **'Issue Certificate' Button** (Main Feature)
     - Icon: Plus
     - Click to open form para mag-issue ng certificate
     - Highlighted sa prominent color (red/blue)
     - This is the most-used button

4. **Status Indicators**

   **Online/Offline Status**
   - Green circle = Online (connected to internet)
   - Gray circle = Offline (no internet)
   - Text shows: 'Online' or 'Offline'

   **Sync Status**
   - Rotating icon = Currently syncing
   - 'Last synced 2 minutes ago'
   - Shows if data up-to-date

   **PWA Install Banner (if not installed)**
   - Message: 'Install BeMIS on your device'
   - Button: 'Install App'
   - Allows installation as mobile app

This dashboard is the **gateway to all operations**."

---

## PART 3: SECRETARY MODULES - DETAILED

### 1. INHABITANTS SECTION (3 minutes)

#### A. HOUSEHOLD RECORDS

"Click sa sidebar: **Inhabitants → Household Records**

**What is this module?**
Pag-organize ng family units. Bawat household ay may household head at mga family members.

**Makikita ninyo:**

**Search & Filter Bar**
- Search field: Type household head name
- Filter by: Status (Active/Inactive)
- Filter by: Barangay (pero Secretary lang makikita ang kanilang barangay)
- 'Add Household' button (green, para mag-create ng new)

**Household List Table**
Columns:

1. **Household #** - Auto-generated ID (HH-001, HH-002, etc.)
2. **Household Head** - Name ng senior member
3. **Members Count** - Ilan sa household (e.g., 5 members)
4. **Address** - Full address
5. **Status** - Active o Inactive
6. **Date Registered** - When added sa system
7. **Actions** - View, Edit, Delete buttons

**Bawat row ay clickable:**
- Click anywhere sa row para makita ang household details

**Household Details Page (kapag nag-click):**
- Household Head information (name, age, birthdate, contact)
- Address (street, barangay, municipality, province)
- List of household members:
  - Member name
  - Relationship to head
  - Age
  - Birthdate
  - Occupation
  - Status (Living, Deceased)
- Photos/documents (if uploaded)
- Edit button
- Delete button
- Add member button

**Why important?** Households ay foundation ng census at planning."

---

#### B. RESIDENT PROFILING

"Click: **Inhabitants → Resident Profiling**

**What is this module?**
Complete database ng individual residents. More detailed than household records.

**List View:**

**Search & Filter Options**
- Search by: Name, age, ID number
- Filter by: Status (Active/Inactive/Deceased)
- Filter by: Age group (18-25, 25-60, 60+)
- Filter by: Barangay
- 'Add Resident' button (para mag-register ng new)

**Resident Table Columns:**
1. **Resident ID** - Auto-generated (RES-001, etc.)
2. **Full Name** - First, middle, last name
3. **Age** - Current age
4. **Birthdate** - Date of birth
5. **Gender** - Male/Female
6. **Civil Status** - Single, Married, Divorced, Widowed
7. **Contact** - Phone number
8. **Status** - Active/Inactive/Deceased
9. **Actions** - View, Edit, Delete

**Resident Details Page (kapag nag-click sa resident):**

**Personal Information**
- Full name
- Birthdate (age auto-calculated)
- Gender
- Civil status
- Citizenship
- Religion (optional)

**Contact Information**
- Phone number
- Email address
- Address (street, barangay, municipality)

**Employment Information**
- Employment status (Employed, Unemployed, Student, Retired)
- Occupation (if employed)
- Company name (if employed)
- Annual income bracket (optional)

**Family Information**
- Father's name
- Mother's name
- Spouse name (if married)
- Number of children

**Health Information**
- Blood type (optional)
- Medical conditions (optional)
- Allergies (optional)

**Identification Documents**
- ID type (Driver's License, Passport, TIN, etc.)
- ID number
- Date issued
- Expiration date

**Photos & Documents**
- Profile photo
- ID scans
- Proof of residence
- Other supporting documents

**Status History**
- When registered
- Last updated
- Who made the update

**Why important?** Central database para sa lahat ng services."

---

#### C. SENIOR CITIZENS REGISTRY

"Click: **Inhabitants → Senior Citizens**

**What is this module?**
Specialized tracking para sa 60 years old and above.

**List View:**

**Table Columns:**
1. **Senior ID** - Auto-generated
2. **Full Name**
3. **Age** - Age, usually 60+
4. **Birthdate**
5. **Contact**
6. **Status** - Active/Inactive/Deceased
7. **Actions**

**Senior Details Page:**

**Basic Information** (Same as resident)
- Name, birthdate, age, gender
- Contact information
- Address

**Health & Medical Information** (More detailed for seniors)
- Blood type
- Medical conditions (Hypertension, Diabetes, Arthritis, etc.)
- Current medications
- Allergies
- Primary healthcare provider
- Emergency contact

**Senior Benefits Tracking**
- OSCP (Older Persons' Cash Transfer) eligibility
- Amount received
- Frequency (monthly/quarterly)
- Status
- Date registered for benefits

**Support Services**
- Caregiver name (if applicable)
- Support needs (mobility, medication reminders, etc.)
- Services enrolled (home visits, meal programs, etc.)

**Emergency Information**
- Emergency contact person
- Relationship to senior
- Contact number
- Address

**Photos**
- Senior's photo (para sa identification)
- Medical documents (if any)

**Why important?** Para sa senior citizen programs at care coordination."

---

#### D. PWD REGISTRY

"Click: **Inhabitants → PWD Registry**

**What is this module?**
Tracking ng Persons with Disabilities para sa programs at accommodations.

**List View:**

**Table Columns:**
1. **PWD ID** - Official PWD ID number
2. **Full Name**
3. **Disability Type** - Physical, Visual, Hearing, Mental, etc.
4. **Status** - Active/Inactive
5. **Actions**

**PWD Details Page:**

**Basic Information**
- Name, birthdate, age, gender
- Contact information
- Address
- Barangay

**Disability Information**
- Disability type:
  - Physical (orthopedic, spinal cord, etc.)
  - Visual (blind, low vision)
  - Hearing (deaf, hard of hearing)
  - Mental/Intellectual (cerebral palsy, autism, etc.)
  - Multiple disabilities
- Severity level (Mild, Moderate, Severe)
- Date of disability onset
- Cause (congenital, accident, illness, etc.)

**PWD Documentation**
- PWD ID number (issued by government)
- Date issued
- Validity period
- Issuing office

**Support & Accommodations Needed**
- Mobility aids (wheelchair, crutches, etc.)
- Communication aids (hearing aids, sign language interpreter, etc.)
- Transportation assistance
- Educational support
- Employment support

**Programs & Benefits Enrolled**
- DSWD programs
- Educational scholarships
- Vocational training
- Livelihood programs
- Healthcare programs
- Benefit amount (if receiving)

**Contact Information**
- Primary contact
- Emergency contact
- Support person/caregiver

**Why important?** Para sa disability services, accommodations, at inclusive programs."

---

#### E. VOTER REGISTRY

"Click: **Inhabitants → Voter Registry**

**What is this module?**
Tracking ng registered voters para sa elections at civic participation.

**List View:**

**Table Columns:**
1. **Voter ID** - COMELEC assigned number
2. **Full Name**
3. **Birthdate**
4. **Precinct** - Voting precinct number
5. **Voting Location** - Which polling station
6. **Status** - Active/Inactive
7. **Actions**

**Voter Details Page:**

**Voter Information**
- Full name
- Birthdate
- Age (must be 18+)
- Gender
- Civil status
- Address
- Barangay
- Municipality

**Voter Registration Details**
- Voter ID number (COMELEC)
- Precinct number (e.g., Precinct 001)
- Voting location/school name
- Date registered
- Registration office
- Validity period

**Voting History** (if tracked)
- Year of elections
- Whether voted or not
- Date of voting
- Notes (if any)

**Current Voter Status**
- Active (eligible to vote)
- Inactive (not registered or expired)
- Transferred (moved to another precinct)
- Deactivated (reason - if applicable)

**Contact Information**
- Phone number
- Email
- Address confirmation

**Why important?** Para sa election management at voter information."

---

### 2. ISSUANCES - CERTIFICATIONS (5 minutes)

"Click: **Issuances → Certifications**

**This is the MAIN FEATURE of BeMIS. Pinaka-importante.**

**What is this module?**
Digital issuance ng official barangay certificates. Kalusog, efficiency, transparency.

**Statistics Section (Top of page):**

4 Cards showing:

1. **Released** - Green badge
   - Number of completed certificates
   - Example: 234 certificates

2. **Pending** - Yellow badge
   - Certificates waiting to be processed
   - Example: 12 pending

3. **On Hold** - Yellow badge
   - Certificates paused pending additional info
   - Example: 3 on hold

4. **Cancelled** - Red badge
   - Cancelled certificates
   - Example: 1 cancelled

**Search & Filter Section:**

- Search by: Resident name
- Search by: Certificate type
- Filter by: Status (Pending, Processing, Released, On Hold, Cancelled)
- Filter by: Date range
- 'Issue Certificate' button (prominent red button)

**Certifications Table - Main list:**

Columns displayed:

1. **Resident Name** - Full name of certificate applicant
2. **Certificate Type** - Type of certificate
   - Barangay Clearance
   - Certificate of Residency
   - Certificate of Indigency
   - Business Permit Endorsement
   - Certificate of Good Moral Character
3. **Purpose** - Why requesting (Employment, PHILHEALTH, Banking, etc.)
4. **DSS Result** - Decision Support System result
   - ✅ CLEAR (approved)
   - ⚠️ HOLD (pending review)
   - 🚩 FLAG (flagged)
   - ❌ DENY (denied)
5. **Status** - Current status
   - 🕐 Pending (initial state)
   - ⚙️ Processing (being processed)
   - ✅ Released (completed)
   - ⚠️ On Hold (paused)
   - ❌ Cancelled (rejected)
6. **OR Number** - Official Receipt number (once released)
7. **Issued Date** - When certificate was issued
8. **Actions** - Buttons para sa actions

**Action Buttons (depending on status):**

- **If Pending:**
  - 'Process' button - Move to Processing status
  
- **If Processing:**
  - 'Release' button - Finalize certificate
  - 'On Hold' button - Pause if need more info
  
- **If Released:**
  - 'Print' button - Print PDF
  - 'View OR' button - View Official Receipt
  
- **If On Hold:**
  - 'Resume' button - Continue processing
  - 'Cancel' button - Cancel request
  
- **All items:**
  - Delete (trash icon) - Remove from system

**MAIN WORKFLOW - ISSUE CERTIFICATE (this is the heart of the system):**

[Click 'Issue Certificate' button]

**Modal Opens - Certificate Issuance Form**

**Section 1: Select Resident**
- Dropdown showing: 'Select resident...'
- Click dropdown to see list of residents
- Shows: Resident name, age, barangay
- Example: 'Reyes, Juan — 34 years old — Barangay 1'
- Select one

**Section 2: AUTOMATIC CASE CHECK**
[System automatically checks upon resident selection]

**Scenario A: NO CASES FOUND**
- Green message: '✅ No case records found — resident is clear across all barangays.'
- Resident is eligible, proceed

**Scenario B: CASES FOUND**
- Red alert box appears with: '⚠️ CASES INVOLVED — X case(s) found across all barangays'
- Shows list of cases:
  - Case number
  - Case type
  - Complainant & Respondent names
  - Current status (Filed, Mediation, Settled, Dismissed)
  - Is resident Complainant or Respondent?
  - For each case: Accept button or Decline button
  
- **Secretary must decide for EACH case:**
  - ✅ Accept - Resident involved but okayed
  - ❌ Decline - Resident involved, deny certificate
  
- **If any case is Declined:**
  - Red message: '⚠️ Cannot issue certificate — one or more cases have been declined.'
  - Submit button becomes disabled (grayed out)

**Section 3: Certificate Type**
- Dropdown menu
- Options:
  1. Barangay Clearance - Most common
  2. Certificate of Residency - Proof of living sa barangay
  3. Certificate of Indigency - For poor/indigent programs
  4. Business Permit Endorsement - Para sa business permits
  5. Certificate of Good Moral Character - For employment/education

**Section 4: Purpose**
- Text input field
- Examples: 'Employment', 'PHILHEALTH Registration', 'Banking Requirement', 'CHED Scholarship'
- Secretary types in purpose

**Section 5: AI DECISION SUPPORT SYSTEM (Optional)**
- Button: 'Run DSS Check' (if internet available)
- Click para mag-run ng AI analysis
- System checks:
  - Resident's case history
  - Previous violations
  - Eligibility based on rules
- Returns decision:
  - ✅ APPROVE - Resident clear
  - ⚠️ HOLD - Need additional verification
  - 🚩 FLAG - Suspicious, needs review
  - ❌ DENY - Ineligible (active case, violations)
- Shows reason for decision

**Section 6: Submit**
- After filling all required fields
- Click 'Issue Certificate' button
- Status changes to 'Pending'
- Certificate created in system

**AFTER CERTIFICATE CREATED:**

**Process Status:**
1. Certificate Status: 'Pending'
   - Secretary can now click 'Process' button
   
2. Certificate Status: 'Processing'
   - Secretary can click 'Release' to finalize
   - Or 'On Hold' if need additional info
   
3. Certificate Status: 'Released' (Final)
   - System generates professional PDF
   - OR Number automatically assigned
   - Ready for printing
   - Resident notified

**PDF CERTIFICATE GENERATION:**
- Header: Republic of the Philippines official header
- Municipality: Mamburao
- Barangay name (e.g., Barangay 1 Poblacion)
- Title: 'OFFICE OF THE BARANGAY SECRETARY'
- Certificate type in large font
- 'TO WHOM IT MAY CONCERN:' (formal letterhead)
- Body text: 'This is to certify that [NAME], of legal age, [civil status], [citizenship], is a bona fide resident of Barangay [NAME], Municipality of Mamburao, Occidental Mindoro.'
- 'This certification is issued upon the request of the above-named person for the purpose of [PURPOSE].'
- Issue date: Formal date format
- Signature lines for:
  - Barangay Captain (Punong Barangay)
  - Barangay Secretary
- OR Number
- Bottom: 'Not valid without official seal of the barangay.'
- Can be printed at any time

**Why this feature matters:**
- Streamlines certificate process from days to minutes
- Professional, consistent formatting
- Digital verification possible
- Reduces paper handling
- Transparent (everything logged)
- AI-powered eligibility check prevents fraud"

---

### 3. KATARUNGANG PAMBARANGAY (KP) - CASES (3 minutes)

"Click: **Katarungang Pambarangay → Case List**

**What is this module?**
Digital case management para sa mediation/dispute resolution.

**Statistics Cards:**
- Active Cases - Under mediation
- Settled Cases - Resolved
- Dismissed Cases - Not pursued
- Total Cases - All time

**Search & Filter:**
- Search by: Case number or complainant name
- Filter by: Status (Filed, Mediation, Settled, Dismissed)
- Filter by: Case type
- Filter by: Date range
- 'File New Case' button

**Case List Table:**

Columns:
1. **Case #** - Auto-generated case number (CASE-001, etc.)
2. **Complainant** - Person filing complaint
3. **Respondent** - Person being complained against
4. **Case Type** - Property dispute, family issue, business conflict, neighbor dispute, etc.
5. **Status** - Filed, Mediation, Settled, Dismissed
6. **Date Filed** - When case was filed
7. **Actions** - View, Edit, Delete

**Case Details Page (click sa case):**

**Case Information**
- Case number
- Date filed
- Case type
- Current status
- Barangay involved
- If cross-barangay case: Origin barangay shown

**Parties Involved**
- **Complainant:**
  - Full name
  - Address
  - Contact number
  - Relationship to respondent
  
- **Respondent:**
  - Full name
  - Address
  - Contact number
  - Relationship to complainant

**Case Details**
- Case narrative/description (detailed story)
- Amount involved (if applicable)
- Previous incidents between parties
- Requested relief (what complainant wants)

**Mediation History**
- Timeline ng case:
  - When filed
  - When mediation started
  - When settled or dismissed
  - Who mediated

**Status Updates**
- Current status
- Last updated date
- Update history (log ng lahat ng status changes)

**Decisions/Resolutions** (if settled)
- Settlement terms
- Agreed upon by both parties
- Date of settlement
- Follow-up notes

**Actions Available:**
- Edit case details
- Update status
- Add notes
- Generate summons
- Archive case

**Hearing Schedule Section (separate tab):**

'Click: **Katarungang Pambarangay → Hearing Schedule**

**What is shown:**
- List ng scheduled hearings
- Date of hearing
- Time (e.g., 2:00 PM)
- Location (usually barangay hall)
- Related case number
- Parties (Complainant and Respondent)
- Status (Scheduled, Completed, Postponed)

**For each hearing:**
- Add notes
- Mark as completed
- Generate notifications to parties
- Reschedule if needed

**Summons Generation:**
- Click 'Generate Summons' para sa case
- System creates official document
- Shows case details
- Requires parties to appear on specified date
- Ready for printing

**Why important?**
- Organized digital case management
- Transparent process for parties
- Historical record of all disputes
- Integration with certifications (active cases block certificate issuance)"

---

### 4. LEGISLATION (1 minute)

"Click: **Legislation → Ordinances & Resolutions**

**What is this module?**
Storage ng barangay ordinances at resolutions.

**List of Documents:**

Table columns:
1. **Title** - Ordinance/Resolution title
2. **Type** - Ordinance o Resolution
3. **Date Enacted** - When approved
4. **Category** - Health, Safety, Finance, Social Services, etc.
5. **Status** - Active, Repealed, Amended
6. **Actions** - View, Edit, Delete

**Document View:**
- Full title
- Type (Ordinance / Resolution)
- Date enacted
- Date effective
- Category
- Full text of ordinance (can be long)
- Approval signatures (if recorded)
- Status

**Features:**
- Search documents
- Filter by category
- Filter by status (active only, or all)
- Download PDF
- Print

**Why important:**
- Legal reference para sa barangay policies
- Public transparency
- Historical record
- Compliance documentation"

---

### 5. INCIDENTS & COMPLAINTS (1 minute)

"Click: **Incidents & Complaints → File & Track Complaints**

**What is this module?**
Tracking ng complaints at incidents sa barangay.

**Statistics:**
- Total complaints
- Resolved
- Pending
- Closed

**Search & Filter:**
- By complaint type
- By status
- By date range

**Complaint List Table:**

Columns:
1. **Complaint #** - Auto-generated
2. **Type** - What kind (Theft, Noise, Neighbor dispute, Property damage, etc.)
3. **Complainant** - Who filed
4. **Status** - Filed, Under Investigation, Resolved, Closed
5. **Priority** - High, Medium, Low
6. **Date Filed**
7. **Actions**

**File New Complaint:**

Form fields:
- Complaint type (dropdown)
- Date of incident
- Description (detailed account)
- Location (where incident occurred)
- Complainant name
- Complainant contact
- Witnesses (if any)
- Evidence (upload photos, documents)

**Complaint Details:**
- Status (Filed → Investigation → Resolved → Closed)
- Notes/updates from investigation
- Assigned to (if investigation officer assigned)
- Timeline of actions taken
- Resolution (if resolved)

**Why important:**
- Organized complaint tracking
- Ensures no complaints forgotten
- Transparency for complainants
- Documentation for records"

---

### 6. ASSET & INFRASTRUCTURE (1 minute)

"Click: **Asset & Infrastructure → Barangay Assets**

**What is this module?**
Inventory ng barangay equipment, vehicles, buildings.

**Asset List:**

Table columns:
1. **Asset Name** - Equipment/vehicle name
2. **Type** - Building, Vehicle, Equipment, Furniture, etc.
3. **Location** - Where located
4. **Condition** - Good, Fair, Poor
5. **Date Acquired** - When purchased/received
6. **Value** - Estimated cost
7. **Actions**

**Asset Details Page:**
- Name, description
- Type (specific category)
- Location (barangay hall, school, health center, etc.)
- Acquisition date
- Original cost
- Current estimated value
- Condition (Good/Fair/Poor)
- Last maintenance date
- Maintenance history
- Assigned to (responsible person)
- Photos/documentation
- Serial number (if applicable)
- Warranty info
- Depreciation tracking

**Features:**
- Add new asset
- Record maintenance
- Update condition
- Generate asset report
- Export inventory list

**Why important:**
- Barangay asset tracking
- Maintenance scheduling
- Inventory management
- Accountability
- Budget planning"

---

### 7. DRRM & GAD (1 minute)

"Click: **DRRM & GAD → DRRM & GAD Programs**

**What is this module?**
Disaster Risk Reduction Management at Gender and Development programs.

**Program List:**

Table columns:
1. **Program Name** - Name ng program
2. **Type** - DRRM o GAD
3. **Start Date** - When program started
4. **End Date** - When ending
5. **Budget** - Allocated budget
6. **Target Beneficiaries** - How many people
7. **Status** - Planning, Ongoing, Completed
8. **Actions**

**DRRM Programs Examples:**
- Evacuation center preparation
- Early warning system training
- Flood/typhoon preparedness
- Community disaster response training
- Barangay disaster plan

**GAD Programs Examples:**
- Women's livelihood programs
- Gender sensitivity training
- Violence against women prevention
- Women's health programs
- Gender mainstreaming activities

**Program Details:**
- Full description
- Objectives
- Beneficiaries (list of participants)
- Budget breakdown
- Timeline
- Activities conducted
- Attendance/participation records
- Outcomes/results
- Photos/documentation
- Responsible person
- Status updates

**Features:**
- Add new program
- Record participants
- Update status
- Track budget
- Generate program report

**Why important:**
- Compliance with national directives
- Community protection
- Gender equality tracking
- Budget accountability
- Program impact measurement"

---

### 8. SMART TOOLS (1 minute)

"Click: **Smart Tools**

**This section has 3 AI-powered features:**

**Feature 1: AI Smart Drafting**
- Click: 'AI Smart Drafting'
- Input parameters (topic, date, purpose)
- AI generates draft ordinance/resolution
- Secretary edits if needed
- Generate final document
- Output: Professional ordinance in PDF

**Feature 2: Rule-Based Decision Support**
- Click: 'Rule-Based Decision Support'
- Select resident
- Select certificate type
- System analyzes:
  - KP case history
  - Violations history
  - Payment status
  - Eligibility rules
- Shows decision: APPROVE, HOLD, FLAG, or DENY
- Shows reasoning

**Feature 3: AI Decision Support System (Analytics)**
- Click: 'AI Decision Support System'
- View analytics:
  - Crime trends
  - Peak incident times
  - High-risk areas
  - Patterns sa data
  - Forecasts

**Why important:**
- Reduces manual work
- AI-powered decision making
- Data-driven insights
- Consistency in decisions"

---

### 9. REPORTS (1 minute)

"Click: **Reports → Reports & Analytics**

**Report Options:**

1. **Resident Demographics Report**
   - Age distribution graph
   - Household size breakdown
   - Employment status
   - Civil status distribution
   - Export to CSV/PDF

2. **Certification Log Report**
   - All certificates issued
   - By type (Barangay Clearance, etc.)
   - By month/quarter/year
   - Status breakdown
   - Export to CSV/PDF

3. **Case Analytics Report**
   - Case types distribution
   - Settlement rates
   - Average time to resolution
   - Recurring issues
   - Export to CSV/PDF

4. **Incident Report**
   - Incident frequency
   - Types of incidents
   - Trends over time
   - High-risk areas
   - Export to CSV/PDF

5. **Monthly Activity Summary**
   - Everything happened sa month
   - Certificates issued
   - Cases filed
   - Complaints received
   - Export to CSV/PDF

**Features:**
- View data sa table format
- View charts (bar, pie, line graphs)
- Download CSV (Excel format)
- Download PDF (printable)
- Filter by date range
- Filter by category

**Why important:**
- Decision-making support
- Documentation para sa LGU
- Barangay assembly presentation
- Budget planning
- Strategic planning"

---

## PART 4: ADMIN SIDE - DETAILED

### Admin Dashboard (2 minutes)

"Now, let's show the **ADMIN side**.

[Logout from Secretary account]

[Login as: admin@mamburao.gov.ph / password123]

**Admin Dashboard appears.**

**Differences from Secretary Dashboard:**

1. **Data Scope:**
   - Secretary: Nakikita lang kanilang 1 barangay
   - Admin: Nakikita ALL 15 BARANGAYS data (aggregated)

2. **Statistics (System-wide):**
   - Total Households: Sum ng lahat (not just 1 barangay)
   - Total Residents: All residents across 15 barangays
   - Total Pending Certifications: Across all barangays
   - Total KP Cases: All active cases sa lahat

3. **Charts (System-wide):**
   - Monthly certifications issued: ALL barangays combined
   - Case distribution: Across entire municipality
   - Incident trends: Municipality-wide

4. **Sidebar shows:**
   - User role: 'Admin'
   - Access level: 'System Administrator'
   - Not assigned sa specific barangay

5. **Navigation has fewer modules:**
   - Dashboard
   - Reports & Analytics
   - Settings
   - No Inhabitants, Cases, etc. (those are Secretary functions)

**Top Navigation Bar shows:**
- User: Admin
- Status: Online/Offline
- Sync status
- Settings gear icon
- Logout button

This is a **management dashboard**, not operational."

---

### Admin Settings Page (5 minutes)

"Click: **Settings** (gear icon)

**This is where ADMIN controls the system.**

**4 Major Tabs:**

---

#### TAB 1: PENDING APPROVALS

"Click: **'Pending Approvals' tab**

**What is shown:**

**Alert Box (Top):**
- Warning icon
- Message: '⚠️ [X] account(s) awaiting your approval. Review each request before granting system access.'
- 'Refresh' button

**Pending User Cards (One for each pending user):**

Each card shows:

1. **User Avatar**
   - Circle with initials (first letter of first and last name)
   - Colored background

2. **User Information**
   - Full name
   - 'PENDING' badge (yellow)
   - Email address
   - Assigned barangay (e.g., 'Barangay 2 (Poblacion)')
   - Date applied (e.g., 'May 15, 2024')

3. **Action Buttons**
   - **'Approve' button** (green)
     - Click para mag-approve
     - Shows spinner while processing
     - After approval: Secretary can now login
   
   - **'Reject' button** (red)
     - Click para mag-reject
     - Shows confirmation: 'Are you sure? This cannot be undone.'
     - After rejection: Account deleted, user cannot login

**Why this tab matters:**
- Only admin can grant system access
- Ensures authorized users lang ang makakagamit
- New Secretaries must be approved before login
- Control at security mechanism"

---

#### TAB 2: USER MANAGEMENT

"Click: **'User Management' tab**

**What is shown:**

**'Add Secretary Account' button** (top right, blue)
- Opens form para mag-create ng new Secretary account
- Form fields:
  - First Name *
  - Last Name *
  - Email Address *
  - Barangay * (dropdown with 15 options)
  - Temporary Password *
  - Confirm Password *
- Pag-created: Account automatically approved (can login immediately)
- Shows: 'Secretary account created and approved'

**User Management Table:**

Shows ALL users sa system (Secretaries only, Admin appears but read-only)

Table columns:
1. **User** - Name with avatar
   - Avatar circle
   - Full name
2. **Email** - Email address
3. **Barangay** - Assigned barangay (blue badge)
4. **Role** - Secretary or Admin (badge)
5. **Status** - ✓ Active (green) or ⏳ Pending (yellow)
6. **Joined** - Date when account created
7. **Actions** - Approve (if pending) or Remove buttons

**User Details (each row):**

Name: Monica Robles
Email: brgy1@mamburao.gov.ph
Barangay: Barangay 1 (Poblacion)
Role: Secretary
Status: ✓ Active
Joined: Jan 1, 2024

**Actions for each user:**
- If Pending:
  - 'Approve' button - Grant access
  
- If Active:
  - 'Remove' button - Deactivate or delete
  - Confirmation needed

**At bottom:**
- Summary: 'Total: X accounts • Y active • Z pending'

**Why this tab matters:**
- Complete user directory
- Admin can quickly add new Secretaries
- Easy user management
- Remove access if needed
- No confusion about who has access"

---

#### TAB 3: BARANGAY PROFILES

"Click: **'Barangay Profiles' tab**

**What is shown:**

**Info Alert Box:**
- Shield icon
- Message: 'Official profiles of all covered barangays of Mamburao. Captain and Secretary details are used in official certificates.'

**Grid Layout** - 15 Barangay Cards (displayed in a nice grid)

Each card shows:

**Card Header:**
- Number: '01', '02', '03', etc. (in circle)

**Card Content:**
- **Barangay Name:** 'Barangay 1 (Poblacion)'
- **Barangay Captain:** 'Hon. Juan dela Cruz'
  - 'Kap.' (abbreviation shown)
- **Barangay Secretary:** 'Monica Robles'
  - 'Sec.' (abbreviation shown)

**Cards are read-only** - Cannot edit (would need separate admin function)

**Cards include barangays:**
- Barangay 1 (Poblacion)
- Barangay 2 (Poblacion)
- Barangay 3 (Poblacion)
- Barangay 4 (Poblacion)
- Barangay 5
- Barangay 6
- Barangay 7
- Barangay 8
- Payompon
- Tangkalan
- Fatima
- San Luis
- Lihim
- Bulanao
- Calancan

**Why this tab matters:**
- All 15 barangays sa isang view
- Names used para sa certificate generation
- Reference para sa all official documents
- Ensures consistency across system"

---

#### TAB 4: SYSTEM INFO

"Click: **'System Info' tab**

**What is shown:**

**2-Column Grid of Information:**

Left Column:

- **System Name:** 'Barangay Management and Information System (BeMIS)'
- **Municipality:** 'Mamburao'
- **Province:** 'Occidental Mindoro'
- **Region:** 'MIMAROPA (Region IV-B)'
- **ZIP Code:** '5200'

Right Column:

- **Barangays Covered:** '15 Barangays'
- **Database:** 'In-Memory + Firebase Firestore (Offline-First)'
- **Sync Architecture:** 'Firebase Real-time Sync + Local JSON fallback'
- **Authentication:** 'JWT httpOnly Cookie + RBAC'
- **Roles:** 'Admin (1 singleton) • Secretary (per barangay)'

Additional Information:

- **Version:** 'v2.0 — BeMIS Edition'
- **DILG Standard:** 'BIMS Extension for Mamburao'
- **Deployment:** 'Cloud (Firebase) + PWA'
- **Mobile Ready:** 'Yes, Progressive Web App'
- **Offline Support:** 'Yes, 100% offline functionality'

**Why this tab matters:**
- System documentation
- Technical reference
- Compliance information
- Shows DILG alignment
- Transparency sa technology used"

---

## SUMMARY TABLE

```
┌─────────────────────┬──────────────────────┬──────────────────────┐
│   FEATURE           │    SECRETARY         │      ADMIN           │
├─────────────────────┼──────────────────────┼──────────────────────┤
│ Dashboard           │ 1 barangay data      │ All 15 barangays     │
│ Statistics          │ Local only           │ System-wide          │
│ Residents           │ Own barangay         │ Cannot access        │
│ Certifications      │ Can issue            │ Cannot issue         │
│ Cases               │ Own barangay         │ Cannot access        │
│ Reports             │ Own barangay reports │ System-wide reports  │
│ User Approval       │ Cannot              │ CAN APPROVE          │
│ User Management     │ Cannot              │ CAN MANAGE           │
│ Settings            │ Cannot access       │ Full access          │
│ Access Level        │ Operational          │ Administrative       │
│ Modules Count       │ 10 modules           │ 3 items (Dashboard,  │
│                     │                      │ Reports, Settings)   │
└─────────────────────┴──────────────────────┴──────────────────────┘
```

---

## WORKFLOW EXAMPLES

### Example 1: Secretary Issues Certificate

1. Secretary logs in with brgy1@mamburao.gov.ph
2. Goes to Issuances → Certifications
3. Clicks 'Issue Certificate'
4. Selects resident 'Juan Reyes'
5. System checks: '✅ No cases found'
6. Selects certificate type 'Barangay Clearance'
7. Enters purpose: 'Employment'
8. Clicks 'Issue Certificate'
9. Certificate created, status 'Pending'
10. Secretary clicks 'Process' → status 'Processing'
11. Secretary clicks 'Release' → status 'Released'
12. System generates PDF with OR Number
13. Secretary clicks 'Print'
14. Certificate printed, given to resident
15. ✅ Service completed!

### Example 2: Admin Approves New Secretary

1. Admin logs in with admin@mamburao.gov.ph
2. Goes to Settings tab
3. Sees 'Pending Approvals'
4. Sees new Secretary 'Shiela Villalobos' from Barangay 2
5. Clicks 'Approve' button
6. Email sent to Shiela (notification)
7. Now Shiela can login with password
8. Shiela can start managing Barangay 2
9. ✅ Admin task completed!

---

**Yan ang complete system! Easy, organized, efficient! 🎉**
