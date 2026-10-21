import 'server-only';
import type { Database } from '@database/db.ts';
import { DocumentType as DbDocumentType } from '@database/enums.ts';
import { sized, uuid } from '@database/field-values.ts';
import type { StoredFile } from '@/features/documents/services/stored-files.ts';

interface Options {
  type: (typeof DbDocumentType.members)[keyof typeof DbDocumentType.members];
  name: string;
  notes?: string;
  stored: StoredFile;
  userId: string;
  skillIds?: string[];
}

// The row of a document that has a stored file: how its columns come from the file and the name
// the user, or a job application, gives it
export function buildDocumentRow({
  type,
  name,
  notes,
  stored,
  userId,
  skillIds,
}: Options): Parameters<Database['Document']['create']>[0] {
  return {
    type,
    name: sized<150>(name),
    originalFilename: sized<255>(stored.originalFilename),
    filePath: stored.filePath,
    size: stored.size,
    notes,
    userId: uuid(userId),
    ...(skillIds && {
      skills: (skills) => skills.create(skillIds.map((skillId) => ({ skillId: uuid(skillId) }))),
    }),
  };
}
