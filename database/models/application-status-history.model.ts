import type { ContractHelpers } from '../types.ts';
import { ApplicationStatus } from '../enums.ts';

export function applicationStatusHistoryModel({ model, field }: ContractHelpers) {
  return model('ApplicationStatusHistory', {
    fields: {
      id: field.id.uuidv7String(),
      status: field.namedType(ApplicationStatus),
      note: field.text().optional(),
      jobApplicationId: field.uuidString(),
      changedAt: field.temporal.timestamptzString(),
    },
  }).sql(({ cols, constraints }) => ({
    indexes: [
      constraints.index([cols.jobApplicationId, cols.changedAt], {
        name: 'idx_job_application_id_changed_at',
      }),
    ],
  }));
}
