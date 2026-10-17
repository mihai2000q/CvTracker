'use server';

import { updateTag } from 'next/cache';
import { db } from '@database/db';
import { sized, uuid } from '@database/field-values';
import { DocumentType as DbDocumentType } from '@database/enums';
import { constraintViolationReply } from '@database/sql-error';
import { getUserId, verifySession } from '@/lib/auth/session';
import { updateDocumentSchema } from '@/features/documents/schemas/update-document-schema.ts';
import { DocumentType } from '@/features/documents/types/enums/document-type.ts';
import {
  removeStoredDocument,
  storeDocument,
} from '@/features/documents/services/store-document.ts';
import type { SubmissionResult } from '@conform-to/react';
import { zodValidateForm } from '@/lib/zod/parse.ts';
import { cacheTags } from '@/lib/cache-tags.ts';

export async function updateDocument(_state: SubmissionResult | undefined, formData: FormData) {
  const userId = getUserId(await verifySession());

  const submission = zodValidateForm({ formData, schema: updateDocumentSchema });
  if (submission.status !== 'success') {
    return submission.reply();
  }

  const { id, type, name, file, notes } = submission.value;

  const [existing] = await db.Document.where({ id: uuid(id) })
    .include('coverLetterForJobApplications', (ja) => ja.where({ userId: uuid(userId) }).count())
    .include('cvForJobApplications', (ja) => ja.where({ userId: uuid(userId) }).count())
    .all();
  if (!existing) {
    return submission.reply({ formErrors: ['Document not found'] });
  }

  // An application holds it as a CV or as a cover letter, which it would no longer be
  const usedBy = existing.coverLetterForJobApplications + existing.cvForJobApplications;
  if (type !== existing.type && usedBy > 0) {
    return submission.reply({
      fieldErrors: { type: ['The type of a document used by a job application cannot change'] },
    });
  }

  const storedFile = file ? await storeDocument(userId, file) : undefined;

  try {
    await db.Document.where({ id: uuid(id) }).update({
      type:
        type === DocumentType.CV ? DbDocumentType.members.Cv : DbDocumentType.members.CoverLetter,
      name: sized<150>(name),
      notes: notes ?? null,
      ...(storedFile && {
        originalFilename: sized<255>(storedFile.originalFilename),
        filePath: storedFile.filePath,
        size: storedFile.size,
      }),
    });
  } catch (error) {
    await storedFile?.discard();
    const reply = constraintViolationReply(error);
    if (reply) return submission.reply(reply);
    throw error;
  }

  if (storedFile) await removeStoredDocument(existing.filePath).catch(() => {});

  updateTag(cacheTags.documents(userId));
  updateTag(cacheTags.jobApplications(userId));
  return submission.reply({ resetForm: true });
}
