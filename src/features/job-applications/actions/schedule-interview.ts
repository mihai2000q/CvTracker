'use server';

import { db, dbClient } from '@database/db';
import { sized, uuid } from '@database/field-values';
import { isForeignKeyConstraintError } from '@database/sql-error';
import { getUserId, verifySession } from '@/lib/auth/session';
import type { SubmissionResult } from '@conform-to/react';
import { STATUSES_BEFORE_INTERVIEW } from '@/features/job-applications/constants/job-application-statuses.ts';
import { zodValidateForm } from '@/lib/zod/parse.ts';
import { updateTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import { scheduleInterviewSchema } from '@/features/job-applications/schemas/schedule-interview-schema.ts';
import { ContactForm } from '@/features/organizations/schemas/contact-schema.ts';
import { recordStatusChange } from '@/features/job-applications/services/record-status-change.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import { MODEL_ROUND_TYPES } from '@/features/job-applications/types/enums/model-round-type.ts';

export async function scheduleInterview(_state: SubmissionResult | undefined, formData: FormData) {
  const userId = getUserId(await verifySession());

  const submission = zodValidateForm({ formData, schema: scheduleInterviewSchema });
  if (submission.status !== 'success') {
    return submission.reply();
  }

  const { jobApplicationId, roundType, scheduledAt, contactIds, newContact, notes } =
    submission.value;

  // Its status and organization decide the status change and where a new contact goes
  const jobApplication = await db.JobApplication.first({ id: uuid(jobApplicationId) });
  if (!jobApplication) {
    return submission.reply({ formErrors: ['Job application not found'] });
  }

  try {
    await dbClient.transaction(async ({ orm }) => {
      const tx = orm.public;

      await tx.InterviewRound.create({
        jobApplicationId: uuid(jobApplicationId),
        roundType: MODEL_ROUND_TYPES[roundType],
        scheduledAt,
        notes,
        // Each contact of the round is an id, or a new one created here
        contacts: (roundContacts) =>
          roundContacts.create([
            ...[...new Set(contactIds)].map((contactId) => ({ contactId: uuid(contactId) })),
            ...(newContact
              ? [{ contact: createNewContact(newContact, jobApplication.organizationId) }]
              : []),
          ]),
      });

      const moveToInterview = STATUSES_BEFORE_INTERVIEW.includes(jobApplication.currentStatus);
      if (!moveToInterview) return;
      await recordStatusChange(tx, [jobApplicationId], JobApplicationStatus.Interview);
    });
  } catch (error) {
    if (isForeignKeyConstraintError(error)) {
      return submission.reply({ formErrors: ['One of the selected contacts no longer exists.'] });
    }
    throw error;
  }

  updateTag(cacheTags.jobApplications(userId));
  if (newContact) updateTag(cacheTags.contacts(jobApplication.organizationId));
  return submission.reply({ resetForm: true });
}

type JoinInput = Parameters<typeof db.InterviewRoundHasContact.create>[0];
type NewContactRelation = Extract<NonNullable<JoinInput['contact']>, (...args: never[]) => unknown>;

function createNewContact(
  { name, email, phone, role }: ContactForm,
  organizationId: string
): NewContactRelation {
  return (contact) =>
    contact.create({
      name: sized<150>(name),
      email: email ? sized<255>(email) : undefined,
      phone: phone ? sized<50>(phone) : undefined,
      role: role ? sized<100>(role) : undefined,
      organizationId: uuid(organizationId),
    });
}
