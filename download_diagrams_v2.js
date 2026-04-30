const fs = require('fs');
const https = require('https');
const path = require('path');

const getMermaidUrl = (code) => {
  const obj = {
    code: code.trim(),
    mermaid: { theme: 'default' }
  };
  const base64 = Buffer.from(JSON.stringify(obj)).toString('base64');
  return `https://mermaid.ink/img/${base64}`;
};

const diagrams = {
  'Hierarchical_Diagram.jpg': `
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
`,
  'DFD_Diagram.jpg': `
graph LR
    R((Resident)) -- Requests & Data --> S[ProfiligSystem]
    S -- Certificates & Updates --> R
    
    B((Barangay Staff)) -- Encodes Data --> S
    S -- System Alerts --> B
    
    C((Barangay Captain)) -- Views Analytics --> S
    S -- Reports & AI Insights --> C
`,
  'Architecture_Diagram.jpg': `
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
`,
  'Database_ERD_Diagram.jpg': `
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
`
};

const downloadImage = (filename, code) => {
  return new Promise((resolve, reject) => {
    const url = getMermaidUrl(code);
    const filepath = path.join(__dirname, filename);
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed with status code: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      console.error(`❌ Error downloading ${filename}:`, err.message);
      reject(err);
    });
  });
};

const downloadAll = async () => {
  console.log('Downloading diagrams using Mermaid Ink API...');
  for (const [filename, code] of Object.entries(diagrams)) {
    try {
      await downloadImage(filename, code);
    } catch (e) {
      console.error(e.message);
    }
  }
  console.log('🎉 All diagrams downloaded successfully to your folder!');
};

downloadAll();
