import 'server-only';
import { Document, toDocument } from '@/features/documents/types/document.ts';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values.ts';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import { z } from 'zod';
import { zodValidate } from '@/lib/zod/parse.ts';
import { Result } from '@/types/result.ts';

export async function getDocument(id: string): Promise<Result<Document | null>> {
  const userId = getUserId(await verifySession());

  const parsed = zodValidate(id, z.uuid());
  if (!parsed.success) {
    return parsed;
  }

  return { success: true, data: await getDocumentQuery(userId, parsed.data) };
}

async function getDocumentQuery(userId: string, id: string): Promise<Document | null> {
  'use cache';
  cacheTag(cacheTags.documents(userId), cacheTags.jobApplications(userId));

  const [document] = await db.Document.where({ id: uuid(id), userId: uuid(userId) })
    .include('coverLetterForJobApplications', (ja) => ja.where({ userId: uuid(userId) }).count())
    .include('cvForJobApplications', (ja) => ja.where({ userId: uuid(userId) }).count())
    .all();

  if (!document) {
    return null;
  }

  return toDocument(document);
}
