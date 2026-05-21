/**
 * Converts CAPSTONE_DEFENSE_SCRIPT_TAGLISH.md → .docx
 * Run: node generate_defense_script_docx.js
 */
const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
} = require('docx');

const mdPath = path.join(__dirname, 'CAPSTONE_DEFENSE_SCRIPT_TAGLISH.md');
const outPath = path.join(__dirname, 'CAPSTONE_DEFENSE_SCRIPT_TAGLISH.docx');

/** Parse **bold** and `code` into TextRun[] */
function parseInline(text) {
  const runs = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      runs.push(new TextRun({ text: text.slice(last, m.index) }));
    }
    const token = m[0];
    if (token.startsWith('**')) {
      runs.push(new TextRun({ text: token.slice(2, -2), bold: true }));
    } else {
      runs.push(new TextRun({ text: token.slice(1, -1), font: 'Consolas', size: 20 }));
    }
    last = m.index + token.length;
  }
  if (last < text.length) {
    runs.push(new TextRun({ text: text.slice(last) }));
  }
  if (runs.length === 0) {
    runs.push(new TextRun({ text: text || '' }));
  }
  return runs;
}

function paragraph(text, opts = {}) {
  return new Paragraph({
    children: parseInline(text),
    spacing: { after: 120 },
    ...opts,
  });
}

function heading(text, level) {
  const map = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
  };
  return new Paragraph({
    heading: map[level] || HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true })],
    spacing: { before: level === 1 ? 0 : 240, after: 120 },
  });
}

function blockquote(text) {
  const runs = parseInline(text);
  runs.forEach((r) => {
    if (r.italics !== undefined) r.italics = true;
  });
  return new Paragraph({
    children: runs,
    indent: { left: 720 },
    spacing: { after: 120 },
    shading: { type: ShadingType.CLEAR, fill: 'F0F6FC' },
  });
}

function bulletItem(text) {
  return new Paragraph({
    children: parseInline(text),
    bullet: { level: 0 },
    spacing: { after: 60 },
  });
}

function buildTable(rows) {
  if (!rows.length) return null;
  const colCount = Math.max(...rows.map((r) => r.length));
  const tableRows = rows.map((row, ri) => {
    const cells = [];
    for (let c = 0; c < colCount; c++) {
      const cellText = row[c] || '';
      cells.push(
        new TableCell({
          children: [
            new Paragraph({
              children: parseInline(cellText.replace(/\*\*/g, '').replace(/`/g, '')),
              alignment: AlignmentType.LEFT,
            }),
          ],
          shading:
            ri === 0
              ? { type: ShadingType.CLEAR, fill: 'E8EEF5' }
              : undefined,
          width: { size: 100 / colCount, type: WidthType.PERCENTAGE },
        })
      );
    }
    return new TableRow({ children: cells });
  });
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    },
  });
}

function mdToDocxChildren(md) {
  const lines = md.split('\n');
  const children = [];
  let tableRows = [];
  let inTable = false;

  const flushTable = () => {
    const t = buildTable(tableRows);
    if (t) {
      children.push(t);
      children.push(new Paragraph({ text: '', spacing: { after: 120 } }));
    }
    tableRows = [];
    inTable = false;
  };

  // Cover instructions box at top
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'BeMIS — Capstone Defense Script (Taglish)',
          bold: true,
          size: 32,
          color: '0A3161',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Barangay Management & Information System · Mamburao, Occidental Mindoro',
          size: 22,
          color: '475569',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  );

  for (const line of lines) {
    if (line.startsWith('|') && line.includes('|')) {
      if (/^\|[\s\-:|]+\|$/.test(line.trim())) continue;
      const cells = line
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());
      tableRows.push(cells);
      inTable = true;
      continue;
    }
    if (inTable) flushTable();

    if (line.startsWith('# ')) {
      children.push(heading(line.slice(2), 1));
    } else if (line.startsWith('## ')) {
      children.push(heading(line.slice(3), 2));
    } else if (line.startsWith('### ')) {
      children.push(heading(line.slice(4), 3));
    } else if (line.startsWith('> ')) {
      children.push(blockquote(line.slice(2)));
    } else if (line.startsWith('- ')) {
      children.push(bulletItem(line.slice(2)));
    } else if (line.trim() === '---') {
      children.push(
        new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
          spacing: { after: 200, before: 200 },
        })
      );
    } else if (line.trim() === '') {
      // skip extra blank lines
    } else {
      children.push(paragraph(line));
    }
  }
  if (inTable) flushTable();

  return children;
}

async function main() {
  const md = fs.readFileSync(mdPath, 'utf8');
  const doc = new Document({
    creator: 'BeMIS Capstone Team',
    title: 'Capstone Defense Script (Taglish)',
    description: 'Defense presentation script for BeMIS',
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: mdToDocxChildren(md),
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outPath, buffer);
  console.log('✅ Created:', outPath);
  console.log('   Size:', (buffer.length / 1024).toFixed(1), 'KB');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
