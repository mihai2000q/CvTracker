'use server';

import { db, type Database } from '@database/db.ts';
import { sized, uuid } from '@database/field-values.ts';
import { constraintViolationReply } from '@database/sql-error.ts';
import { DocumentType as DbDocumentType } from '@database/enums.ts';
import { initialStatusHistory } from '@/features/job-applications/lifecycle/initial-status.ts';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { createJobApplicationSchema } from '@/features/job-applications/schemas/create-job-application-schema.ts';
import type { SubmissionResult } from '@conform-to/react';
import { zodValidateForm } from '@/lib/zod/parse.ts';
import { getTimeZone } from '@/lib/get-time-zone.ts';
import { todayIn } from '@/lib/time-zone.ts';
import { Temporal } from 'temporal-polyfill';
import { updateTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import { StoredDocument, storeDocument } from '@/features/documents/services/store-document.ts';
import { checkDocumentTypes } from '@/features/job-applications/services/check-document-types.ts';
import { normalizeSource } from '@/features/job-applications/constants/job-sources.ts';

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

  const {
    title,
    organizationName,
    organizationId,
    countryId,
    cvDocumentId,
    coverLetterDocumentId,
    cvDocumentFile,
    coverLetterDocumentFile,
    postingUrl,
    source,
    appliedAt,
    notes,
    skillIds,
  } = submission.value;

  const documentTypeErrors = await checkDocumentTypes({ cvDocumentId, coverLetterDocumentId });
  if (documentTypeErrors) {
    return submission.reply({ fieldErrors: documentTypeErrors });
  }

  let storedCv: StoredDocument | undefined;
  let storedCoverLetter: StoredDocument | undefined;

  try {
    if (cvDocumentFile) storedCv = await storeDocument(userId, cvDocumentFile);
    if (coverLetterDocumentFile) {
      storedCoverLetter = await storeDocument(userId, coverLetterDocumentFile);
    }

    await db.JobApplication.create({
      title: sized<200>(title),
      countryId: uuid(countryId),
      postingUrl,
      source: source ? sized<100>(normalizeSource(source)) : undefined,
      appliedAt: Temporal.PlainDate.from(appliedAt),
      notes,
      userId: uuid(userId),
      skills: (skills) => skills.create(skillIds.map((skillId) => ({ skillId: uuid(skillId) }))),
      statusHistory: initialStatusHistory,
      ...(organizationId
        ? { organizationId: uuid(organizationId) }
        : { organization: createNewOrganization(organizationName, countryId, userId) }),
      ...(storedCv
        ? { cvDocument: createNewCv(storedCv, userId, skillIds) }
        : { cvDocumentId: uuid(cvDocumentId!) }),
      ...(storedCoverLetter
        ? { coverLetterDocument: createNewCoverLetter(storedCoverLetter, userId, skillIds) }
        : {
            coverLetterDocumentId: coverLetterDocumentId ? uuid(coverLetterDocumentId) : undefined,
          }),
    });
  } catch (error) {
    // Don't leave orphaned files behind if the rows couldn't be written
    await Promise.all([storedCv?.discard(), storedCoverLetter?.discard()]);
    const reply = constraintViolationReply(error);
    if (reply) return submission.reply(reply);
    throw error;
  }

  updateTag(cacheTags.jobApplications(userId));
  if (!organizationId) updateTag(cacheTags.organizations(userId));
  if (cvDocumentFile || coverLetterDocumentFile) updateTag(cacheTags.documents(userId));
  return submission.reply({ resetForm: true });
}

type DocumentInput = Parameters<Database['Document']['create']>[0];
type JobApplicationInput = Parameters<Database['JobApplication']['create']>[0];
type NewRelation<Key extends 'organization' | 'cvDocument' | 'coverLetterDocument'> = Extract<
  NonNullable<JobApplicationInput[Key]>,
  (...args: never[]) => unknown
>;

// New organization, located in the same country as the application
function createNewOrganization(
  name: string,
  countryId: string,
  userId: string
): NewRelation<'organization'> {
  return (organization) =>
    organization.create({
      name: sized<200>(name),
      organizationCountries: (organizationCountries) =>
        organizationCountries.create([{ countryId: uuid(countryId) }]),
      userId: uuid(userId),
    });
}

function createNewCv(
  stored: StoredDocument,
  userId: string,
  skillIds: string[]
): NewRelation<'cvDocument'> {
  return (cv) =>
    cv.create({
      ...newDocumentData(DbDocumentType.members.Cv, stored, skillIds, userId),
    });
}

function createNewCoverLetter(
  stored: StoredDocument,
  userId: string,
  skillIds: string[]
): NewRelation<'coverLetterDocument'> {
  return (coverLetter) =>
    coverLetter.create({
      ...newDocumentData(DbDocumentType.members.CoverLetter, stored, skillIds, userId),
    });
}

// A document uploaded along with the application is named after its file and shares its skills
function newDocumentData(
  type: (typeof DbDocumentType.members)[keyof typeof DbDocumentType.members],
  stored: StoredDocument,
  skillIds: string[],
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
    skills: (skills) => skills.create(skillIds.map((skillId) => ({ skillId: uuid(skillId) }))),
  };
}
