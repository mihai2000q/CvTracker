import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Database } from '../db.ts';
import { sized, uuid } from '../field-values.ts';
import { DocumentType } from '../enums.ts';

type NewDocument = Omit<Parameters<Database['Document']['create']>[0], 'size'>;

// The size is the one thing not written here: it's the size of the file made for each row
const documents: (NewDocument & { missingFile?: true })[] = [
  {
    id: uuid('00000000-0000-7000-8000-000000002001'),
    type: DocumentType.members.Cv,
    name: sized<150>('CV - Full-Stack'),
    originalFilename: sized<255>('cv-fullstack-2026.pdf'),
    filePath: '00000000-0000-7000-8000-000000000001/00000000-0000-7000-8000-000000005001.pdf',
    notes: 'Main CV, updated in September.',
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    skills: (skills) =>
      skills.create([
        { skillId: uuid('00000000-0000-7000-8000-000000001001') },
        { skillId: uuid('00000000-0000-7000-8000-000000001002') },
        { skillId: uuid('00000000-0000-7000-8000-000000001003') },
        { skillId: uuid('00000000-0000-7000-8000-000000001004') },
        { skillId: uuid('00000000-0000-7000-8000-000000001010') },
      ]),
  },
  {
    id: uuid('00000000-0000-7000-8000-000000002002'),
    type: DocumentType.members.Cv,
    name: sized<150>('CV - Frontend'),
    originalFilename: sized<255>('cv-frontend-2026.pdf'),
    filePath: '00000000-0000-7000-8000-000000000001/00000000-0000-7000-8000-000000005002.pdf',
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    skills: (skills) =>
      skills.create([
        { skillId: uuid('00000000-0000-7000-8000-000000001001') },
        { skillId: uuid('00000000-0000-7000-8000-000000001002') },
        { skillId: uuid('00000000-0000-7000-8000-000000001005') },
      ]),
  },
  {
    id: uuid('00000000-0000-7000-8000-000000002003'),
    type: DocumentType.members.Cv,
    name: sized<150>('CV - Backend & Infrastructure'),
    originalFilename: sized<255>('cv-backend-2026.pdf'),
    filePath: '00000000-0000-7000-8000-000000000001/00000000-0000-7000-8000-000000005003.pdf',
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    skills: (skills) =>
      skills.create([
        { skillId: uuid('00000000-0000-7000-8000-000000001006') },
        { skillId: uuid('00000000-0000-7000-8000-000000001007') },
        { skillId: uuid('00000000-0000-7000-8000-000000001008') },
        { skillId: uuid('00000000-0000-7000-8000-000000001009') },
        { skillId: uuid('00000000-0000-7000-8000-000000001010') },
        { skillId: uuid('00000000-0000-7000-8000-000000001004') },
      ]),
  },
  {
    // Word file, no skills, no notes
    id: uuid('00000000-0000-7000-8000-000000002004'),
    type: DocumentType.members.Cv,
    name: sized<150>('CV - 2024 (old)'),
    originalFilename: sized<255>('cv-2024.docx'),
    filePath: '00000000-0000-7000-8000-000000000001/00000000-0000-7000-8000-000000005004.docx',
    userId: uuid('00000000-0000-7000-8000-000000000001'),
  },
  {
    // Used by nothing: can be deleted
    id: uuid('00000000-0000-7000-8000-000000002005'),
    type: DocumentType.members.Cv,
    name: sized<150>('CV - Unused draft'),
    originalFilename: sized<255>('cv-draft.pdf'),
    filePath: '00000000-0000-7000-8000-000000000001/00000000-0000-7000-8000-000000005005.pdf',
    notes: 'Never sent anywhere.',
    userId: uuid('00000000-0000-7000-8000-000000000001'),
  },
  {
    id: uuid('00000000-0000-7000-8000-000000002006'),
    type: DocumentType.members.CoverLetter,
    name: sized<150>('Cover letter - Generic'),
    originalFilename: sized<255>('cover-letter-generic.pdf'),
    filePath: '00000000-0000-7000-8000-000000000001/00000000-0000-7000-8000-000000005006.pdf',
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    skills: (skills) => skills.create([{ skillId: uuid('00000000-0000-7000-8000-000000001001') }]),
  },
  {
    id: uuid('00000000-0000-7000-8000-000000002007'),
    type: DocumentType.members.CoverLetter,
    name: sized<150>('Cover letter - Northwind Labs'),
    originalFilename: sized<255>('cover-letter-northwind.pdf'),
    filePath: '00000000-0000-7000-8000-000000000001/00000000-0000-7000-8000-000000005007.pdf',
    notes: 'Mentions the open-source work on their SDK.',
    userId: uuid('00000000-0000-7000-8000-000000000001'),
  },
  {
    // Row without a file on disk, to see how a broken download behaves
    id: uuid('00000000-0000-7000-8000-000000002008'),
    type: DocumentType.members.CoverLetter,
    name: sized<150>('Cover letter - File went missing'),
    originalFilename: sized<255>('cover-letter-missing.pdf'),
    filePath: '00000000-0000-7000-8000-000000000001/00000000-0000-7000-8000-000000005008.pdf',
    userId: uuid('00000000-0000-7000-8000-000000000001'),
    missingFile: true,
  },
];

// Where the app keeps uploaded files: <uploads>/<userId>/<uuid>.<ext>
export const uploadsDirectory = () => {
  const directory = process.env.DOCUMENTS_UPLOADS_DIRECTORY;
  if (!directory) throw new Error('Missing required environment variable: DOCUMENTS_UPLOADS_DIRECTORY');
  return path.resolve(directory);
};

// A tiny but valid one-page PDF, so previews and downloads work
function makePdf(lines: string[]) {
  const text = lines
    .map((line, index) => `${index === 0 ? '' : '0 -22 Td '}(${line.replace(/[()\\]/g, '')}) Tj`)
    .join('\n');
  const stream = `BT /F1 16 Tf 56 760 Td\n${text}\nET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = objects.map((object, index) => {
    const offset = pdf.length;
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    return offset;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, 'latin1');
}

export async function seedSampleDocuments(db: Database) {
  for (const { missingFile, ...document } of documents) {
    const lines = [document.name, 'Sample document generated by the sample-data seed'];
    const content = document.filePath.endsWith('.pdf')
      ? makePdf(lines)
      : // Not a real Word file: enough for the thumbnail and the download, not for Word itself
        Buffer.from(lines.join('\n'));

    if (!missingFile) {
      const absolutePath = path.join(uploadsDirectory(), ...document.filePath.split('/'));
      await mkdir(path.dirname(absolutePath), { recursive: true });
      await writeFile(absolutePath, content);
    }
    await db.Document.create({ ...document, size: content.length });
  }
}
