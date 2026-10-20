import type { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

export interface RecentActivityItem {
  id: string;
  status: JobApplicationStatus;
  note: string | null;
  // An exact instant (ISO)
  changedAt: string;
  jobApplication: {
    id: string;
    title: string;
    organization: { id: string; name: string };
    country: { name: string; isoCode: string };
  };
}
