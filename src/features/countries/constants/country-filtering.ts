import { all, and } from '@prisma/orm-postgres/orm-client';
import type { ModelAccessor } from '@prisma/orm-postgres/orm-client';
import type { Contract } from '@database/contract.d';
import { fuzzy } from '@database/filter.ts';
import { uuid } from '@database/field-values';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

export const COUNTRY_SCOPES = ['applied', 'interview', 'offer', 'all'] as const;
export type CountryScope = (typeof COUNTRY_SCOPES)[number];
export const DEFAULT_COUNTRY_SCOPE: CountryScope = 'applied';

type CountryAccessor = ModelAccessor<Contract, 'Country', 'public'>;

// The status a scope narrows the user's applications to; `applied` is any status
const SCOPE_STATUSES: Partial<Record<CountryScope, JobApplicationStatus>> = {
  interview: JobApplicationStatus.Interview,
  offer: JobApplicationStatus.Offer,
};

// The countries in the scope: those with an application of the user, in the scope's status if it
// has one, or every country
export const countryScopeWhere = (scope: CountryScope, userId: string) => {
  const status = SCOPE_STATUSES[scope];
  return scope === 'all'
    ? () => all()
    : (c: CountryAccessor) =>
        c.jobApplications.some((ja) =>
          status
            ? and(ja.userId.eq(uuid(userId)), ja.currentStatus.eq(status))
            : ja.userId.eq(uuid(userId))
        );
};

export const COUNTRY_SEARCH_COLUMNS = [
  fuzzy((c: CountryAccessor) => c.name),
  (c: CountryAccessor) => c.isoCode,
];
