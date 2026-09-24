import type { ContractHelpers } from '../types.ts';
import type { SqlTypes } from '../sql-types.ts';

export function skillModel({ model, field }: ContractHelpers, sqlTypes: SqlTypes) {
  return model('Skill', {
    fields: {
      id: field.id.uuidv7String(),
      name: field.namedType(sqlTypes.varChar100),
      userId: field.uuidString(),
    },
  }).attributes(({ fields, constraints }) => ({
    uniques: [constraints.unique([fields.userId, fields.name], { name: 'uq_skill_user_id_name' })],
  }));
}
