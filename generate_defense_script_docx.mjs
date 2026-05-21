/**
 * Converts CAPSTONE_DEFENSE_SCRIPT_TAGLISH.md → .docx
 * Run: node generate_defense_script_docx.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
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
  ShadingType,
  BorderStyle,
} from 'docx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mdPath = path.join(__dirname, 'CAPSTONE_DEFENSE_SCRIPT_TAGLISH.md');
const outPath = path.join(__dirname, 'CAPSTONE_DEFENSE_SCRIPT_TAGLISH.docx');

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
    } else if (token.startsWith('`')) {
      runs.push(new TextRun({ text: token.slice(1, -1), font: 'Consolas', size: 20 }));
    }
    last = m.index + token.length;
  }
  if (last < text.length) runs.push(new TextRun({ text: text.slice(last) }));
  if (runs.length === 0) runs.push(new TextRun({ text: text || ' ' }));
  return runs;
}

function para(children, opts = {}) {
  return new Paragraph({ children: parseInline(children), spacing: { after: 140 }, ...opts });
}

function buildChildren(md) {
  const children = [];
  const lines = md.split('\n');
  let tableRows = [];
  let quoteBuffer = [];

  const flushTable = () => {
    if (!tableRows.length) return;
    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: tableRows.map((cells, ri) =>
        new TableRow({
          children: cells.map(
            (cell) =>
              new TableCell({
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                shading:
                  ri === 0
                    ? { fill: 'D6E4F0', type: ShadingType.CLEAR, color: 'auto' }
                    : undefined,
                children: [
                  new Paragraph({
                    children: parseInline(cell),
                    alignment: AlignmentType.LEFT,
                  }),
                ],
              })
          ),
        })
      ),
    });
    children.push(table);
    children.push(new Paragraph({ text: '', spacing: { after: 120 } }));
    tableRows = [];
  };

  const flushQuote = () => {
    if (!quoteBuffer.length) return;
    const text = quoteBuffer.join(' ').replace(/^>\s?/gm, '').trim();
    children.push(
      new Paragraph({
        children: parseInline(text),
        indent: { left: 540 },
        spacing: { after: 160, before: 80 },
        border: {
          left: { style: BorderStyle.SINGLE, size: 12, color: '1A4F8A', space: 8 },
        },
      })
    );
    quoteBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('|') && line.includes('|')) {
      flushQuote();
      if (/^\|[\s\-:|]+\|$/.test(line.trim())) continue;
      tableRows.push(line.split('|').slice(1, -1).map((c) => c.trim()));
      continue;
    }
    flushTable();

    if (line.startsWith('> ')) {
      quoteBuffer.push(line);
      continue;
    }
    flushQuote();

    if (line.startsWith('# ')) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: parseInline(line.slice(2)),
          spacing: { before: 320, after: 200 },
        })
      );
    } else if (line.startsWith('## ')) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: parseInline(line.slice(3)),
          spacing: { before: 280, after: 160 },
        })
      );
    } else if (line.startsWith('### ')) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: parseInline(line.slice(4)),
          spacing: { before: 200, after: 120 },
        })
      );
    } else if (line.startsWith('- ')) {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          children: parseInline(line.slice(2)),
          spacing: { after: 80 },
        })
      );
    } else if (/^\d+\.\s/.test(line)) {
      children.push(para(line, { spacing: { after: 80 } }));
    } else if (line.trim() === '---') {
      children.push(new Paragraph({ text: '', spacing: { before: 200, after: 200 } }));
    } else if (line.trim() === '') {
      /* skip blank */
    } else {
      children.push(para(line));
    }
  }

  flushTable();
  flushQuote();
  return children;
}

const md = fs.readFileSync(mdPath, 'utf8');

const doc = new Document({
  creator: 'BeMIS Capstone Team',
  title: 'BeMIS Capstone Defense Script (Taglish)',
  description: 'Defense presentation script for panel',
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
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: 'BeMIS — CAPSTONE DEFENSE SCRIPT',
              bold: true,
              size: 32,
              color: '0A3161',
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [
            new TextRun({
              text: 'Taglish · Landing Page → Secretary → Admin',
              size: 24,
              color: '475569',
            }),
          ],
        }),
        new Paragraph({
          shading: { fill: 'FFF7ED', type: ShadingType.CLEAR, color: 'auto' },
          spacing: { after: 300 },
          children: parseInline(
            'Para sa panel defense. Basahin habang nagde-demo. Demo accounts: admin@mamburao.gov.ph / brgy1@mamburao.gov.ph — password: password123'
          ),
        }),
        ...buildChildren(md),
      ],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(outPath, buffer);
console.log('✅ Created:', outPath);
console.log('   Size:', (buffer.length / 1024).toFixed(1), 'KB');
