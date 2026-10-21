import 'server-only';
import path from 'node:path';
import { z } from 'zod';
import { db } from '@database/db';
import { uuid } from '@database/field-values';
import { verifySession } from '@/lib/auth/session';
import { readDocument } from '@/features/documents/services/read-document.ts';

const CONTENT_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.odt': 'application/vnd.oasis.opendocument.text',
};

// Null when there is no such document or its file is gone
export async function downloadDocument(id: string) {
  await verifySession();

  if (!z.uuid().safeParse(id).success) return null;
  const document = await db.Document.first({ id: uuid(id) });
  if (!document) return null;

  const file = await readDocument(document.filePath);
  if (!file) return null;

  return {
    ...file,
    filename: document.originalFilename,
    contentType: CONTENT_TYPES[path.extname(document.originalFilename).toLowerCase()],
  };
}
