import { JobApplication } from '@/features/job-applications/types/job-application.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import {
  GetJobApplicationsQuery,
  GetJobApplicationsQueryInput,
  getJobApplicationsQuerySchema,
} from '@/features/job-applications/schemas/get-job-applications-schema.ts';
import { Page } from '@/lib/pagination.ts';
import { Result } from '@/types/result.ts';
import { paginate } from '@database/paginate.ts';
import { zodValidate } from '@/lib/zod/parse.ts';
import { InterviewOutcome } from '@/features/job-applications/types/enums/interview-outcome.ts';
import { RoundType } from '@/features/job-applications/types/enums/round-type.ts';
import { DocumentType } from '@/features/documents/types/enums/document-type.ts';

export async function getJobApplications(
  query: GetJobApplicationsQueryInput
): Promise<Result<Page<JobApplication>>> {
  const userId = getUserId(await verifySession());

  const parsed = zodValidate(query, getJobApplicationsQuerySchema);
  if (!parsed.success) {
    return parsed;
  }

  return { success: true, data: await getJobApplicationsQuery(userId, parsed.data) };
}

async function getJobApplicationsQuery(
  userId: string,
  { page, pageSize }: GetJobApplicationsQuery
): Promise<Page<JobApplication>> {
  'use cache';
  cacheTag(
    cacheTags.jobApplications(userId),
    cacheTags.organizations(userId),
    cacheTags.documents(userId)
  );

  const filteredQuery = db.JobApplication.where({ userId: uuid(userId) });

  const modelsQuery = paginate(filteredQuery, { page, pageSize })
    .orderBy((o) => o.appliedAt.desc())
    .include('organization', (o) =>
      o.include('organizationCountries', (oc) =>
        oc.include('country').orderBy((c) => c.country.name.asc())
      )
    )
    .include('country')
    .include('cvDocument')
    .include('coverLetterDocument')
    .include('interviewRounds', (r) =>
      r.include('contacts', (rc) => rc.include('contact')).orderBy((r) => r.scheduledAt.asc())
    )
    .all();
  const [models, { totalCount }] = await Promise.all([
    modelsQuery,
    filteredQuery.aggregate((aggregate) => ({ totalCount: aggregate.count() })),
  ]);

  const jobApplications = models.map((jobApplication) => ({
    id: jobApplication.id,
    title: jobApplication.title,
    appliedAt: jobApplication.appliedAt.toString(),
    currentStatus: jobApplication.currentStatus as JobApplicationStatus,
    postingUrl: jobApplication.postingUrl,
    notes: jobApplication.notes,
    source: jobApplication.source,
    country: jobApplication.country,
    organization: {
      id: jobApplication.organization!.id,
      name: jobApplication.organization!.name,
      countries: jobApplication.organization!.organizationCountries.map((oc) => oc.country),
    },
    interviewRounds: jobApplication.interviewRounds.map((round) => ({
      id: round.id,
      roundType: round.roundType as RoundType,
      scheduledAt: round.scheduledAt,
      outcome: round.outcome as InterviewOutcome,
      notes: round.notes,
      contacts: round.contacts.map(({ contact }) => ({
        id: contact!.id,
        name: contact!.name,
        role: contact!.role,
        email: contact!.email,
        phone: contact!.phone,
      })),
    })),
    cv: {
      id: jobApplication.cvDocument.id,
      name: jobApplication.cvDocument.name,
      type: jobApplication.cvDocument.type as DocumentType,
      originalFilename: jobApplication.cvDocument.originalFilename,
      size: jobApplication.cvDocument.size,
      uploadedAt: jobApplication.cvDocument.uploadedAt,
    },
    coverLetter: jobApplication.coverLetterDocument
      ? {
          id: jobApplication.coverLetterDocument.id,
          name: jobApplication.coverLetterDocument.name,
          type: jobApplication.coverLetterDocument.type as DocumentType,
          originalFilename: jobApplication.coverLetterDocument.originalFilename,
          size: jobApplication.coverLetterDocument.size,
          uploadedAt: jobApplication.coverLetterDocument.uploadedAt,
        }
      : undefined,
  }));

  return { items: jobApplications, totalCount };
}
