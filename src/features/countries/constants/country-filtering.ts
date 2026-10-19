import { all } from '@prisma/orm-postgres/orm-client';
import type { ModelAccessor } from '@prisma/orm-postgres/orm-client';
import type { Contract } from '@database/contract.d';
import { fuzzy } from '@database/filter.ts';
import { uuid } from '@database/field-values';

export const COUNTRY_SCOPES = ['applied', 'all'] as const;
export type CountryScope = (typeof COUNTRY_SCOPES)[number];
export const DEFAULT_COUNTRY_SCOPE: CountryScope = 'applied';

type CountryAccessor = ModelAccessor<Contract, 'Country', 'public'>;

// The countries in the scope: those with an application of the user, in any status, or every country
export const countryScopeWhere = (scope: CountryScope, userId: string) =>
  scope === 'all'
    ? () => all()
    : (c: CountryAccessor) => c.jobApplications.some((ja) => ja.userId.eq(uuid(userId)));

export const COUNTRY_SEARCH_COLUMNS = [
  fuzzy((c: CountryAccessor) => c.name),
  (c: CountryAccessor) => c.isoCode,
];
