import type { ContractHelpers } from '../types.ts';
import { DocumentType } from '../enums.ts';
import type { SqlTypes } from '../sql-types.ts';

export function documentModel({ model, field }: ContractHelpers, sqlTypes: SqlTypes) {
  return model('Document', {
    fields: {
      id: field.id.uuidv7String(),
      userId: field.uuidString(),
      documentType: field.namedType(DocumentType),
      label: field.namedType(sqlTypes.varChar150),
      filePath: field.text(),
      originalFilename: field.namedType(sqlTypes.varChar255),
      notes: field.text().optional(),
      uploadedAt: field.temporal.createdAtString(),
    },
  }).sql(({ cols, constraints }) => ({
    indexes: [
      constraints.index([cols.userId, cols.documentType], {
        name: 'idx_user_id_document_type',
      }),
    ],
  }));
}
