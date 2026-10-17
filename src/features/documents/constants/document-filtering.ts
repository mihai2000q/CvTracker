import { z } from 'zod';
import type { ModelAccessor } from '@prisma/orm-postgres/orm-client';
import type { Contract } from '@database/contract.d';
import { fuzzy } from '@database/filter.ts';
import { DocumentType } from '@/features/documents/types/enums/document-type.ts';

export const DOCUMENT_FILTERS = {
  type: z.enum(DocumentType),
};

type DocumentAccessor = ModelAccessor<Contract, 'Document', 'public'>;

const documentName = fuzzy((d: DocumentAccessor) => d.name);

export const DOCUMENT_SEARCH_COLUMNS = [documentName, (d: DocumentAccessor) => d.originalFilename];

// What a combobox searches: the name only, as the filename doesn't split into words
export const DOCUMENT_NAME_SEARCH_COLUMNS = [documentName];
