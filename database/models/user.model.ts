import type { ContractHelpers } from '../types.ts';
import type { SqlTypes } from '../sql-types.ts';

export function userModel({ model, field }: ContractHelpers, sqlTypes: SqlTypes) {
  return model('User', {
    fields: {
      id: field.id.uuidv7String(),
      email: field.namedType(sqlTypes.email).unique(),
      name: field.namedType(sqlTypes.varChar150),
      passwordHash: field.text(),
      createdAt: field.temporal.createdAtString(),
      updatedAt: field.temporal.updatedAtString(),
    },
  });
}
