import { Organization } from '@/features/organizations/types/organization.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values';
import { getUserId, verifySession } from '@/lib/auth/session.ts';

export async function getOrganizations(): Promise<Organization[]> {
  const session = await verifySession();
  const userId = getUserId(session);

  const organizations = await db.Organization.where({ userId: uuid(userId) })
    .orderBy((o) => o.createdAt.desc())
    .include('organizationCountries', (oc) => oc.include('country'))
    .include('jobApplications', (jobApplications) =>
      jobApplications.combine({
        items: jobApplications
          .select('id', 'title', 'currentStatus', 'appliedAt')
          .orderBy((j) => j.appliedAt.desc()),
        lastActivityAt: jobApplications.max('updatedAt'),
      })
    )
    .all();

  return organizations.map((organization) => ({
    id: organization.id,
    name: organization.name,
    websiteUrl: organization.websiteUrl,
    notes: organization.notes,
    countries: organization.organizationCountries.map(({ country }) => ({ ...country })),
    jobApplications: organization.jobApplications.items.map((jobApplication) => ({
      ...jobApplication,
      currentStatus: jobApplication.currentStatus as JobApplicationStatus,
      appliedAt: jobApplication.appliedAt.toString(),
    })),
    lastActivityAt: organization.jobApplications.lastActivityAt ?? organization.updatedAt,
  }));
}
