import { DocumentType } from '@/features/documents/types/enums/document-type.ts';

export interface Document extends DocumentSummary {
  filePath: string;
  notes?: string | null;
  jobApplicationsCount: number;
}

export interface DocumentSummary {
  id: string;
  name: string;
  originalFilename: string;
  type: DocumentType;
  size: number; // bytes
  uploadedAt: string;
}

export const toDocumentSummary = (
  row: Omit<DocumentSummary, 'type'> & { type: string }
): DocumentSummary => ({
  id: row.id,
  name: row.name,
  type: row.type as DocumentType,
  originalFilename: row.originalFilename,
  size: row.size,
  uploadedAt: row.uploadedAt,
});

export const toDocument = (
  row: Omit<Document, 'type' | 'jobApplicationsCount'> & {
    type: string;
    coverLetterForJobApplications: number;
    cvForJobApplications: number;
  }
): Document => ({
  ...toDocumentSummary(row),
  filePath: row.filePath,
  notes: row.notes,
  // A document is used as a CV or as a cover letter, per its type, so only one of the two counts
  // is above zero
  jobApplicationsCount: row.coverLetterForJobApplications || row.cvForJobApplications,
});
