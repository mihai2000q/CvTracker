import type { ContractHelpers } from '../types.ts';
import type { SqlTypes } from '../sql-types.ts';

export function organizationModels({ model, field }: ContractHelpers, sqlTypes: SqlTypes) {
  const Organization = model('Organization', {
    fields: {
      id: field.id.uuidv7String(),
      name: field.namedType(sqlTypes.varChar200),
      notes: field.text().optional(),
      websiteUrl: field.text().optional(),
      userId: field.uuidString(),
      createdAt: field.temporal.createdAtString(),
      updatedAt: field.temporal.updatedAtString(),
    },
  }).sql(({ cols, constraints }) => ({
    indexes: [
      constraints.index([cols.userId, cols.name], {
        name: 'idx_user_id_name',
      }),
    ],
  }));

  const OrganizationCountry = model('OrganizationCountry', {
    fields: {
      organizationId: field.uuidString(),
      countryId: field.uuidString(),
    },
  })
    .attributes(({ fields, constraints }) => ({
      id: constraints.id([fields.organizationId, fields.countryId]),
    }))
    .sql(() => ({
      table: 'organization_in_country',
    }));

  return { Organization, OrganizationCountry };
}
