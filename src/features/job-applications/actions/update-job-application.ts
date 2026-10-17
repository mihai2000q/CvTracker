'use server';

import { updateTag } from 'next/cache';
import { db, dbClient } from '@database/db';
import { sized, uuid } from '@database/field-values';
import { DocumentType as DbDocumentType } from '@database/enums';
import { constraintViolationReply } from '@database/sql-error';
import { getUserId, verifySession } from '@/lib/auth/session';
import type { SubmissionResult } from '@conform-to/react';
import { zodValidateForm } from '@/lib/zod/parse.ts';
import { cacheTags } from '@/lib/cache-tags.ts';
import { StoredDocument, storeDocument } from '@/features/documents/services/store-document.ts';
import { normalizeSource } from '@/features/job-applications/constants/job-sources.ts';
import { updateJobApplicationSchema } from '@/features/job-applications/schemas/update-job-application-schema.ts';

export async function updateJobApplication(
  _state: SubmissionResult | undefined,
  formData: FormData
) {
  const userId = getUserId(await verifySession());

  const submission = zodValidateForm({ formData, schema: updateJobApplicationSchema });
  if (submission.status !== 'success') {
    return submission.reply();
  }

  const {
    id,
    title,
    postingUrl,
    source,
    appliedAt,
    notes,
    organizationName,
    organizationId,
    countryId,
    cvDocumentId,
    coverLetterDocumentId,
    cvDocumentFile,
    coverLetterDocumentFile,
  } = submission.value;

  const existing = await db.JobApplication.first({ id: uuid(id) });
  if (!existing) {
    return submission.reply({ formErrors: ['Job application not found'] });
  }

  let storedCv: StoredDocument | undefined;
  let storedCoverLetter: StoredDocument | undefined;

  try {
    if (cvDocumentFile) storedCv = await storeDocument(userId, cvDocumentFile);
    if (coverLetterDocumentFile) {
      storedCoverLetter = await storeDocument(userId, coverLetterDocumentFile);
    }

    // What is new (an organization, the documents) is written with the application, or not at all
    await dbClient.transaction(async ({ orm }) => {
      const tx = orm.public;

      const newOrganization = organizationId
        ? undefined
        : await tx.Organization.create({
            name: sized<200>(organizationName),
            organizationCountries: (organizationCountries) =>
              organizationCountries.create([{ countryId: uuid(countryId) }]),
            userId: uuid(userId),
          });
      const newCv = storedCv
        ? await tx.Document.create(newDocument(DbDocumentType.members.Cv, storedCv, userId))
        : undefined;
      const newCoverLetter = storedCoverLetter
        ? await tx.Document.create(
            newDocument(DbDocumentType.members.CoverLetter, storedCoverLetter, userId)
          )
        : undefined;

      await tx.JobApplication.where({ id: uuid(id) }).update({
        title: sized<200>(title),
        postingUrl: postingUrl ?? null,
        source: source ? sized<100>(normalizeSource(source)) : null,
        appliedAt: Temporal.PlainDate.from(appliedAt),
        notes: notes ?? null,
        organizationId: organizationId ? uuid(organizationId) : uuid(newOrganization!.id),
        countryId: uuid(countryId),
        cvDocumentId: newCv ? uuid(newCv.id) : uuid(cvDocumentId!),
        coverLetterDocumentId: newCoverLetter
          ? uuid(newCoverLetter.id)
          : coverLetterDocumentId
            ? uuid(coverLetterDocumentId)
            : null,
      });
    });
  } catch (error) {
    // Don't leave orphaned files behind if the rows couldn't be written
    await Promise.all([storedCv?.discard(), storedCoverLetter?.discard()]);
    const reply = constraintViolationReply(error);
    if (reply) return submission.reply(reply);
    throw error;
  }

  updateTag(cacheTags.jobApplications(userId));
  updateTag(cacheTags.documents(userId));
  updateTag(cacheTags.organizations(userId));
  return submission.reply({ resetForm: true });
}

type DocumentInput = Parameters<typeof db.Document.create>[0];

function newDocument(
  type: (typeof DbDocumentType.members)[keyof typeof DbDocumentType.members],
  stored: StoredDocument,
  userId: string
): DocumentInput {
  const name = stored.originalFilename.replace(/\.[^.]+$/, '').slice(0, 150);
  return {
    type,
    name: sized<150>(name),
    originalFilename: sized<255>(stored.originalFilename),
    filePath: stored.filePath,
    size: stored.size,
    userId: uuid(userId),
  };
}
