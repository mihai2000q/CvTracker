import type { ContractHelpers } from '../types.ts';
import { ApplicationStatus } from '../enums.ts';

export function applicationStatusHistoryModel({ model, field }: ContractHelpers) {
  return model('ApplicationStatusHistory', {
    fields: {
      id: field.id.uuidv7String(),
      jobApplicationId: field.uuidString(),
      status: field.namedType(ApplicationStatus),
      changedAt: field.temporal.timestamptzString(),
      note: field.text().optional(),
    },
  }).sql(({ cols, constraints }) => ({
    indexes: [
      constraints.index([cols.jobApplicationId, cols.changedAt], {
        name: 'idx_job_application_id_changed_at',
      }),
    ],
  }));
}
