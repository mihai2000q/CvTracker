import 'server-only';
import { db } from '@database/db.ts';
import { DocumentType as DbDocumentType } from '@database/enums.ts';
import { uuid } from '@database/field-values.ts';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import { JobApplicationFiltersMetadata } from '@/features/job-applications/types/job-application-filters-metadata.ts';

export async function getJobApplicationFiltersMetadata(): Promise<JobApplicationFiltersMetadata> {
  const userId = getUserId(await verifySession());
  return getJobApplicationFiltersMetadataQuery(userId);
}

async function getJobApplicationFiltersMetadataQuery(
  userId: string
): Promise<JobApplicationFiltersMetadata> {
  'use cache';
  cacheTag(
    cacheTags.jobApplications(userId),
    cacheTags.organizations(userId),
    cacheTags.documents(userId)
  );

  const [organizations, countries, cvs] = await Promise.all([
    db.Organization.where({ userId: uuid(userId) })
      .orderBy((o) => o.name.asc())
      .all(),
    db.Country.where((c) => c.jobApplications.some((ja) => ja.userId.eq(uuid(userId))))
      .orderBy((c) => c.name.asc())
      .all(),
    db.Document.where({ userId: uuid(userId), type: DbDocumentType.members.Cv })
      .orderBy((d) => d.name.asc())
      .all(),
  ]);

  return {
    organizations: organizations.map(({ id, name }) => ({ id, name })),
    countries: countries.map(({ id, name, isoCode }) => ({ id, name, isoCode })),
    cvs: cvs.map(({ id, name }) => ({ id, name })),
  };
}
