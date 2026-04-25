/**
 * Generates research_proposal.html — open this in Word and Save As .docx
 * Run: node generate_proposal.js
 */
const fs = require('fs');
const path = require('path');

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @page { margin: 2.54cm; }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    line-height: 1.5;
    color: #000;
  }
  h1 { font-size: 14pt; text-align: center; font-weight: bold; margin-bottom: 6pt; }
  h2 { font-size: 13pt; font-weight: bold; margin-top: 18pt; margin-bottom: 6pt; border-bottom: 1px solid #000; padding-bottom: 3pt; }
  h3 { font-size: 12pt; font-weight: bold; margin-top: 12pt; margin-bottom: 4pt; }
  p  { margin: 6pt 0; text-align: justify; }
  ul { margin: 4pt 0 8pt 20pt; }
  ol { margin: 4pt 0 8pt 20pt; }
  li { margin-bottom: 4pt; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10pt 0;
    font-size: 11pt;
  }
  th, td {
    border: 1px solid #000;
    padding: 5pt 8pt;
    vertical-align: top;
  }
  th { background: #d9d9d9; font-weight: bold; text-align: center; }
  .center { text-align: center; }
  .label { font-weight: bold; }
  .underline { border-bottom: 1px solid #000; display: inline-block; min-width: 200pt; }
  .signature-row { display: flex; justify-content: space-between; margin-top: 24pt; }
  .note { font-style: italic; font-size: 10pt; color: #555; margin-top: 16pt; }
  .checkbox { font-family: Arial; }
  .page-break { page-break-after: always; }
</style>
</head>
<body>

<h1>RESEARCH PROPOSAL</h1>
<p class="center"><em>Capstone Project — Information Technology / Computer Science Department</em></p>
<br/>

<table>
<tr>
  <td colspan="2"><span class="label">Research Title:</span><br/>
    <strong>ProfiligSystem: An Offline-First Barangay Information Management System with AI-Driven Predictive Analytics and Rule-Based Decision Support for the Barangays of Mamburao, Occidental Mindoro</strong>
  </td>
</tr>
<tr>
  <td width="50%">
    <span class="label">Proponents:</span><br/>
    1. <span class="underline">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><br/><br/>
    2. <span class="underline">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><br/><br/>
    3. <span class="underline">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
  </td>
  <td width="50%">
    <span class="label">Adviser:</span> <span class="underline">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><br/><br/>
    <span class="label">Data Analyst:</span> <span class="underline">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><br/><br/>
    <span class="label">Critic Reader:</span> <span class="underline">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
  </td>
</tr>
</table>

<h2>Priority Area/s (Check the applicable):</h2>
<table>
<tr>
  <td width="50%" valign="top">
    <strong>1. Natural &amp; Applied Sciences</strong><br/>
    <span class="checkbox">☐</span> Agriculture<br/>
    <span class="checkbox">☐</span> Food and Nutrition<br/>
    <span class="checkbox">☐</span> Health and Medicine<br/>
    <span class="checkbox">☐</span> Environment and Climate Change<br/>
    <span class="checkbox">☐</span> Energy and Infrastructure<br/><br/>
    <strong>2. Social &amp; Community Development</strong><br/>
    <span class="checkbox">☐</span> Community Development<br/>
    <span class="checkbox">☑</span> <strong>Social Services (Welfare, housing, community programs)</strong><br/>
    <span class="checkbox">☐</span> Education<br/>
    <span class="checkbox">☐</span> Disaster and Risk Reduction<br/>
    <span class="checkbox">☐</span> Sports, Recreation &amp; Wellness<br/>
    <span class="checkbox">☑</span> <strong>Digital Transformation (e-government, smart cities, digital inclusion)</strong><br/><br/>
    <strong>3. Governance, Economics &amp; Policy</strong><br/>
    <span class="checkbox">☐</span> Economics and Business<br/>
    <span class="checkbox">☐</span> Governance and Policy<br/>
    <span class="checkbox">☐</span> Globalization &amp; International Relations<br/>
    <span class="checkbox">☐</span> Peace &amp; Security Systems<br/>
    <span class="checkbox">☐</span> Transportation<br/><br/>
    <strong>4. Culture, Arts &amp; Humanities</strong><br/>
    <span class="checkbox">☐</span> Culture, Arts and Humanities<br/>
    <span class="checkbox">☐</span> Tourism and Hospitality
  </td>
  <td width="50%" valign="top">
    <strong>Software &amp; Emerging Technology Domains</strong><br/>
    <span class="checkbox">☐</span> Data Analytics &amp; Visualizations<br/>
    <span class="checkbox">☐</span> Cybersecurity Solutions<br/>
    <span class="checkbox">☐</span> Cloud Computing Applications<br/>
    <span class="checkbox">☐</span> Internet of Things (IoT)<br/>
    <span class="checkbox">☐</span> Blockchain Applications<br/>
    <span class="checkbox">☑</span> <strong>Artificial Intelligence &amp; Machine Learning</strong><br/>
    <span class="checkbox">☐</span> Augmented Reality (AR) / Virtual Reality (VR)<br/>
    <span class="checkbox">☐</span> Software Customization (FOSS)<br/>
    <span class="checkbox">☐</span> Extensions<br/>
    <span class="checkbox">☐</span> Plugin Development<br/>
    <span class="checkbox">☑</span> <strong>Expert Systems and Decision Support Systems / Intelligent Systems</strong><br/>
    <span class="checkbox">☑</span> <strong>Systems Software</strong><br/>
    <span class="checkbox">☑</span> <strong>Web Applications Development</strong><br/>
    <span class="checkbox">☐</span> Mobile Computing Systems<br/>
    <span class="checkbox">☐</span> Computer Vision<br/>
    <span class="checkbox">☐</span> Game Development<br/>
    <span class="checkbox">☐</span> E-Learning Systems<br/>
    <span class="checkbox">☐</span> Interactive Systems<br/>
    <span class="checkbox">☑</span> <strong>Information Kiosks (public service kiosks)</strong>
  </td>
</tr>
</table>

<h2>Background</h2>
<ul>
  <li><strong>Technologies:</strong> React.js 19, Node.js &amp; Express.js 5, Firebase Firestore, PouchDB 9, NVIDIA NIM API (meta/llama-3.3-70b-instruct), PDFKit, jsPDF, AES-256 Encryption, JWT, Render (Cloud Hosting), Progressive Web App (PWA)</li>
  <li><strong>Target Users:</strong> Barangay Captains, Secretaries, and Administrative Staff of Mamburao, Occidental Mindoro</li>
  <li><strong>Existing Studies/Software:</strong> Traditional barangay operations in Mamburao rely on manual, paper-based record-keeping. Existing e-Government platforms (e.g., eGovPH) offer limited offline support and do not address the specific administrative needs of rural LGUs with intermittent internet connectivity. Prior academic studies on Barangay Management Information Systems (BMIS) focused primarily on online-only implementations without AI-based decision support.</li>
  <li><strong>Current Gap / Market Landscape:</strong> No existing system in Mamburao integrates offline-first data persistence, AI-predictive analytics, and a Rule-Based Decision Support System (DSS) in a single unified platform tailored for rural barangay operations. Rural barangays frequently experience internet outages, making fully online systems unreliable for continuous service delivery.</li>
</ul>

<h2>Problem Statement</h2>
<ol>
  <li><strong>Manual and Paper-Based Processes:</strong> Barangay offices in Mamburao, Occidental Mindoro still rely on manual, paper-based record systems for resident profiling, certification issuance, and case management — resulting in inefficiency, risk of data loss, and delayed service delivery to constituents.</li>
  <li><strong>Lack of Offline Operational Capability:</strong> Existing digital tools require a stable internet connection to function, which is not consistently available in rural areas, rendering these tools unreliable and unusable during service delivery hours when connectivity is unavailable.</li>
  <li><strong>Absence of Data-Driven Decision Support:</strong> Barangay officials currently have no automated tool for identifying high-risk community zones, detecting repeat offenders in KP cases, or generating evidence-based recommendations for resource allocation, leading to reactive rather than proactive governance.</li>
</ol>

<h2>General Objectives</h2>
<p>To design, develop, and deploy an <strong>Offline-First Barangay Information Management System (ProfiligSystem)</strong> integrated with AI-Predictive Analytics and a Rule-Based Decision Support System (DSS) to modernize the administrative services and community governance of the barangays of Mamburao, Occidental Mindoro.</p>

<h2>Specific Objectives</h2>
<ol>
  <li>To develop a <strong>comprehensive resident profiling module</strong> that enables barangay staff to add, update, search, and manage constituent records including household data, PWD registry, and senior citizen registries — operable with or without internet connection.</li>
  <li>To implement an <strong>offline-first synchronization architecture</strong> using PouchDB and Firebase Firestore that enables uninterrupted data entry during internet outages and automatically synchronizes all queued records upon reconnection.</li>
  <li>To build a <strong>Rule-Based Decision Support System (DSS)</strong> that automatically evaluates resident eligibility for barangay certifications by cross-checking active KP cases before issuance is allowed.</li>
  <li>To integrate an <strong>AI Predictive Analytics Engine</strong> powered by NVIDIA's Llama 3.3 70B model (via NVIDIA NIM API) that analyzes community case data, scores jurisdictional risk levels, detects repeat offenders, and generates actionable governance recommendations for barangay officials.</li>
  <li>To develop a <strong>KP (Katarungang Pambarangay) Case Management module</strong> with controlled field-level privacy locks and mediation status tracking, ensuring secure and compliant case handling per barangay justice standards.</li>
  <li>To conduct a <strong>User Acceptance Testing (UAT) and System Usability Evaluation</strong> using a structured survey questionnaire (System Usability Scale) with actual barangay staff end-users to validate the system's usability and effectiveness.</li>
</ol>

<h2>Beneficiaries</h2>
<p><strong>Person 1 — Barangay Administrative Staff (Secretaries and Clerks)</strong><br/>
The system eliminates manual paperwork by providing a digital platform for managing resident records, processing certifications, and generating official PDF reports and clearances. Their workload is significantly reduced and processing time for community requests is shortened. They can continue working even without internet access thanks to the offline-first architecture.</p>

<p><strong>Person 2 — Barangay Officials (Captains and Council Members)</strong><br/>
The AI Analytics Dashboard provides real-time risk assessments per barangay zone, flags communities with increasing case incidents, and detects repeat offenders. This equips officials with data-driven insights for strategic decision-making on patrol deployment, resource allocation, and community intervention programs.</p>

<p><strong>Person 3 — Barangay Constituents (Residents of Mamburao)</strong><br/>
Residents receive faster, more reliable government services including certificate issuance, case filing, and clearance processing — with reduced wait times and standardized digital records replacing slow manual processes.</p>

<p><strong>Future Researchers:</strong><br/>
This study contributes a working reference architecture for offline-first government information systems in rural Philippine LGUs. The integration of AI analytics and a Rule-Based DSS into a barangay governance context provides a validated model that future researchers can replicate, extend, or adapt for other municipalities.</p>

<h2>Scope</h2>
<p>The system covers the following functional modules, developed and deployed for the <strong>Barangays of Mamburao, Occidental Mindoro</strong>:</p>
<ol>
  <li><strong>Authentication &amp; Role-Based Access Control (RBAC)</strong> — Admin, Secretary, and Viewer roles with specific module access boundaries.</li>
  <li><strong>Resident Profiling</strong> — Full CRUD management of barangay constituents including household groupings, PWD, and senior citizen registries.</li>
  <li><strong>Certifications Module</strong> — DSS-validated issuance of Barangay Clearance, Certificate of Indigency, Residency, and Good Moral Character with automated PDF generation.</li>
  <li><strong>KP Case Management</strong> — Filing, tracking, and mediation status management for community disputes with field-level privacy controls.</li>
  <li><strong>AI Predictive Analytics</strong> — Risk zone scoring, repeat offender detection, and NVIDIA LLM-powered governance recommendation generation.</li>
  <li><strong>Rule-Based Decision Support System (DSS)</strong> — Automated eligibility evaluation for certification requests based on active KP case records.</li>
  <li><strong>DRRM Module</strong> — Disaster Risk Reduction and Management records management.</li>
  <li><strong>Legislation Records</strong> — Digital archiving of barangay ordinances and resolutions.</li>
  <li><strong>Offline-First Sync</strong> — PouchDB local caching with automatic cloud synchronization to Firebase Firestore upon reconnection.</li>
</ol>

<h2>Limitation</h2>
<ol>
  <li>The system is scoped specifically for the <strong>barangays of Mamburao, Occidental Mindoro</strong> and may require reconfiguration for deployment in other municipalities or LGUs.</li>
  <li>The <strong>AI Analytics module</strong> requires an active internet connection to invoke the NVIDIA NIM API (Llama 3.3 70B). In offline mode, the system falls back to a local rule-based engine with limited analytical depth compared to the LLM-powered version.</li>
  <li>The system does not currently integrate with the <strong>National ID System (PhilSys)</strong> or any external national government database, and resident records are managed independently within the system.</li>
  <li>The system is a <strong>web-based application</strong> and does not include a dedicated native mobile application. Mobile access is supported through the Progressive Web App (PWA) feature via a mobile browser.</li>
  <li>The <strong>free-tier cloud hosting</strong> on Render may impose performance constraints (e.g., server cold start delays) under heavy concurrent usage and is intended for pilot deployment only.</li>
</ol>

<h2>Materials and Methods</h2>
<p><em>See discussion on Methodology (Chapter 3)</em></p>
<p><strong>Development Methodology:</strong> Agile Development Model (Iterative sprints with continuous testing and stakeholder feedback loops)</p>

<table>
<tr><th>Layer</th><th>Technology Used</th></tr>
<tr><td>Frontend</td><td>React.js 19, Vite 6, Tailwind CSS 4</td></tr>
<tr><td>Backend</td><td>Node.js 18+, Express.js 5</td></tr>
<tr><td>Local Offline Database</td><td>PouchDB 9 (Offline-First)</td></tr>
<tr><td>Cloud Database</td><td>Firebase Firestore (NoSQL)</td></tr>
<tr><td>AI Engine</td><td>NVIDIA NIM API — meta/llama-3.3-70b-instruct</td></tr>
<tr><td>PDF Generation</td><td>PDFKit, jsPDF, jsPDF-AutoTable</td></tr>
<tr><td>Security</td><td>JWT, AES-256 Encryption (CryptoJS), Helmet.js, Rate Limiting</td></tr>
<tr><td>Deployment</td><td>Render (Backend), Firebase (Cloud DB)</td></tr>
<tr><td>Version Control</td><td>Git / GitHub</td></tr>
</table>

<h2>Sustainability Plan</h2>
<ul>
  <li><strong>Target Platforms:</strong> Web Application (Desktop-first, PWA-enabled for mobile access via any modern browser)</li>
  <li><strong>Deployment Requirements (Server Configuration/Specifications):</strong>
    <ul>
      <li>Backend Server: Node.js 18+ hosted on Render. Minimum: 0.5 vCPU, 512MB RAM.</li>
      <li>Cloud Database: Firebase Firestore Free Tier (1GB storage, 50,000 reads/day) — sufficient for pilot deployment; scalable to Blaze pay-as-you-go plan for production.</li>
      <li>Local Client Requirements: Intel Core i3 (10th Gen) or higher, 8GB RAM, 256GB SSD, Windows 10/11 64-bit, Standard internet connection for sync, LAN for local access.</li>
    </ul>
  </li>
  <li><strong>Budget Requirements:</strong>
    <ul>
      <li>Development Phase: No cost — all services use free tiers.</li>
      <li>Monthly Maintenance (Post-Deployment): PHP 0 – PHP 500/month (Firebase Free Tier; optional Render paid plan at ~$7/month).</li>
      <li>Annual: Domain registration ~PHP 1,000/year; optional Firebase Blaze plan depending on data volume.</li>
      <li>Training Activities: 1-day onboarding session for barangay staff; user manual and video guides provided.</li>
      <li>Maintenance Activities: Quarterly system updates, bug patches, and data backup verification.</li>
    </ul>
  </li>
</ul>

<h2>Timeline of Activities</h2>
<p><em>Gantt Chart — Agile Development Model (6 Months)</em></p>
<table>
<tr>
  <th>Phase</th><th>Activity</th><th>Month 1</th><th>Month 2</th><th>Month 3</th><th>Month 4</th><th>Month 5</th><th>Month 6</th>
</tr>
<tr><td>1. Planning</td><td>Requirements gathering, system design</td><td class="center">✔</td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>2. Design</td><td>UI/UX design, DB schema, architecture</td><td class="center">✔</td><td class="center">✔</td><td></td><td></td><td></td><td></td></tr>
<tr><td>3. Sprint 1</td><td>Auth, Resident Profiling, Households</td><td></td><td class="center">✔</td><td class="center">✔</td><td></td><td></td><td></td></tr>
<tr><td>4. Sprint 2</td><td>Certifications, DSS, KP Case Management</td><td></td><td></td><td class="center">✔</td><td class="center">✔</td><td></td><td></td></tr>
<tr><td>5. Sprint 3</td><td>AI Analytics, DRRM, Legislation Records</td><td></td><td></td><td></td><td class="center">✔</td><td class="center">✔</td><td></td></tr>
<tr><td>6. Sprint 4</td><td>Offline Sync, PWA, End-user Survey</td><td></td><td></td><td></td><td></td><td class="center">✔</td><td></td></tr>
<tr><td>7. Testing</td><td>Unit testing, UAT, SUS evaluation, bug fixing</td><td></td><td></td><td></td><td class="center">✔</td><td class="center">✔</td><td class="center">✔</td></tr>
<tr><td>8. Deployment</td><td>Cloud deployment, staff training</td><td></td><td></td><td></td><td></td><td></td><td class="center">✔</td></tr>
<tr><td>9. Documentation</td><td>Final report writing and submission</td><td></td><td></td><td></td><td></td><td class="center">✔</td><td class="center">✔</td></tr>
</table>

<h2>Expected Output</h2>
<p>The study will produce the following deliverables:</p>
<ol>
  <li><strong>ProfiligSystem Web Application</strong> — A fully functional, deployed, offline-first Barangay Information Management System accessible via web browser and installable as a Progressive Web App (PWA) on desktop and mobile devices.</li>
  <li><strong>AI-Powered Analytics Dashboard</strong> — An interactive analytics interface providing zone-level risk scoring, repeat offender detection, and NVIDIA LLM-generated actionable governance recommendations.</li>
  <li><strong>Automated PDF Certificate Generator</strong> — A module that produces official barangay certificates formatted to LGU standards, with DSS pre-validation before issuance is permitted.</li>
  <li><strong>End-User Survey Results</strong> — A documented System Usability Scale (SUS) evaluation conducted with actual barangay staff, including data tables, average scores, and interpretation of the system's usability and acceptance.</li>
  <li><strong>System Documentation</strong> — Complete technical documentation including user manual, developer guide, conceptual framework, and the full research paper.</li>
</ol>

<h2>Collaborating Agency</h2>
<ul>
  <li><strong>Barangay Offices of Mamburao, Occidental Mindoro</strong> — Primary partner organization for requirements validation, User Acceptance Testing (UAT), and pilot deployment of the system.</li>
</ul>

<p class="note">
  ⚠️ NOTE: Palitan ang mga blank lines (___) ng inyong actual na pangalan bago i-submit ang proposal. 
  Para i-save bilang .docx: Buksan ang file na ito sa Microsoft Word, tapos File → Save As → Word Document (.docx).
</p>

</body>
</html>`;

const outputPath = path.join(__dirname, 'Research_Proposal_ProfiligSystem.html');
fs.writeFileSync(outputPath, html, 'utf8');
console.log('✅ Done! File saved to:', outputPath);
console.log('');
console.log('📋 HOW TO CONVERT TO .docx:');
console.log('   1. Double-click: Research_Proposal_ProfiligSystem.html');
console.log('   2. It will open in your browser or Word');
console.log('   3. In Microsoft Word: File → Save As → Word Document (.docx)');
console.log('   OR: Right-click the HTML file → Open with → Microsoft Word → Save As .docx');
