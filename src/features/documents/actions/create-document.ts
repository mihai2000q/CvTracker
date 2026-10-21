'use server';

import { updateTag } from 'next/cache';
import { db } from '@database/db.ts';
import { constraintViolationReply } from '@database/sql-error.ts';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { createDocumentSchema } from '@/features/documents/schemas/create-document-schema.ts';
import { MODEL_DOCUMENT_TYPES } from '@/features/documents/types/enums/model-document-type.ts';
import { buildDocumentRow } from '@/features/documents/services/build-document-row.ts';
import { storedFiles } from '@/features/documents/services/stored-files.ts';
import type { SubmissionResult } from '@conform-to/react';
import { zodValidateForm } from '@/lib/zod/parse.ts';
import { cacheTags } from '@/lib/cache-tags.ts';

export async function createDocument(_state: SubmissionResult | undefined, formData: FormData) {
  const session = await verifySession();
  const userId = getUserId(session);

  const submission = zodValidateForm({ formData, schema: createDocumentSchema });
  if (submission.status !== 'success') {
    return submission.reply();
  }

  const { type, name, file, notes, skillIds } = submission.value;

  try {
    await storedFiles.withStored(userId, { file }, async ({ file: storedFile }) => {
      await db.Document.create(
        buildDocumentRow({
          type: MODEL_DOCUMENT_TYPES[type],
          name,
          notes,
          stored: storedFile,
          userId,
          skillIds,
        })
      );
    });
  } catch (error) {
    const reply = constraintViolationReply(error);
    if (reply) return submission.reply(reply);
    throw error;
  }

  updateTag(cacheTags.documents(userId));
  return submission.reply({ resetForm: true });
}
