import { z } from 'zod';
import { not } from '@prisma/orm-postgres/orm-client';
import type { ModelAccessor } from '@prisma/orm-postgres/orm-client';
import type { Contract } from '@database/contract.d';
import { uuid } from '@database/field-values';

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
};
export type OrganizationFilterField = keyof typeof ORGANIZATION_FILTERS;

export const ORGANIZATION_SEARCH_COLUMNS = [(o: OrganizationAccessor) => o.name];
