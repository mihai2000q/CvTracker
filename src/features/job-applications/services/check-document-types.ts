import 'server-only';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values.ts';
import { DocumentType as DbDocumentType } from '@database/enums.ts';

interface ChosenDocuments {
  cvDocumentId?: string;
  coverLetterDocumentId?: string;
}

// The database doesn't tell whether an application holds a document as its CV or as its cover
// letter, so this does: the CV has to be of the CV type, the cover letter of the cover letter
// type. Says what is wrong with each, or nothing when all is well. A document that doesn't exist
// is not told here: writing the application fails on it
export async function checkDocumentTypes({
  cvDocumentId,
  coverLetterDocumentId,
}: ChosenDocuments): Promise<{ cvDocumentId?: string[]; coverLetterDocumentId?: string[] } | null> {
  const [cvIsCoverLetter, coverLetterIsCv] = await Promise.all([
    cvDocumentId &&
      db.Document.first({ id: uuid(cvDocumentId), type: DbDocumentType.members.CoverLetter }),
    coverLetterDocumentId &&
      db.Document.first({ id: uuid(coverLetterDocumentId), type: DbDocumentType.members.Cv }),
  ]);

  const errors = {
    ...(cvIsCoverLetter && { cvDocumentId: ['The CV must be a document of the CV type'] }),
    ...(coverLetterIsCv && {
      coverLetterDocumentId: ['The cover letter must be a document of the cover letter type'],
    }),
  };
  return Object.keys(errors).length > 0 ? errors : null;
}
