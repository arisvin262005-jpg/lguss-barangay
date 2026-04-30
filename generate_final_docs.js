const fs = require('fs');
const path = require('path');

function getBase64Image(filename) {
  try {
    const filepath = path.join(__dirname, filename);
    if (fs.existsSync(filepath)) {
      const bitmap = fs.readFileSync(filepath);
      return "data:image/jpeg;base64," + bitmap.toString('base64');
    }
    return '';
  } catch (err) {
    console.error("Error reading " + filename + ":", err.message);
    return '';
  }
}

const hierarchicalImg = getBase64Image('Hierarchical_Diagram.jpg');
const dfdImg = getBase64Image('DFD_Diagram.jpg');
const architectureImg = getBase64Image('Architecture_Diagram.jpg');
const erdImg = getBase64Image('Database_ERD_Diagram.jpg');
const fishboneImg = getBase64Image('Fishbone_Diagram.jpg');

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
  h1 { font-size: 14pt; font-weight: bold; margin-bottom: 12pt; text-align: center; text-transform: uppercase; }
  h2 { font-size: 13pt; font-weight: bold; margin-top: 18pt; margin-bottom: 6pt; background-color: #f2f2f2; padding: 5px; border-left: 5px solid #000; text-transform: uppercase; }
  h3 { font-size: 12pt; font-weight: bold; margin-top: 12pt; margin-bottom: 4pt; }
  p  { margin: 6pt 0; text-align: justify; }
  ul, ol { margin: 4pt 0 8pt 20pt; }
  li { margin-bottom: 4pt; }
  .diagram { text-align: center; margin: 20px 0; }
  .diagram img { max-width: 100%; height: auto; border: 1px solid #ddd; }
  .placeholder { text-align: center; background: #e0e0e0; border: 2px dashed #666; padding: 30px; margin: 20px 0; color: #333; font-weight: bold; font-size: 14pt; }
  
  /* Violet Table Styling */
  .violet-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    margin-bottom: 20px;
  }
  .violet-table th {
    background-color: #8A2BE2; /* Violet */
    color: white;
    font-weight: bold;
    padding: 12px;
    border: 1px solid #4B0082;
    text-align: center;
  }
  .violet-table td {
    padding: 10px;
    border: 1px solid #000;
    vertical-align: top;
  }
  .violet-table tr:nth-child(even) {
    background-color: #f2e6ff;
  }

  /* Gantt Chart Styling */
  .gantt-container { width: 100%; border-collapse: collapse; margin-top: 20px; table-layout: fixed; }
  .gantt-container th, .gantt-container td { border: 1px solid #d8b4fe; padding: 10px; text-align: center; font-size: 10pt; }
  .gantt-header { background-color: #c084fc; color: white; font-weight: bold; }
  .gantt-label { background-color: #f3e8ff; text-align: left !important; font-weight: bold; width: 25%; }
  .gantt-bar-cell { position: relative; padding: 0 !important; }
  .gantt-bar { background-color: #4b5563; height: 12px; border-radius: 6px; position: absolute; top: 50%; transform: translateY(-50%); }
</style>
</head>
<body>

<div style="border-bottom: 2px solid #000; margin-bottom: 20px; padding-bottom: 10px;">
  <p><strong>Collaborating Agencies:</strong></p>
  <ul>
    <li>Department of the Interior and Local Government (DILG)</li>
  </ul>
</div>

<h1>Chapter 3: Methodology</h1>
<p>The system is developed using the Iterative Model. The methodology is divided into five main phases: Planning, Design, Development, Testing, and Deployment.</p>

<h2>PROBLEM ANALYSIS</h2>
<h3>1. Fishbone Diagram (Cause and Effect)</h3>
<p>Ang sumusunod na Cause-and-Effect (Fishbone) Diagram ay nagpapakita ng mga pangunahing problema ng kasalukuyang manwal na sistema ng barangay na naging basehan para sa pagbuo ng ProfiligSystem.</p>
<div class="diagram">
  ${fishboneImg ? '<img src="' + fishboneImg + '" alt="Fishbone Diagram" />' : '<p>[Fishbone Image not found]</p>'}
</div>
<p><strong>Explanation:</strong> Ipinapakita ng diagram ang mga "pain points" sa ilalim ng Manpower, Machines, Methods, at Materials na nagreresulta sa mabagal at hindi siguradong serbisyo sa barangay. Ang pag-address sa mga ito ang pangunahing layunin ng ProfiligSystem.</p>

<h2>SYSTEM DEVELOPMENT PHASES</h2>
<p>Ang sumusunod na talahanayan ay nagpapakita ng mga yugto (phases) sa pagbuo ng ProfiligSystem, na sumusunod sa Iterative Methodology.</p>

<table class="violet-table">
  <thead>
    <tr>
      <th style="width: 15%;">PHASE</th>
      <th style="width: 25%;">ACTIVITY (Gawain)</th>
      <th style="width: 60%;">DESCRIPTION (Paliwanag)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Phase 1</strong></td>
      <td><strong>Planning & Requirements Gathering</strong></td>
      <td>Pagsasagawa ng interview sa mga barangay officials. Inalam ang mga problema tulad ng kawalan ng internet at mabagal na paghahanap ng record.</td>
    </tr>
    <tr>
      <td><strong>Phase 2</strong></td>
      <td><strong>System Design</strong></td>
      <td>Pagbuo ng arkitektura ng system kabilang ang Database ERD, DFD, at Hierarchical Diagram para sa Offline-Ready na logic.</td>
    </tr>
    <tr>
      <td><strong>Phase 3</strong></td>
      <td><strong>System Development & AI Integration</strong></td>
      <td>Pagsulat ng code gamit ang React at Node.js, at pag-integrate ng NVIDIA Llama 3.3 para sa AI pattern detection.</td>
    </tr>
    <tr>
      <td><strong>Phase 4</strong></td>
      <td><strong>Testing & Evaluation</strong></td>
      <td>Pagsasagawa ng Unit Testing at Integration Testing. Pagkuha ng feedback gamit ang System Usability Scale (SUS) questionnaire.</td>
    </tr>
    <tr>
      <td><strong>Phase 5</strong></td>
      <td><strong>Deployment & Maintenance</strong></td>
      <td>Opisyal na pag-deploy ng Frontend sa Vercel at Backend sa Render para sa publiko at pag-monitor ng security.</td>
    </tr>
  </tbody>
</table>

<h2>PROJECT SCHEDULE & GANTT CHART</h2>
<p>The following Gantt Chart and detailed schedule illustrate the timeline of the ProfiligSystem development from planning to final deployment.</p>

<table class="gantt-container">
  <thead>
    <tr class="gantt-header">
      <th>Phase</th>
      <th>Feb '11</th>
      <th>March '11</th>
      <th>April '11</th>
      <th>May '11</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="gantt-label">Planning</td>
      <td class="gantt-bar-cell"><div class="gantt-bar" style="width: 70%; left: 10%;"></div></td>
      <td></td><td></td><td></td>
    </tr>
    <tr>
      <td class="gantt-label">Requirements Analysis</td>
      <td class="gantt-bar-cell"><div class="gantt-bar" style="width: 30%; right: 0;"></div></td>
      <td></td><td></td><td></td>
    </tr>
    <tr>
      <td class="gantt-label">System Design</td>
      <td></td>
      <td class="gantt-bar-cell"><div class="gantt-bar" style="width: 80%; left: 0;"></div></td>
      <td></td><td></td>
    </tr>
    <tr>
      <td class="gantt-label">Development (Iteration 1)</td>
      <td></td>
      <td class="gantt-bar-cell"><div class="gantt-bar" style="width: 40%; right: 0;"></div></td>
      <td class="gantt-bar-cell"><div class="gantt-bar" style="width: 30%; left: 0;"></div></td>
      <td></td>
    </tr>
    <tr>
      <td class="gantt-label">Testing (Iteration 1)</td>
      <td></td><td></td>
      <td class="gantt-bar-cell"><div class="gantt-bar" style="width: 30%; left: 35%;"></div></td>
      <td></td>
    </tr>
    <tr>
      <td class="gantt-label">Development (Iteration 2)</td>
      <td></td><td></td>
      <td class="gantt-bar-cell"><div class="gantt-bar" style="width: 30%; right: 0;"></div></td>
      <td class="gantt-bar-cell"><div class="gantt-bar" style="width: 20%; left: 0;"></div></td>
    </tr>
    <tr>
      <td class="gantt-label">Testing (Iteration 2)</td>
      <td></td><td></td><td></td>
      <td class="gantt-bar-cell"><div class="gantt-bar" style="width: 30%; left: 25%;"></div></td>
    </tr>
    <tr>
      <td class="gantt-label">Deployment & Documentation</td>
      <td></td><td></td><td></td>
      <td class="gantt-bar-cell"><div class="gantt-bar" style="width: 20%; right: 10%;"></div></td>
    </tr>
  </tbody>
</table>

<br>

<table class="violet-table">
  <thead>
    <tr>
      <th>Phase</th>
      <th>Activities</th>
      <th>Start Date</th>
      <th>End Date</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Planning</td><td>Identify problem, define objectives, initial research</td><td>Feb 11</td><td>Feb 20</td></tr>
    <tr><td>Requirements Analysis</td><td>Gather data (survey, interviews), analyze user needs</td><td>Feb 21</td><td>Mar 5</td></tr>
    <tr><td>System Design</td><td>Design system architecture, database, UI/UX layout</td><td>Mar 6</td><td>Mar 20</td></tr>
    <tr><td>Development (Iteration 1)</td><td>Develop basic features (resident profiling, records)</td><td>Mar 21</td><td>Apr 10</td></tr>
    <tr><td>Testing (Iteration 1)</td><td>Test system, identify errors and issues</td><td>Apr 11</td><td>Apr 20</td></tr>
    <tr><td>Development (Iteration 2)</td><td>Improve system, add offline-first & AI features</td><td>Apr 21</td><td>May 5</td></tr>
    <tr><td>Testing (Iteration 2)</td><td>Retest system, validate improvements</td><td>May 6</td><td>May 12</td></tr>
    <tr><td>Deployment & Documentation</td><td>Finalize system, prepare documentation</td><td>May 13</td><td>May 16</td></tr>
  </tbody>
</table>

<h2>DESIGN</h2>

<h3>1. Hierarchical Diagram (System Decomposition)</h3>
<div class="diagram">
  ${hierarchicalImg ? '<img src="' + hierarchicalImg + '" alt="Hierarchical Diagram" />' : '<p>[Image not found]</p>'}
</div>
<p><strong>Explanation:</strong> The Hierarchical Diagram illustrates the functional decomposition of the ProfiligSystem into distinct, manageable modules. At the highest level is the core system, which branches down into primary subsystems: User Management, Resident Management, Services &amp; Issuances, Katarungang Pambarangay (KP), Community Administration, Analytics &amp; Reporting, and the System Core. This modular structure ensures that the development process is organized and scalable.</p>

<h3>2. Data Flow Diagram (DFD)</h3>
<div class="diagram">
  ${dfdImg ? '<img src="' + dfdImg + '" alt="Data Flow Diagram" />' : '<p>[Image not found]</p>'}
</div>
<p><strong>Explanation:</strong> The Data Flow Diagram (DFD) maps out the flow of information within the ProfiligSystem. The Barangay Resident provides personal data and requests for services. The Barangay Staff acts as the primary encoder. The system evaluates the requests via the Rule-Based DSS and outputs the requested document. Concurrently, data flows into the local offline storage queue when offline, and synchronizes with the Cloud Database when online.</p>

<h3>3. System Architecture (Event-Driven / Offline-First)</h3>
<div class="diagram">
  ${architectureImg ? '<img src="' + architectureImg + '" alt="Architecture Diagram" />' : '<p>[Image not found]</p>'}
</div>
<p><strong>Explanation:</strong> The system employs an Offline-First Architecture composed of the Client-Side Application, Local Offline Storage (LocalStorage), and the Cloud Backend (Firebase). When a secretary inputs data without internet, the system writes the transaction to the local offline queue. Once a connection is detected, the Sync Engine automatically replays the queued actions to the backend to update Firebase.</p>

<h3>4. UI/UX of Important System Processes</h3>
<p><strong>A. Authentication (Login Page)</strong></p>
<div class="placeholder">[ MS WORD INSTRUCTION: COPY AND PASTE YOUR ACTUAL LOGIN PAGE SCREENSHOT HERE ]</div>
<p>The Login Interface provides secure access control restricted by user roles (Admin, Secretary) ensuring data privacy.</p>

<p><strong>B. Dashboard &amp; Analytics</strong></p>
<div class="placeholder">[ MS WORD INSTRUCTION: COPY AND PASTE YOUR ACTUAL DASHBOARD SCREENSHOT HERE ]</div>
<p>The Main Dashboard provides a high-level overview of statistical cards (Total Residents, Cases) and the AI-Powered Analytics section.</p>

<p><strong>C. Resident Profiling Module</strong></p>
<div class="placeholder">[ MS WORD INSTRUCTION: COPY AND PASTE YOUR ACTUAL RESIDENT LIST SCREENSHOT HERE ]</div>
<p>The Resident Management screen captures demographic data, household affiliation, and sector tags (Senior Citizen, PWD) designed for fast encoding.</p>

<p><strong>D. Certification &amp; DSS Issuance</strong></p>
<div class="placeholder">[ MS WORD INSTRUCTION: COPY AND PASTE YOUR ACTUAL CERTIFICATIONS SCREENSHOT HERE ]</div>
<p>The Certification module streamlines document requests. The Rule-Based DSS automatically cross-references the resident's name against KP records before generating a PDF.</p>

<h3>5. Database Design (Relationships &amp; Schema)</h3>
<div class="diagram">
  ${erdImg ? '<img src="' + erdImg + '" alt="ERD Diagram" />' : '<p>[Image not found]</p>'}
</div>
<p><strong>Explanation:</strong> The database is optimized for Firebase Firestore. The Residents collection is the central entity. Households group multiple residents via a Foreign Key. Cases link to Residents through complainantId and respondentId, allowing the Decision Support System (DSS) to quickly query pending liabilities.</p>

<h2>DEVELOPMENT</h2>

<h3>1. Development Plan / Strategies (Iterative Model)</h3>
<p>The development of the system follows an Iterative Model, allowing the system to be developed in successive phases. Each iteration adds new features and refines existing ones.</p>
<ul>
  <li><strong>Iteration 1 (Foundation &amp; UI):</strong> Setup the project architecture using React.js and Node.js. Establish the database schema in Firebase. Implement authentication and RBAC.</li>
  <li><strong>Iteration 2 (Core Records):</strong> Develop Resident Management and Household Profiling. Implement offline-first capabilities using LocalStorage queue.</li>
  <li><strong>Iteration 3 (Barangay Services):</strong> Create Certification module with PDF generation. Develop Katarungang Pambarangay (KP) case filing.</li>
  <li><strong>Iteration 4 (Smart Features):</strong> Integrate the Rule-Based DSS to check resident records against active cases. Integrate NVIDIA NIM AI API for predictive analytics.</li>
  <li><strong>Iteration 5 (Finalization):</strong> Conduct thorough testing, fix bugs, finalize the Sync Engine, and deploy the system.</li>
</ul>

<h3>2. Tools, Programming Languages, Libraries, and Hardware Requirements</h3>
<ul>
  <li><strong>Frontend:</strong> React.js 19, Tailwind CSS 4, React Router DOM, jsPDF.</li>
  <li><strong>Backend:</strong> Node.js 18+, Express.js 5, JSON Web Tokens (JWT) &amp; bcrypt.</li>
  <li><strong>Database &amp; Storage:</strong> Firebase Firestore (Cloud), LocalStorage (Offline Queue).</li>
  <li><strong>AI Integration:</strong> NVIDIA NIM API (meta/llama-3.3-70b-instruct).</li>
  <li><strong>Hardware Requirements:</strong> Intel Core i3 or AMD Ryzen 3, 8GB RAM, 256GB SSD, Standard internet connection.</li>
</ul>

<h2>TESTING</h2>

<h3>1. Testing Strategies</h3>
<ul>
  <li><strong>Unit Testing:</strong> Testing individual components, such as verifying if the PDF certificate generates the correct template formats.</li>
  <li><strong>Functionality Testing:</strong> Validating all CRUD (Create, Read, Update, Delete) operations in the Resident and Cases modules.</li>
  <li><strong>Integration Testing:</strong> Ensuring the React frontend correctly passes data to the Node.js backend, and verifying that the Rule-Based DSS properly blocks certificate issuance when a resident has an active KP Case.</li>
  <li><strong>Offline Synchronization Testing:</strong> Disconnecting the internet, inputting resident data, and reconnecting to verify if the LocalStorage queue successfully pushes data to Firebase without loss.</li>
</ul>

<h3>2. Evaluation</h3>
<p>The system will be evaluated using the <strong>System Usability Scale (SUS)</strong> and User Acceptance Testing (UAT). A survey questionnaire will be distributed to 5 to 10 actual end-users (Barangay Secretary and staff). The evaluation measures the system's ease of use, offline reliability, and task efficiency. An average SUS score of 68 or higher indicates that the system is highly usable and acceptable.</p>

<h2>DEPLOYMENT</h2>

<h3>1. Plan and Strategies Regarding Deployment</h3>
<p>The system utilizes a split-stack cloud architecture and is configured as a Progressive Web App (PWA). This means barangay staff can install the system on their desktop like a native application directly from the browser, bypassing the need for an App Store. It uses automated CI/CD from GitHub.</p>

<h3>2. Server Specs, Configurations, and Costing</h3>
<ul>
  <li><strong>Frontend Hosting (Vercel):</strong> Hosts the React application using a global Edge Network/CDN for fast loading. (Cost: Free Tier)</li>
  <li><strong>Backend API Hosting (Render):</strong> Node.js environment, 0.1 vCPU, 512MB RAM handling data logic and AI integration. (Cost: Free Tier / ~$7/month for Starter Plan)</li>
  <li><strong>Database (Firebase):</strong> Real-time NoSQL Cloud Database with 1GB Storage limit and 50,000 document reads/day. (Cost: Free Spark Tier)</li>
  <li><strong>Costing Summary:</strong> The development and pilot testing phase costs PHP 0.00. For full production scaling, the estimated maintenance cost is ~PHP 1,000 to PHP 2,500 per year for a custom domain name (.gov.ph or .com).</li>
</ul>

</body>
</html>`;

const outputPath = path.join(__dirname, 'Chapter_3_4_Final_Paper.html');
fs.writeFileSync(outputPath, html, 'utf8');
console.log('✅ Done! File saved to:', outputPath);
