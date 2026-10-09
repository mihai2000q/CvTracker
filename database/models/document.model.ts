import type { ContractHelpers } from '../types.ts';
import { DocumentType } from '../enums.ts';
import type { SqlTypes } from '../sql-types.ts';

export function documentModels({ model, field }: ContractHelpers, sqlTypes: SqlTypes) {
  const Document = model('Document', {
    fields: {
      id: field.id.uuidv7String(),
      type: field.namedType(DocumentType),
      name: field.namedType(sqlTypes.varChar150),
      filePath: field.text(),
      originalFilename: field.namedType(sqlTypes.varChar255),
      size: field.column({ codecId: 'pg/int4@1', nativeType: 'int4' }), // bytes
      notes: field.text().optional(),
      userId: field.uuidString(),
      uploadedAt: field.temporal.createdAtString(),
    },
  }).sql(({ cols, constraints }) => ({
    indexes: [
      constraints.index([cols.userId, cols.type], {
        name: 'idx_user_id_document_type',
      }),
    ],
  }));

  const DocumentHasSkill = model('DocumentHasSkill', {
    fields: {
      documentId: field.uuidString(),
      skillId: field.uuidString(),
    },
  }).attributes(({ fields, constraints }) => ({
    id: constraints.id([fields.documentId, fields.skillId]),
  }));

  return { Document, DocumentHasSkill };
}
