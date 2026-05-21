/**
 * Generates Word-friendly HTML from CAPSTONE_DEFENSE_SCRIPT_TAGLISH.md
 * Run: node generate_defense_script_doc.js
 * Then open CAPSTONE_DEFENSE_SCRIPT_TAGLISH.html in Microsoft Word → Save As → .docx
 */
const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, 'CAPSTONE_DEFENSE_SCRIPT_TAGLISH.md');
const outPath = path.join(__dirname, 'CAPSTONE_DEFENSE_SCRIPT_TAGLISH.html');

const md = fs.readFileSync(mdPath, 'utf8');

function mdToHtml(text) {
  const lines = text.split('\n');
  let html = '';
  let inTable = false;
  let tableRows = [];

  const flushTable = () => {
    if (!tableRows.length) return;
    html += '<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;margin:10pt 0;">\n';
    tableRows.forEach((row, i) => {
      const tag = i === 0 ? 'th' : 'td';
      const bg = i === 0 ? ' style="background:#e8eef5;font-weight:bold;"' : '';
      html += '<tr>' + row.map(c => `<${tag}${bg}>${c}</${tag}>`).join('') + '</tr>\n';
    });
    html += '</table>\n';
    tableRows = [];
    inTable = false;
  };

  for (let line of lines) {
    if (line.startsWith('|') && line.includes('|')) {
      if (/^\|[\s\-:|]+\|$/.test(line.trim())) continue;
      const cells = line.split('|').slice(1, -1).map(c => c.trim().replace(/\*\*/g, '<strong>').replace(/`/g, '<code>'));
      tableRows.push(cells);
      inTable = true;
      continue;
    }
    if (inTable) flushTable();

    if (line.startsWith('# ')) {
      html += `<h1>${line.slice(2)}</h1>\n`;
    } else if (line.startsWith('## ')) {
      html += `<h2>${line.slice(3)}</h2>\n`;
    } else if (line.startsWith('### ')) {
      html += `<h3>${line.slice(4)}</h3>\n`;
    } else if (line.startsWith('> ')) {
      html += `<blockquote style="border-left:4px solid #1a4f8a;padding:8pt 12pt;margin:8pt 0;background:#f0f6fc;font-style:italic;">${line.slice(2)}</blockquote>\n`;
    } else if (line.startsWith('- ')) {
      html += `<li>${line.slice(2).replace(/\*\*/g, '<strong>').replace(/`/g, '<code>')}</li>\n`;
    } else if (line.trim() === '---') {
      html += '<hr style="margin:18pt 0;border:none;border-top:1px solid #ccc;"/>\n';
    } else if (line.trim() === '') {
      html += '<br/>\n';
    } else {
      html += `<p>${line.replace(/\*\*/g, '<strong>').replace(/`/g, '<code>')}</p>\n`;
    }
  }
  if (inTable) flushTable();
  return html;
}

const body = mdToHtml(md);

const html = `<!DOCTYPE html>
<html lang="tl">
<head>
<meta charset="UTF-8">
<title>BeMIS Capstone Defense Script (Taglish)</title>
<style>
  @page { margin: 2.54cm; }
  body {
    font-family: 'Calibri', 'Arial', sans-serif;
    font-size: 11pt;
    line-height: 1.45;
    color: #1a1a1a;
    max-width: 18cm;
    margin: 0 auto;
    padding: 1cm;
  }
  h1 { font-size: 16pt; color: #0a3161; text-align: center; margin-bottom: 6pt; page-break-before: avoid; }
  h2 { font-size: 13pt; color: #0a3161; margin-top: 16pt; border-bottom: 2px solid #0a3161; padding-bottom: 4pt; }
  h3 { font-size: 12pt; color: #1a4f8a; margin-top: 12pt; }
  p  { margin: 6pt 0; text-align: justify; }
  li { margin: 3pt 0; }
  blockquote { font-size: 10.5pt; }
  code { background: #f1f5f9; padding: 1pt 4pt; font-family: Consolas, monospace; font-size: 10pt; }
  table { font-size: 10pt; }
  th, td { vertical-align: top; }
  .cover-note {
    background: #fffbeb;
    border: 1px solid #f59e0b;
    padding: 12pt;
    margin-bottom: 18pt;
    font-size: 10pt;
  }
</style>
</head>
<body>

<div class="cover-note">
<strong>📄 Paano makuha ang DOCX:</strong><br/>
1. Buksan ang file na ito sa <strong>Microsoft Word</strong><br/>
2. File → <strong>Save As</strong> → piliin <strong>Word Document (.docx)</strong><br/>
3. O i-print bilang PDF para sa defense packet<br/><br/>
<strong>Source:</strong> CAPSTONE_DEFENSE_SCRIPT_TAGLISH.md · I-run: <code>node generate_defense_script_doc.js</code> para i-update ang HTML
</div>

${body}

</body>
</html>`;

fs.writeFileSync(outPath, html, 'utf8');
console.log('✅ Created:', outPath);
console.log('   Open in Word → Save As → .docx');
