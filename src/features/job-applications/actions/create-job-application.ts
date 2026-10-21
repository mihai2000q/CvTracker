'use server';

import { Temporal } from 'temporal-polyfill';
import { dbClient, type Database } from '@database/db.ts';
import { sized, uuid } from '@database/field-values.ts';
import { ApplicationStatus } from '@database/enums.ts';
import { constraintViolationReply } from '@database/sql-error.ts';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { createJobApplicationSchema } from '@/features/job-applications/schemas/create-job-application-schema.ts';
import type { SubmissionResult } from '@conform-to/react';
import { zodValidateForm } from '@/lib/zod/parse.ts';
import { getTimeZone } from '@/lib/get-time-zone.ts';
import { todayIn } from '@/lib/time-zone.ts';
import { updateTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import { storedFiles } from '@/features/documents/services/stored-files.ts';
import { normalizeSource } from '@/features/job-applications/constants/job-sources.ts';
import { checkDocumentTypes } from '@/features/job-applications/services/check-document-types.ts';
import {
  filesOf,
  resolveJobApplicationParts,
} from '@/features/job-applications/services/resolve-job-application-parts.ts';

export async function createJobApplication(
  _state: SubmissionResult | undefined,
  formData: FormData
) {
  const session = await verifySession();
  const userId = getUserId(session);

  const timeZone = await getTimeZone();
  const submission = zodValidateForm({
    formData,
    schema: createJobApplicationSchema(() => todayIn(timeZone)),
  });
  if (submission.status !== 'success') {
    return submission.reply();
  }

  const { title, postingUrl, source, appliedAt, notes, skillIds, ...parts } = submission.value;
  const { countryId, cvDocumentId, coverLetterDocumentId } = parts;

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
          await resolveJobApplicationParts(tx, userId, parts, stored, skillIds);

        await tx.JobApplication.create({
          title: sized<200>(title),
          countryId: uuid(countryId),
          postingUrl,
          source: source ? sized<100>(normalizeSource(source)) : undefined,
          appliedAt: Temporal.PlainDate.from(appliedAt),
          notes,
          userId: uuid(userId),
          skills: (skills) =>
            skills.create(skillIds.map((skillId) => ({ skillId: uuid(skillId) }))),
          statusHistory: initialStatusHistory,
          organizationId: uuid(organizationId),
          cvDocumentId: uuid(cvDocumentId),
          coverLetterDocumentId: coverLetterDocumentId ? uuid(coverLetterDocumentId) : undefined,
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

type JobApplicationInput = Parameters<Database['JobApplication']['create']>[0];
type StatusHistoryRelation = Extract<
  NonNullable<JobApplicationInput['statusHistory']>,
  (...args: never[]) => unknown
>;

// The first entry of the status history of an application that is being created, which starts as
// Applied. It goes in the same write as the application, so the two never part
const initialStatusHistory: StatusHistoryRelation = (statusHistory) =>
  statusHistory.create({
    status: ApplicationStatus.members.Applied,
    changedAt: new Date().toISOString(),
  });
