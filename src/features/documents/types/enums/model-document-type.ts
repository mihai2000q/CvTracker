import 'server-only';
import { DocumentType as ModelDocumentType } from '@database/enums.ts';
import { DocumentType } from '@/features/documents/types/enums/document-type.ts';

// The document types as the model has them, for what writes or filters by one. It stays out of
// the enum's own file because that one is imported by client components, and the model's enums
// would come with it
export const MODEL_DOCUMENT_TYPES = {
  [DocumentType.CV]: ModelDocumentType.members.Cv,
  [DocumentType.CoverLetter]: ModelDocumentType.members.CoverLetter,
};
