import type { ContractHelpers } from '../types.ts';
import type { SqlTypes } from '../sql-types.ts';

export function countryModel({ model, field }: ContractHelpers, sqlTypes: SqlTypes) {
  return model('Country', {
    fields: {
      id: field.id.uuidv7String(),
      isoCode: field.namedType(sqlTypes.isoCode).unique(),
      name: field.namedType(sqlTypes.varChar100),
    },
  });
}
