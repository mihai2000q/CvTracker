'use server';

import { Temporal } from 'temporal-polyfill';
import { updateTag } from 'next/cache';
import { db, dbClient } from '@database/db.ts';
import { sized, uuid } from '@database/field-values.ts';
import { constraintViolationReply } from '@database/sql-error.ts';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import type { SubmissionResult } from '@conform-to/react';
import { zodValidateForm } from '@/lib/zod/parse.ts';
import { getTimeZone } from '@/lib/get-time-zone.ts';
import { todayIn } from '@/lib/time-zone.ts';
import { cacheTags } from '@/lib/cache-tags.ts';
import { storedFiles } from '@/features/documents/services/stored-files.ts';
import { normalizeSource } from '@/features/job-applications/constants/job-sources.ts';
import { checkDocumentTypes } from '@/features/job-applications/services/check-document-types.ts';
import {
  filesOf,
  resolveJobApplicationParts,
} from '@/features/job-applications/services/resolve-job-application-parts.ts';
import { updateJobApplicationSchema } from '@/features/job-applications/schemas/update-job-application-schema.ts';

export async function updateJobApplication(
  _state: SubmissionResult | undefined,
  formData: FormData
) {
  const userId = getUserId(await verifySession());

  const timeZone = await getTimeZone();
  const submission = zodValidateForm({
    formData,
    schema: updateJobApplicationSchema(() => todayIn(timeZone)),
  });
  if (submission.status !== 'success') {
    return submission.reply();
  }

  const { id, title, postingUrl, source, appliedAt, notes, ...parts } = submission.value;
  const { countryId, cvDocumentId, coverLetterDocumentId } = parts;

  const existing = await db.JobApplication.first({ id: uuid(id) });
  if (!existing) {
    return submission.reply({ formErrors: ['Job application not found'] });
  }

  const documentTypeErrors = await checkDocumentTypes({ cvDocumentId, coverLetterDocumentId });
  if (documentTypeErrors) {
    return submission.reply({ fieldErrors: documentTypeErrors });
  }

  // What is new (an organization, the documents) is written with the application, or not at all
  let created;
  try {
    created = await storedFiles.withStored(userId, filesOf(parts), (stored) =>
      dbClient.transaction(async ({ orm }) => {
        const tx = orm.public;

        const { organizationId, cvDocumentId, coverLetterDocumentId, ...created } =
          await resolveJobApplicationParts(tx, userId, parts, stored);

        await tx.JobApplication.where({ id: uuid(id) }).update({
          title: sized<200>(title),
          postingUrl: postingUrl ?? null,
          source: source ? sized<100>(normalizeSource(source)) : null,
          appliedAt: Temporal.PlainDate.from(appliedAt),
          notes: notes ?? null,
          organizationId: uuid(organizationId),
          countryId: uuid(countryId),
          cvDocumentId: uuid(cvDocumentId),
          coverLetterDocumentId: coverLetterDocumentId ? uuid(coverLetterDocumentId) : null,
        });

        return created;
      })
    );
  } catch (error) {
    const reply = constraintViolationReply(error);
    if (reply) return submission.reply(reply);
    throw error;
  }

  updateTag(cacheTags.jobApplications(userId));
  if (created.createdOrganization) updateTag(cacheTags.organizations(userId));
  if (created.createdDocuments) updateTag(cacheTags.documents(userId));
  return submission.reply({ resetForm: true });
}
