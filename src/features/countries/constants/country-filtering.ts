import type { ModelAccessor } from '@prisma/orm-postgres/orm-client';
import type { Contract } from '@database/contract.d';

export const COUNTRY_SCOPES = ['applied', 'all'] as const;
export type CountryScope = (typeof COUNTRY_SCOPES)[number];
export const DEFAULT_COUNTRY_SCOPE: CountryScope = 'applied';

type CountryAccessor = ModelAccessor<Contract, 'Country', 'public'>;

export const COUNTRY_SEARCH_COLUMNS = [
  (c: CountryAccessor) => c.name,
  (c: CountryAccessor) => c.isoCode,
];
