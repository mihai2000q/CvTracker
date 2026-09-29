import type { ContractHelpers, Model } from '../types.ts';

type CountryModels = {
  Country: Model;
  JobApplication: Model;
  OrganizationCountry: Model;
};

export function countryRelations(
  { rel }: ContractHelpers,
  { Country, JobApplication, OrganizationCountry }: CountryModels
) {
  return {
    Country: Country.relations({
      jobApplications: rel.hasMany(JobApplication, { by: 'countryId' }),
      organizationCountries: rel.hasMany(OrganizationCountry, { by: 'countryId' }),
    }),
  };
}
