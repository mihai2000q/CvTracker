import 'server-only';
import { z } from 'zod';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values.ts';
import { verifySession } from '@/lib/auth/session.ts';
import { storedFiles } from '@/features/documents/services/stored-files.ts';

// Null when there is no such document or its file is gone
export async function downloadDocument(id: string) {
  await verifySession();

  if (!z.uuid().safeParse(id).success) return null;
  const document = await db.Document.first({ id: uuid(id) });
  if (!document) return null;

  const file = await storedFiles.open(document.filePath);
  if (!file) return null;

  return { ...file, filename: document.originalFilename };
}
