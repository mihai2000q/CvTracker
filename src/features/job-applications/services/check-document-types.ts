import 'server-only';
import type { Transaction } from '@database/db.ts';
import { uuid } from '@database/field-values.ts';
import { DocumentType as DbDocumentType } from '@database/enums.ts';

interface ChosenDocuments {
  cvDocumentId?: string;
  coverLetterDocumentId?: string;
}

export class DocumentTypesError extends Error {
  constructor(public errors: { cvDocumentId?: string[]; coverLetterDocumentId?: string[] }) {
    super('A document of a job application is not of the type of its role');
  }
}

// The database doesn't tell whether an application holds a document as its CV or as its cover
// letter, so this does: the CV has to be of the CV type, the cover letter of the cover letter
// type. It runs in the transaction that writes the application, and throws a DocumentTypesError
// saying what is wrong with each. A document that doesn't exist is not told here: writing the
// application fails on it
export async function checkDocumentTypes(
  tx: Transaction,
  { cvDocumentId, coverLetterDocumentId }: ChosenDocuments
): Promise<void> {
  const [cvIsCoverLetter, coverLetterIsCv] = await Promise.all([
    cvDocumentId &&
      tx.Document.first({ id: uuid(cvDocumentId), type: DbDocumentType.members.CoverLetter }),
    coverLetterDocumentId &&
      tx.Document.first({ id: uuid(coverLetterDocumentId), type: DbDocumentType.members.Cv }),
  ]);

  const errors = {
    ...(cvIsCoverLetter && { cvDocumentId: ['The CV must be a document of the CV type'] }),
    ...(coverLetterIsCv && {
      coverLetterDocumentId: ['The cover letter must be a document of the cover letter type'],
    }),
  };
  if (Object.keys(errors).length > 0) throw new DocumentTypesError(errors);
}
