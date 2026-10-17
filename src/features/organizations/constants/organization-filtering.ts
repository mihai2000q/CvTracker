import { z } from 'zod';
import { not } from '@prisma/orm-postgres/orm-client';
import type { ModelAccessor } from '@prisma/orm-postgres/orm-client';
import type { Contract } from '@database/contract.d';
import { fuzzy } from '@database/filter.ts';
import { uuid } from '@database/field-values';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

type OrganizationAccessor = ModelAccessor<Contract, 'Organization', 'public'>;

// What an organization can be filtered by, with the shape of each value. An organization is in
// several countries, so `country` is not a column of it: its comparisons say whether any of
// its countries satisfies them, through the `column` that the filter gives.
export const ORGANIZATION_FILTERS = {
  country: {
    value: z.uuid(),
    column: (o: OrganizationAccessor) => {
      const inCountry = (id: string) =>
        o.organizationCountries.some((oc) => oc.countryId.eq(uuid(id)));
      const inAnyOf = (ids: string[]) =>
        o.organizationCountries.some((oc) => oc.countryId.in(ids.map(uuid)));
      return {
        eq: inCountry,
        neq: (id: string) => not(inCountry(id)),
        in: inAnyOf,
        notIn: (ids: string[]) => not(inAnyOf(ids)),
      };
    },
  },
  // An organization has the status when any of its applications does. The applications it shows
  // are filtered by the same entries.
  status: {
    value: z.enum(JobApplicationStatus),
    column: (o: OrganizationAccessor) => {
      const hasStatus = (status: JobApplicationStatus) =>
        o.jobApplications.some((j) => j.currentStatus.eq(status));
      const hasAnyOf = (statuses: JobApplicationStatus[]) =>
        o.jobApplications.some((j) => j.currentStatus.in(statuses));
      return {
        eq: hasStatus,
        neq: (status: JobApplicationStatus) => not(hasStatus(status)),
        in: hasAnyOf,
        notIn: (statuses: JobApplicationStatus[]) => not(hasAnyOf(statuses)),
      };
    },
  },
};
export type OrganizationFilterField = keyof typeof ORGANIZATION_FILTERS;

export const ORGANIZATION_SEARCH_COLUMNS = [fuzzy((o: OrganizationAccessor) => o.name)];
