import 'server-only';
import type { Transaction } from '@database/db.ts';
import { sized, uuid } from '@database/field-values.ts';
import { DocumentType as DbDocumentType } from '@database/enums.ts';
import { buildDocumentRow } from '@/features/documents/services/build-document-row.ts';
import type { StoredFile } from '@/features/documents/services/stored-files.ts';

// What the form says about the organization and the documents of a job application: an existing
// one by id, or a new one (an organization by name, a document by file). A file wins over an id
export interface JobApplicationParts {
  countryId: string;
  organizationId?: string;
  organizationName: string;
  cvDocumentId?: string;
  cvDocumentFile?: File;
  coverLetterDocumentId?: string;
  coverLetterDocumentFile?: File;
}

// The files a job application brings, the ones to store before its rows are written
export const filesOf = ({ cvDocumentFile, coverLetterDocumentFile }: JobApplicationParts) => ({
  cv: cvDocumentFile,
  coverLetter: coverLetterDocumentFile,
});

// The organization and the documents a job application points at: the ones it was given by id,
// and the new ones created here, from the files `withStored` stored for `filesOf`. It says
// whether it created an organization or documents, for the cache tags
export async function resolveJobApplicationParts(
  tx: Transaction,
  userId: string,
  parts: JobApplicationParts,
  stored: { cv?: StoredFile; coverLetter?: StoredFile },
  skillIds?: string[]
) {
  const { countryId, organizationId, organizationName } = parts;
  const { cvDocumentId, coverLetterDocumentId } = parts;

  return {
    organizationId:
      organizationId ?? (await createNewOrganization(tx, userId, organizationName, countryId)).id,
    // A document is new exactly when its file was stored
    cvDocumentId: stored.cv
      ? (
          await createNewDocument(tx, {
            type: DbDocumentType.members.Cv,
            stored: stored.cv,
            userId,
            skillIds,
          })
        ).id
      : cvDocumentId!,
    coverLetterDocumentId: stored.coverLetter
      ? (
          await createNewDocument(tx, {
            type: DbDocumentType.members.CoverLetter,
            stored: stored.coverLetter,
            userId,
            skillIds,
          })
        ).id
      : coverLetterDocumentId,
    createdOrganization: !organizationId,
    createdDocuments: Boolean(stored.cv || stored.coverLetter),
  };
}

// An organization typed in along with a job application, located in its country
function createNewOrganization(tx: Transaction, userId: string, name: string, countryId: string) {
  return tx.Organization.create({
    name: sized<200>(name),
    organizationCountries: (organizationCountries) =>
      organizationCountries.create([{ countryId: uuid(countryId) }]),
    userId: uuid(userId),
  });
}

interface NewDocument {
  type: (typeof DbDocumentType.members)[keyof typeof DbDocumentType.members];
  stored: StoredFile;
  userId: string;
  // The skills it shares with the application, when it has any
  skillIds?: string[];
}

// A document uploaded along with a job application is named after its file
function createNewDocument(tx: Transaction, { type, stored, userId, skillIds }: NewDocument) {
  const name = stored.originalFilename.replace(/\.[^.]+$/, '').slice(0, 150);
  return tx.Document.create(buildDocumentRow({ type, name, stored, userId, skillIds }));
}
