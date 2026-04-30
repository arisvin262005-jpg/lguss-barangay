const fs = require('fs');
const path = require('path');

// Helper to generate Image URLs
const getMermaidUrl = (code) => {
  return `https://quickchart.io/mermaid?fmt=png&code=${encodeURIComponent(code.trim())}`;
};

const hierarchicalCode = `
graph TD
    A[ProfiligSystem] --> B(User Management)
    A --> C(Resident Management)
    A --> D(Services & Issuances)
    A --> E(Katarungang Pambarangay)
    A --> F(Community Admin)
    A --> G(Analytics & Reporting)
    A --> H(System Core)
    
    B --> B1(Auth & Login)
    B --> B2(RBAC)
    
    C --> C1(Resident Profiling)
    C --> C2(Households)
    C --> C3(Sector Registries)
    
    D --> D1(Certifications)
    D --> D2(Rule-Based DSS)
    
    E --> E1(Case Filing)
    E --> E2(Mediation Tracking)
    
    F --> F1(Incidents)
    F --> F2(Assets)
    F --> F3(DRRM & GAD)
`;

const dfdCode = `
graph LR
    R((Resident)) -- Requests & Data --> S[ProfiligSystem]
    S -- Certificates & Updates --> R
    
    B((Barangay Staff)) -- Encodes Data --> S
    S -- System Alerts --> B
    
    C((Barangay Captain)) -- Views Analytics --> S
    S -- Reports & AI Insights --> C
`;

const architectureCode = `
graph TD
    subgraph Client Device
        U[Barangay Staff] --> UI[React.js Frontend]
        UI <--> LQ[(LocalStorage Queue)]
    end
    
    subgraph Sync Engine
        LQ -- Network Reconnect --> SE[Offline-First Sync Engine]
    end
    
    subgraph Cloud Backend
        SE --> API[Node.js / Express API]
        API <--> DB[(Firebase Firestore)]
        API <--> AI[NVIDIA NIM AI]
    end
`;

const erdCode = `
erDiagram
    USERS {
        string id PK
        string email
        string role
    }
    HOUSEHOLDS {
        string id PK
        string householdNumber
        string address
        string headId FK
    }
    RESIDENTS {
        string id PK
        string firstName
        string lastName
        string householdId FK
    }
    CASES {
        string id PK
        string caseNumber
        string complainantId FK
        string status
    }
    CERTIFICATIONS {
        string id PK
        string certType
        string residentId FK
    }
    
    HOUSEHOLDS ||--o{ RESIDENTS : "contains"
    RESIDENTS ||--o{ CASES : "files"
    RESIDENTS ||--o{ CERTIFICATIONS : "requests"
    USERS ||--o{ CERTIFICATIONS : "issues"
`;

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
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  h1 { font-size: 14pt; font-weight: bold; margin-bottom: 12pt; text-align: center; }
  h2 { font-size: 13pt; font-weight: bold; margin-top: 18pt; margin-bottom: 6pt; border-bottom: 1px solid #000; padding-bottom: 3pt; }
  h3 { font-size: 12pt; font-weight: bold; margin-top: 12pt; margin-bottom: 4pt; }
  p  { margin: 6pt 0; text-align: justify; }
  ul, ol { margin: 4pt 0 8pt 20pt; }
  li { margin-bottom: 4pt; }
  .diagram { text-align: center; margin: 20px 0; }
  .diagram img { max-width: 100%; height: auto; border: 1px solid #ddd; padding: 10px; background: white; }
  .placeholder { text-align: center; background: #f0f0f0; border: 2px dashed #999; padding: 40px; margin: 20px 0; color: #666; font-weight: bold; }
</style>
</head>
<body>

<h1>Chapter 3 &amp; 4: System Design and Methodology</h1>

<h2>1. Hierarchical Diagram (System Decomposition)</h2>
<div class="diagram">
  <img src="${getMermaidUrl(hierarchicalCode)}" alt="Hierarchical Diagram" />
</div>
<p><strong>Explanation:</strong><br/>
The Hierarchical Diagram illustrates the functional decomposition of the ProfiligSystem into distinct, manageable modules. At the highest level is the core system, which branches down into primary subsystems: User Management, Resident Management, Services &amp; Issuances, Katarungang Pambarangay (KP), Community Administration, Analytics &amp; Reporting, and the System Core. Each subsystem is further divided into specific tasks and processes. This modular structure ensures that the development process is organized and that the system can be easily maintained and scaled in the future. The separation of concerns allows barangay staff to navigate specifically to the module relevant to their current task, improving overall system usability.</p>

<h2>2. Data Flow Diagram (DFD)</h2>
<div class="diagram">
  <img src="${getMermaidUrl(dfdCode)}" alt="Data Flow Diagram" />
</div>
<p><strong>Explanation:</strong><br/>
The Data Flow Diagram (DFD) maps out the flow of information within the ProfiligSystem, defining how data enters the system, how it is processed, and where it is stored or outputted. In the Context Diagram, the Barangay Resident provides personal data and requests for services (e.g., certificates, blotters), which are received by the system. The Barangay Staff acts as the primary encoder, managing resident profiles and processing these requests. The system then evaluates the requests (e.g., checking for active KP cases via the Rule-Based DSS) and outputs the requested document (e.g., printed PDF certificate). Concurrently, data flows into the local offline storage queue when offline, and synchronizes with the Cloud Database (Firebase) when online. The AI Analytics engine pulls this aggregated data to generate risk assessments and reports for the Barangay Captain, facilitating data-driven decision-making.</p>

<h2>3. System Architecture</h2>
<div class="diagram">
  <img src="${getMermaidUrl(architectureCode)}" alt="Architecture Diagram" />
</div>
<p><strong>Explanation:</strong><br/>
The system employs an Offline-First, Event-Driven Architecture (EDA) designed specifically to address intermittent internet connectivity in rural areas like Mamburao. The architecture is composed of three main layers: the Client-Side Application (React.js), the Local Offline Storage (LocalStorage Queue), and the Cloud Backend (Node.js/Express.js &amp; Firebase Firestore). When a barangay secretary inputs data, the system first writes the transaction to the local offline queue within the browser. If the system is offline, the user can continue working without interruption. Event listeners constantly monitor the network status. Once a connection is detected, the Sync Engine triggers an event to replay the queued actions to the backend REST API, which then updates the Firebase Firestore cloud database. The AI Analytics module connects securely to the NVIDIA NIM API via backend proxies to ensure API keys are protected while delivering LLM-powered insights.</p>

<h2>4. UI/UX of Important System Processes</h2>

<h3>A. Authentication (Login Page)</h3>
<div class="placeholder">
  [ TAKE A SCREENSHOT OF YOUR LOGIN PAGE AND PASTE IT HERE ]<br/>
  (I cannot capture a picture of your computer screen)
</div>
<p>The Login Interface provides secure access control. It features a clean, professional design requiring an email and password. It restricts access based on the user's role (Admin, Secretary, or Viewer), ensuring data privacy and security.</p>

<h3>B. Dashboard &amp; Analytics</h3>
<div class="placeholder">
  [ TAKE A SCREENSHOT OF YOUR MAIN DASHBOARD AND PASTE IT HERE ]
</div>
<p>The Main Dashboard provides a high-level overview of the barangay's current status. It displays statistical cards (Total Residents, Cases, Households), recent system activities, and the AI-Powered Analytics section, which highlights jurisdictional risk scores and governance recommendations.</p>

<h3>C. Resident Profiling Module</h3>
<div class="placeholder">
  [ TAKE A SCREENSHOT OF YOUR RESIDENT LIST / ADD MODAL AND PASTE IT HERE ]
</div>
<p>The Resident Management screen features a comprehensive data table with search, filter, and pagination capabilities. The "Add Resident" modal uses an intuitive, multi-section form that captures demographic data, household affiliation, and sector tags (e.g., Senior Citizen, PWD), designed for fast encoding.</p>

<h3>D. Certification &amp; DSS Issuance</h3>
<div class="placeholder">
  [ TAKE A SCREENSHOT OF YOUR CERTIFICATIONS PAGE AND PASTE IT HERE ]
</div>
<p>The Certification module streamlines document requests. Before generating a PDF, the system's Rule-Based DSS automatically cross-references the resident's name against the Katarungang Pambarangay (KP) records. If an active case is found, the system alerts the staff and puts the issuance on hold, ensuring legal compliance.</p>

<h2>5. Database Design (Entity-Relationship)</h2>
<div class="diagram">
  <img src="${getMermaidUrl(erdCode)}" alt="ERD Diagram" />
</div>
<p><strong>Explanation:</strong><br/>
The database is structured using a NoSQL schema optimized for Firebase Firestore, but conceptually follows relational principles to maintain data integrity. The <strong>Residents</strong> collection is the central entity containing demographic data. The <strong>Households</strong> collection groups multiple residents, linked via a Foreign Key reference. The <strong>Cases</strong> collection links to Residents through <em>complainantId</em> and <em>respondentId</em>, which allows the Decision Support System (DSS) to quickly query if a resident has pending liabilities. The schema is designed to be flattened where necessary to support fast read operations and efficient offline caching in the browser's LocalStorage.</p>

<h2>6. Development Plan / Strategies (Iterative Model)</h2>
<p>The project utilizes the <strong>Iterative Development Model</strong>, allowing the team to build the system in successive phases, refining requirements and adding features in each iteration.</p>
<ul>
  <li><strong>Iteration 1: Core Foundation &amp; UI Setup</strong> - Establish the project repository, setup the frontend React framework and backend Node.js server. Design the basic UI layout, sidebar navigation, and implement the secure Authentication and Role-Based Access Control (RBAC) system.</li>
  <li><strong>Iteration 2: Resident Data &amp; Profiling</strong> - Develop the Resident and Household CRUD operations. Ensure robust data validation and implement the specific registries for Senior Citizens and PWDs.</li>
  <li><strong>Iteration 3: Services &amp; Justice Module</strong> - Implement the Certification generation module (PDF output) and the Katarungang Pambarangay (KP) Case Management system. Integrate the Rule-Based Decision Support System (DSS) to link resident requests with their case records.</li>
  <li><strong>Iteration 4: Advanced Features &amp; Offline Capability</strong> - Implement the LocalStorage offline queue for data persistence during network outages. Integrate the AI Predictive Analytics using the NVIDIA NIM API, and complete the incident reporting and DRRM modules.</li>
  <li><strong>Iteration 5: Testing, Optimization &amp; Deployment</strong> - Conduct rigorous unit testing and system integration testing. Perform User Acceptance Testing (UAT) and System Usability Scale (SUS) survey with barangay staff. Fix identified bugs, optimize load times, and deploy to cloud hosting.</li>
</ul>

<h2>7. Tools, Programming Languages, and Libraries</h2>
<ul>
  <li><strong>Frontend:</strong> React.js 19, Tailwind CSS 4, React Router DOM, jsPDF, Lucide React</li>
  <li><strong>Backend:</strong> Node.js 18+, Express.js 5, bcrypt, JWT, Helmet.js</li>
  <li><strong>Database &amp; Storage:</strong> Firebase Firestore (Cloud), LocalStorage Queue (Offline)</li>
  <li><strong>AI Integration:</strong> NVIDIA NIM API (meta/llama-3.3-70b-instruct)</li>
  <li><strong>Hardware Requirements (Client PC):</strong> Intel Core i3 / AMD Ryzen 3 or higher, 8GB RAM, 256GB SSD, Standard Internet Connection (for sync)</li>
</ul>

<h2>8. Testing Plan</h2>
<ul>
  <li><strong>Unit Testing:</strong> Testing individual components and functions (e.g., testing if the PDF generator formats text correctly) in isolation.</li>
  <li><strong>Integration Testing:</strong> Ensuring different modules work together. Specifically, testing the interaction between the React frontend and Express backend, and verifying that the DSS correctly queries the KP database before allowing a certificate issuance.</li>
  <li><strong>Functionality Testing:</strong> Validating all CRUD operations for residents, households, and cases.</li>
  <li><strong>Offline Capability Testing:</strong> Simulating network outages by disconnecting the internet, encoding data to verify it is stored in the local queue, and reconnecting to verify automatic Sync Engine execution to Firebase.</li>
</ul>

<h2>9. Evaluation</h2>
<p>The system will be evaluated using the <strong>System Usability Scale (SUS)</strong> and User Acceptance Testing (UAT). A structured survey questionnaire will be distributed to actual end-users (Barangay Secretaries, Clerks, and Captains). The survey measures ease of use, system performance, offline reliability, and overall satisfaction. An average SUS score of 68 or higher is required to consider the system's UI/UX successful.</p>

<h2>10. Deployment Plan</h2>
<ul>
  <li><strong>Deployment Strategy:</strong> Split-stack cloud approach configured as a Progressive Web App (PWA) so staff can install it directly on their desktop computers without needing an app store.</li>
  <li><strong>Server Specifications &amp; Configurations:</strong>
    <ul>
      <li>Frontend Hosting (Vercel): Global Edge Network / CDN, Automated SSL.</li>
      <li>Backend API Hosting (Render): Node.js environment, 0.1 vCPU, 512 MB RAM (Free Tier).</li>
      <li>Database (Firebase Firestore): NoSQL Document Store, 1 GB Storage limit, 50,000 reads/day.</li>
    </ul>
  </li>
  <li><strong>Costing Estimates:</strong>
    <ul>
      <li>Development Phase: PHP 0.00 (Utilizing Free tiers of Vercel, Render, and Firebase).</li>
      <li>Production Phase (Optional upgrade): Domain Name (.gov.ph or .com) ~PHP 1,000 - 2,500/year; Backend Render Starter Plan ~$7/month; Firebase Blaze Plan Pay-as-you-go (Estimated &lt; PHP 500/month).</li>
    </ul>
  </li>
</ul>

</body>
</html>`;

const outputPath = path.join(__dirname, 'Chapter3_4_Documentation_Complete.html');
fs.writeFileSync(outputPath, html, 'utf8');
console.log('✅ Done! File saved to:', outputPath);
