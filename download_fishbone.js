const fs = require('fs');
const https = require('https');
const path = require('path');

const getMermaidUrl = (code) => {
  return `https://quickchart.io/mermaid?fmt=png&code=${encodeURIComponent(code.trim())}`;
};

const fishboneCode = `
graph LR
    subgraph MANPOWER
        M1[Kakulangan sa IT Training]
        M2[Mabagal na paghahanap ng records]
    end
    
    subgraph MACHINES
        E1[Walang centralized server]
        E2[Unstable internet connection]
    end
    
    subgraph METHODS
        P1[Mano-manong paglista sa logbook]
        P2[Mahirap mag-verify ng ID]
    end
    
    subgraph MATERIALS
        T1[Mataas na gastos sa papel]
        T2[Madaling masira ang physical logbooks]
    end
    
    M1 --- M2
    E1 --- E2
    P1 --- P2
    T1 --- T2
    
    M2 --> EFFECT((Mabagal at Madaling<br>Masirang Sistema<br>ng Barangay))
    E2 --> EFFECT
    P2 --> EFFECT
    T2 --> EFFECT
`;

const downloadImage = (filename, code) => {
  return new Promise((resolve, reject) => {
    const url = getMermaidUrl(code);
    const filepath = path.join(__dirname, filename);
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
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

downloadImage('Fishbone_Diagram.jpg', fishboneCode);
