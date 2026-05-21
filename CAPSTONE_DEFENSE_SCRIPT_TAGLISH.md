# BeMIS — Capstone Defense Script (Taglish)
## Barangay Management & Information System · Mamburao, Occidental Mindoro

**Para sa panel defense · Basahin habang nagde-demo sa screen**

> **Paano gamitin:** Basahin nang natural — huwag word-for-word kung awkward. Ituro ang screen habang nagsasalita. Total demo: **18–25 minuto**.

---

## CREDENTIALS (I-print o ilagay sa second monitor)

| Role | Email | Password |
|------|--------|----------|
| **Admin (LGU)** | `admin@mamburao.gov.ph` o `admin@barangay.gov.ph` | `password123` |
| **Secretary (Barangay 1)** | `brgy1@mamburao.gov.ph` o `secretary@barangay.gov.ph` | `password123` |

**URL:** `http://localhost:5173` (frontend) · `http://localhost:5000/api/health` (backend check)

**I-run bago defense:** Backend + Frontend (`npm run dev` sa `backend` at `frontend`)

---

# BAHAGI 0 — OPENING (30–45 segundo)

> *[Tumingin sa panel, smile, steady voice]*

"Magandang umaga/hapon po sa aming mga panelists at evaluators.

Kami po ay magpapakita ng **BeMIS — Barangay Management and Information System**, isang **offline-first, web-based platform** para sa **LGU Mamburao, Occidental Mindoro**.

Ang problema po na sinusubukan naming sagutin: **manu-mano pa ang records** sa karamihan ng barangay — notebook, Excel, at hiwalay-hiwalay na files. Kapag may humingi ng clearance, **matagal**; kapag wala internet, **tumitigil ang trabaho**; at mahirap para sa munisipyo na **mag-monitor ng lahat ng 15 barangay** nang sabay-sabay.

Ang solusyon po namin: **isang sistema** na may **Secretary side** para sa daily encoding sa barangay, at **Admin side** para sa **LGU monitoring at user control** — hindi pareho ang trabaho nila, at **hindi pareho ang menu** nila sa sidebar."

---

# BAHAGI 1 — CONCEPT NG SYSTEM (1 minuto, walang click pa)

**Sabihin mo:**

"Apat po ang pinaka-core concept na dapat maalala ng panel:

1. **Offline-First** — Kahit walang internet, puwede pa ring mag-login at mag-save ang Secretary. Naka-queue ang data at **nagsi-sync** kapag bumalik ang connection.

2. **Role-Based Access Control (RBAC)** — Ang **Secretary** ay nakakakita lang ng sarili niyang barangay. Ang **Admin (LGU)** ay nagmo-monitor ng **buong munisipyo** — stats, reports, approvals — hindi siya yung taong nagma-manual ng resident form araw-araw.

3. **Decision Support System (DSS)** — Bago mag-issue ng clearance, chine-check ng system kung may **pending KP case** o liability ang resident — rule-based, transparent.

4. **AI Analytics (LGU level)** — Para sa forecasting at insights — crime patterns, demographics, service demand — para sa **planning**, hindi lang display ng listahan."

---

# BAHAGI 2 — LANDING PAGE (`http://localhost:5173/`)

**Oras:** ~2 minuto · **Walang login muna**

### Ano ang ipapakita (sunod-sunod i-scroll)

| # | Sa screen | Sabihin (Taglish) |
|---|-----------|-------------------|
| 1 | **Gov.ph banner** sa taas | "Official digital platform po ito ng LGU Mamburao — aligned sa government web standards." |
| 2 | **Header logos** (BeMIS, Mamburao, Bagong Pilipinas) | "Tatlong branding: system name, munisipyo, at national identity — professional at government-grade ang dating." |
| 3 | **Navigation:** Home, Modules, Background, Coverage, FAQs | "Public-facing muna ang landing page — kahit hindi pa logged in, makikita na ang features at coverage." |
| 4 | **Hero section** (background + headline) | "Dito namin ipinapaliwanag ang **purpose**: digital barangay governance para sa Mamburao — hindi lang website, **working portal**." |
| 5 | **7 Core Modules** (cards) | "Pitong subsystem: **Offline Engine**, **DSS**, **AI Analytics**, **Katarungang Pambarangay**, **Resident Profiling**, **Issuance**, **DRRM & GAD** — complete barangay operations." |
| 6 | **Statistics** (15 barangays, modules, uptime) | "Sakop po namin ang **15 barangays** ng Mamburao — isa per Secretary account sa prototype." |
| 7 | **Background / About section** | "Research context: bakit kailangan ng digitalization sa probinsya." |
| 8 | **Coverage / Barangays** | "Listahan ng barangay branches — each may dedicated Secretary login." |
| 9 | **FAQs** | "Common questions ng users — offline, security, roles." |
| 10 | **Portal Access** button | "Dito papasok ang authorized users — Secretary at Admin. Hindi open sa publiko ang data." |

### Script (buo, humanized)

> "Panelists, ito po ang **public face** ng BeMIS. Makikita ninyo na **hindi ito internal tool lang** — may landing page na nag-e-explain kung ano ang system, para sa LGU, barangay officials, at kahit sa defense natin ngayon.
>
> Ang pinaka-importante dito sa hero: **Offline-First**. Alam naman po natin sa probinsya, **hindi stable ang internet**. Kaya ang design namin: **save muna locally**, sync later — hindi titigil ang barangay kahit walang signal.
>
> [I-scroll sa Modules section]
>
> Dito po ang **pitong modules** — from resident database hanggang disaster planning. Hindi po ito single feature — **integrated platform** po.
>
> [I-scroll sa FAQs kung may oras]
>
> At kapag handa na ang user, i-click lang ang **Portal Access** para sa secure login."

**Click:** `Portal Access` → lalabas ang login modal (hintayin, huwag mag-login agad kung gusto mo ipaliwanag muna ang form)

---

# BAHAGI 3 — LOGIN, REGISTRATION, AT SECURITY

**Oras:** ~2 minuto

### Login form — ano ang ipapaliwanag

"Sa login modal po:
- **Email + Password** — standard secure authentication
- **JWT token** sa backend — encrypted session
- **Rate limiting** — after 5 failed attempts, 15-minute lockout — protection laban sa brute force
- **Demo accounts** sa ibaba (kung visible) para sa testing"

### RBAC — importante ito sa panel

> "Dalawang mundo po sa system natin:
>
> **SECRETARY** = **Barangay encoder**. Siya ang nag-a-add ng resident, nag-i-issue ng cert, nagfa-file ng KP case — **sa sarili niyang barangay lang**.
>
> **ADMIN** = **LGU / CRPS level**. Siya ang **nagmo-monitor**, nag-a-**approve ng accounts**, tumitingin sa **reports at AI insights** — **hindi** siya dapat mag-encode ng household records araw-araw. Kaya **iba ang sidebar** niya — monitoring menu lang."

### Registration (optional, 30 sec)

"I-click ang Register kung may oras: bagong Secretary magre-register → **pending approval** muna → **Admin ang mag-a-approve** sa Settings. Hindi automatic ang access — may control ang LGU."

---

# BAHAGI 4 — SECRETARY SIDE (Main demo · 10–12 minuto)

**Login:** `brgy1@mamburao.gov.ph` / `password123`

> "Ngayon po, magde-demo tayo bilang **Barangay Secretary ng Barangay 1 (Poblacion)** — siya ang **frontline user**."

---

## 4.1 Secretary Sidebar — ano ang nasa menu

**Ipakita ang sidebar at sabihin:**

| Group | Menu | Para saan |
|-------|------|-----------|
| *(walang label)* | Dashboard | Overview ng **sariling barangay** |
| | QR Code Scanner | Mabilis na hanap ng resident |
| **Inhabitants** | Household Records | Pamilya / bahay |
| | Resident Profiling | Individual records, DILG-style |
| | Senior Citizens | OSCA / senior list |
| | PWD Registry | Persons with disability |
| | Voter Registry | Precinct / voter tags |
| **Issuances** | Certifications | Clearance, indigency, etc. |
| **Katarungang Pambarangay** | Case List | Blotter / mediation |
| | Hearing Schedule | Schedule ng lupon |
| **Legislation** | Ordinances & Resolutions | Legal records |
| **Incidents & Complaints** | File & Track | Complaints log |
| **Asset & Infrastructure** | Barangay Assets | Inventory |
| **DRRM & GAD** | Programs | Disaster + gender programs |
| **Smart Tools (AI)** | AI Decision Support | Analytics |
| | AI Document Drafting | Draft ordinances/resolutions |
| | Rule-Based DSS | Clearance eligibility rules |
| **Reports** | Reports & Analytics | Export, charts |

> "Ito po ang **operational menu** — lahat ng kailangan ng Secretary sa araw-araw. Notice po: **walang Settings** dito — hindi niya job ang mag-approve ng users."

---

## 4.2 Dashboard (Secretary)

**Path:** Dashboard (default after login)

**Ipakita:**
- Stat cards: Residents, Households, Pending Certs, Active KP Cases
- Charts: Monthly certifications, Case status pie, Age distribution
- Recent Activity feed
- **Quick action buttons:** Scan QR, Add Resident, File Case, Issue Cert
- **Online/Offline badge** sa topbar

**Script:**

> "Ito ang **command center** ng Secretary. Isang tingin lang — alam na niya kung ilan ang pending certs, active cases, at trends.
>
> [Ituro ang Offline badge kung naka-offline, o sabihin theoretically]
>
> Kahit **offline**, tumatakbo pa rin ang dashboard gamit ang **cached data** — hindi blank ang screen.
>
> [Click 'Issue Cert' o sabihin na dito papunta sa main feature]"

---

## 4.3 Inhabitants Module

**Path:** Inhabitants → Resident Profiling

**Ipakita:**
- Search, filter, table ng residents
- **Add Resident** button → form (demographics, household link, tags: senior, PWD, 4Ps, voter)
- Validation sa required fields

**Script:**

> "Core database po ito ng barangay. Complete demographic data — aligned sa **DILG profiling standards**.
>
> May **tags** po: Senior, PWD, Voter — para automatic filtering sa ibang modules, hindi na manual filter sa Excel."

**Quick pass:** Household Records → "Grouped by pamilya, may head of household."

**Quick pass:** Senior Citizens / PWD / Voters → "Auto-filtered lists para sa OSCA, PDAO, at COMELEC reporting."

---

## 4.4 Issuances — Certifications (PINAKA-IMPORTANTE · 3–4 min)

**Path:** Issuances → Certifications

**Ipakita:**
1. List ng certificates (status: Pending, Released, etc.)
2. Click **Issue Certificate** / New
3. Piliin ang resident
4. **DSS Check** (kung may button) — ipakita approve/reject
5. Certificate type, purpose
6. Process → Release

**Script:**

> "Ito po ang **pinaka-visible benefit** sa constituents: **mabilis na clearance**.
>
> Pero may **rules** tayo — hindi basta-basta approve. Tawagin namin itong **Decision Support System**.
>
> [Gawin ang DSS check]
>
> Kapag may **active KP case** ang resident, **hihinto ang system** at sasabihin kung bakit — **transparent**, hindi secret rejection. Consistent ang decision, hindi depende sa mood ng nagta-type.
>
> Kapag approved, may **log history** — kailan kumuha, sino nag-issue — accountability."

---

## 4.5 Katarungang Pambarangay

**Path:** Katarungang Pambarangay → Case List

**Ipakita:**
- Case number, complainant, respondent, status (Under Mediation, etc.)
- Privacy: sensitive fields protected by role

**Script:**

> "Digital **KP case management** — blotter, mediation status, hearing.
>
> Sumusunod po kami sa **Data Privacy Act** — sensitive case details ay **role-protected**. Hindi lahat ng user nakakabasa ng particulars.
>
> [Open Hearing Schedule] — calendar view ng mga hearing."

---

## 4.6 Legislation, Incidents, Assets, DRRM (1–2 min combined)

**Pasadahan nang mabilis — isang bawat isa, 15–20 sec:**

| Module | One-liner |
|--------|-----------|
| **Legislation** | "Ordinansa at resolusyon — searchable digital archive." |
| **Incidents** | "Complaint filing at tracking — hindi nawawala sa notebook." |
| **Assets** | "Inventory ng barangay equipment at properties." |
| **DRRM & GAD** | "Disaster plans at gender programs — DILG compliance modules." |

---

## 4.7 Smart Tools (Secretary)

**Path:** Rule-Based DSS (`/dss`)

> "Hiwalay na page ang **rules engine** — pwedeng i-configure ang criteria para sa clearance eligibility."

**Path:** AI Document Drafting

> "Tumutulong mag-draft ng ordinance/resolution text — productivity tool para sa Secretary."

**Path:** AI Decision Support (`/ai-analytics`)

> "Charts at forecasts — pwede ring gamitin ng Secretary sa barangay level; mas malawak ang view ng Admin."

---

## 4.8 Reports (Secretary)

**Path:** Reports & Analytics

**Ipakita:** Export options, charts, masterlist

> "PDF/CSV export para sa barangay assembly, DILG submission, o backup."

---

## 4.9 Offline Demo (kung kaya · optional pero malakas sa panel)

1. I-disconnect WiFi o i-toggle offline sa browser DevTools
2. Mag-add ng record o mag-issue ng cert
3. Ipakita ang toast: "Saved to offline queue"
4. I-reconnect → Sync

> "Ito po ang **offline-first** in action — hindi namatay ang system, **naka-queue**, tapos **nagsync** pag may internet."

**Logout** ang Secretary — "Next, Admin side."

---

# BAHAGI 5 — ADMIN SIDE (LGU Monitoring · 5–7 minuto)

**Login:** `admin@mamburao.gov.ph` / `password123`

> "Maglo-logout po tayo at mag-login bilang **LGU Administrator**. Iba po ang mindset: **monitoring at control**, hindi encoding."

---

## 5.1 Admin Sidebar — dapat ito ang nakikita ng panel

| Group | Menu | Bakit nandito |
|-------|------|----------------|
| **LGU Monitoring** | Municipal Dashboard | Stats ng **lahat** ng barangay |
| | Reports & Analytics | Municipality-wide reports |
| | AI Insights & Forecasts | Predictive analytics |
| **System Administration** | User Approvals & Settings | Approve Secretaries, manage users |
| | Sync Monitor | Offline queue / sync health |

**Script (importante):**

> "Notice po panelists: **wala** dito ang Resident Profiling, Certifications, Cases — kasi **hindi job ng Admin** ang mag-type ng resident sa araw-araw. Ang Secretary ang encoder; ang Admin ang **nagmo-monitor at nag-a-approve**.
>
> Kung kailangan ng LGU ng municipal report, nandito ang **Reports** at **AI Insights** — **bird's eye view**, hindi duplicate ng barangay menu."

---

## 5.2 Municipal Dashboard (Admin)

**Ipakita:**
- Same stat cards pero **LGU-wide totals** (all barangays combined)
- AI Insight banner → link to detailed analysis
- Quick buttons: **Municipal Reports**, **AI Insights**, **User Approvals** (hindi Add Resident)

**Script:**

> "Ito ang **LGU command center**. Total residents, cases, certs — **buong Mamburao**, hindi isang barangay lang.
>
> Subtitle po: *LGU-wide monitoring — all barangays under Mamburao* — para clear ang role."

---

## 5.3 Reports & Analytics (Admin)

**Path:** Reports & Analytics

> "Dito nakikita ng Admin ang **consolidated data** — trends per barangay, exports para sa municipal planning at DILG reporting."

---

## 5.4 AI Insights & Forecasts (Admin)

**Path:** AI Insights & Forecasts

**Ipakita (kung available ang data):**
- Demographic trends
- Hotspot / risk scoring
- Repeat offenders insight
- Service demand forecast

**Script:**

> "Ito ang **research contribution** namin beyond manual encoding: **pattern detection** — aling barangay ang mataas ang incidents, repeat offenders, anong buwan peak ang cases — para sa **Tanod deployment** at **budget planning**.
>
> Rule-based DSS para sa clearance; **AI analytics** para sa **municipal-level forecasting** — magkaiba po ang purpose, hindi duplicate."

---

## 5.5 User Approvals & Settings (Admin)

**Path:** User Approvals & Settings

**Ipakita ang tabs:**
1. **Pending Approvals** — list ng nag-register na Secretary → Approve / Reject
2. **User Management** — active accounts, Add Secretary
3. **Barangay Profiles** — barangay config
4. **System Info** — app metadata

**Script:**

> "Dito po ang **gatekeeping** ng LGU. Hindi pwedeng mag-register ang kahit sino at automatic access — **Admin approval required**.
>
> [Kung may pending, i-approve live] — real-time, may accountability.
>
> Pwede ring **direct create** ng Secretary account para sa 15 barangays — `brgy1@mamburao.gov.ph` hanggang `brgy15`, etc."

---

## 5.6 Sync Monitor (Admin)

**Path:** Sync Monitor

> "Dito nakikita ng Admin kung may **pending offline records** na hindi pa nasesync — municipal IT oversight, hindi barangay-level lang."

---

# BAHAGI 6 — TECHNICAL HIGHLIGHTS (Kung may tanong · 2 min)

| Topic | Sagot (Taglish) |
|-------|-----------------|
| **Tech stack** | React + Vite frontend, Node.js + Express backend, JWT auth, PouchDB offline sa browser |
| **Security** | bcrypt passwords, JWT, RBAC, rate limiting, barangay data isolation |
| **Encryption** | AES-256 sa sensitive fields (backend config) |
| **Validation** | Required fields, dropdowns para consistent data (gender, civil status) |
| **Scalability** | Ready for CouchDB/Firebase sync; prototype mode uses mock DB para sa demo |
| **DILG alignment** | Profiling, KP, certs, DRRM, GAD — e-governance modules |

---

# BAHAGI 7 — ANTICIPATED Q&A (Panel)

### "Bakit offline-first?"
> "Sa Occidental Mindoro, unstable ang connectivity. Ang barangay hindi pwedeng tumigil mag-issue ng cert kapag walang signal. Save locally, sync later — **continuity of service**."

### "AI ba talaga o rules lang?"
> "May **Rule-Based DSS** po para sa clearance — clear rules, predictable. May **AI Analytics** po para sa forecasting at patterns — magkaibang layer. Honest po kami sa terminology."

### "Paano ninyo pinoprotektahan ang KP case data?"
> "RBAC — Secretary at Admin lang ang full access sa case details. Barangay isolation — Secretary A hindi nakikita ang records ng Secretary B."

### "Ano ang difference ng Admin at Secretary?"
> "Secretary = **encoder** sa isang barangay. Admin = **LGU monitor** — approvals, municipal stats, sync oversight. **Iba ang sidebar** dahil iba ang trabaho."

### "Production-ready na ba?"
> "Prototype po na **production-oriented** — complete flows, security layers, documented. Ready for deployment sa LGU server with CouchDB at proper hosting."

### "GPS / Blockchain?" (kung itanong)
> "May prototype po kami niyan sa research phase; sa current build, **naka-focus** kami sa offline sync, DSS, at core barangay modules na **actively demoable** ngayon. Puwedeng i-integrate sa Phase 2."

---

# BAHAGI 8 — CLOSING (30 segundo)

> "Panelists, ang BeMIS po ay **hindi lang database** — ito ay **e-governance platform**: offline-ready, role-based, may decision support at analytics, at may malinaw na **hati** between **barangay operations (Secretary)** at **LGU monitoring (Admin)**.
>
> Tinutulungan po namin ang Mamburao na **mas mabilis ang serbisyo**, **mas organized ang records**, at **mas transparent ang governance**.
>
> Maraming salamat po. Handa po kami sa inyong mga tanong."

---

# QUICK DEMO ORDER (Cheat sheet · 20 min)

| Min | Action |
|-----|--------|
| 0–2 | Landing page scroll + explain offline + 7 modules |
| 2–3 | Portal Access → explain login/RBAC |
| 3–12 | Login Secretary → Dashboard → Residents → **Certifications + DSS** → Cases → quick pass other modules |
| 12–13 | Logout |
| 13–18 | Login Admin → Dashboard → Reports → AI Insights → **Settings/Approvals** → Sync |
| 18–20 | Closing + Q&A |

---

*Document version: May 2026 · BeMIS Capstone Defense Team*
