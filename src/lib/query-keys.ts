export const queryKeys = {
  countries: ['countries'] as const,
  countrySearch: (search: string) => [...queryKeys.countries, search] as const,
  organizations: ['organizations'] as const,
  organizationSearch: (search: string) => [...queryKeys.organizations, search] as const,
};
