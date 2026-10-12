import { db } from '@database/db.ts';
import { uuid } from '@database/field-values';
import { DocumentType as DbDocumentType } from '@database/enums';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import { DocumentType } from '@/features/documents/types/enums/document-type.ts';

// The user's documents, or only one type of them
export async function countDocuments(type?: DocumentType): Promise<number> {
  const userId = getUserId(await verifySession());
  return countDocumentsQuery(userId, type);
}

async function countDocumentsQuery(userId: string, type?: DocumentType): Promise<number> {
  'use cache';
  cacheTag(cacheTags.documents(userId));

  const { total } = await db.Document.where({
    userId: uuid(userId),
    ...(type && {
      type:
        type === DocumentType.CV ? DbDocumentType.members.Cv : DbDocumentType.members.CoverLetter,
    }),
  }).aggregate((aggregate) => ({ total: aggregate.count() }));
  return total;
}
