import type { ContractHelpers } from '../types.ts';
import type { SqlTypes } from '../sql-types.ts';

export function contactModel({ model, field }: ContractHelpers, sqlTypes: SqlTypes) {
  return model('Contact', {
    fields: {
      id: field.id.uuidv7String(),
      name: field.namedType(sqlTypes.varChar150),
      email: field.namedType(sqlTypes.email).optional(),
      phone: field.namedType(sqlTypes.varChar50).optional(),
      role: field.namedType(sqlTypes.varChar100).optional(),
      jobApplicationId: field.uuidString(),
    },
  });
}
