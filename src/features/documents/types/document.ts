import { Skill } from '@/features/documents/types/skill.ts';
import { DocumentType } from '@/features/documents/types/enums/document-type.ts';

export interface Document extends DocumentSummary {
  documentType: DocumentType;
  filePath: string;
  originalFilename: string;
  notes?: string;
  uploadedAt: string;
  skills: Skill[];
}

export interface DocumentSummary {
  id: string;
  label: string;
}
