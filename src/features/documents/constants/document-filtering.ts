import { z } from 'zod';
import type { ModelAccessor } from '@prisma/orm-postgres/orm-client';
import type { Contract } from '@database/contract.d';
import { DocumentType } from '@/features/documents/types/enums/document-type.ts';

export const DOCUMENT_FILTERS = {
  type: z.enum(DocumentType),
};

type DocumentAccessor = ModelAccessor<Contract, 'Document', 'public'>;

export const DOCUMENT_SEARCH_COLUMNS = [
  (d: DocumentAccessor) => d.name,
  (d: DocumentAccessor) => d.originalFilename,
];
