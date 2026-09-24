import type { ContractHelpers } from '../types.ts';
import { ApplicationStatus } from '../enums.ts';
import type { SqlTypes } from '../sql-types.ts';

export function jobApplicationModels({ model, field }: ContractHelpers, sqlTypes: SqlTypes) {
  const JobApplication = model('JobApplication', {
    fields: {
      id: field.id.uuidv7String(),
      title: field.namedType(sqlTypes.varChar200),
      postingUrl: field.text().optional(),
      source: field.namedType(sqlTypes.varChar100).optional(),
      currentStatus: field.namedType(ApplicationStatus).default(ApplicationStatus.members.Applied),
      appliedAt: field.column({ codecId: 'pg/date-temporal@1', nativeType: 'date' }),
      notes: field.text().optional(),
      organizationId: field.uuidString(),
      cvDocumentId: field.uuidString(),
      coverLetterDocumentId: field.uuidString().optional(),
      countryId: field.uuidString(),
      userId: field.uuidString(),
      createdAt: field.temporal.createdAtString(),
      updatedAt: field.temporal.updatedAtString(),
    },
  }).sql(({ cols, constraints }) => ({
    indexes: [
      constraints.index([cols.userId], {
        name: 'idx_user_id',
      }),
    ],
  }));

  const JobApplicationHasSkill = model('JobApplicationHasSkill', {
    fields: {
      jobApplicationId: field.uuidString(),
      skillId: field.uuidString(),
    },
  }).attributes(({ fields, constraints }) => ({
    id: constraints.id([fields.jobApplicationId, fields.skillId]),
  }));

  return { JobApplication, JobApplicationHasSkill };
}
