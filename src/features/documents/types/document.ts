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
