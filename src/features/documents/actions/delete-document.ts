'use server';

import { z } from 'zod';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values.ts';
import { constraintViolationReply } from '@database/sql-error.ts';
import { updateTag } from 'next/cache';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { storedFiles } from '@/features/documents/services/stored-files.ts';
import { cacheTags } from '@/lib/cache-tags.ts';
import { Result } from '@/types/result.ts';

export async function deleteDocument(documentId: string): Promise<Result<undefined>> {
  const session = await verifySession();

  if (!z.uuid().safeParse(documentId).success) {
    return { success: false, errors: { id: ['Document not found'] } };
  }

  let deleted;
  try {
    deleted = await db.Document.where({ id: uuid(documentId) }).delete();
  } catch (error) {
    const reply = constraintViolationReply(error);
    if (reply) return { success: false, errors: reply };
    throw error;
  }
  if (!deleted) return { success: false, errors: { id: ['Document not found'] } };

  await storedFiles.remove(deleted.filePath);

  updateTag(cacheTags.documents(getUserId(session)));
  return { success: true, data: undefined };
}
