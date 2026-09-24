import type { ContractHelpers, Model } from '../types.ts';

type OrganizationModels = {
  Organization: Model;
  User: Model;
  Country: Model;
  OrganizationCountry: Model;
};

export function organizationRelations(
  { rel }: ContractHelpers,
  { Organization, User, Country, OrganizationCountry }: OrganizationModels
) {
  return {
    Organization: Organization.relations({
      organizationCountries: rel.hasMany(OrganizationCountry, { by: 'organizationId' }),
      user: rel
        .belongsTo(User, { from: 'userId', to: 'id' })
        .sql({ fk: { name: 'fk_organization_user_id', onDelete: 'cascade' } }),
    }),
    OrganizationCountry: OrganizationCountry.relations({
      organization: rel
        .belongsTo(Organization, { from: 'organizationId', to: 'id' })
        .sql({ fk: { name: 'fk_organization_in_country_organization_id', onDelete: 'cascade' } }),
      country: rel
        .belongsTo(Country, { from: 'countryId', to: 'id' })
        .sql({ fk: { name: 'fk_organization_in_country_country_id', onDelete: 'restrict' } }),
    }),
  };
}
