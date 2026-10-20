import type { RoundType } from '@/features/job-applications/types/enums/round-type.ts';

export interface UpcomingInterview {
  id: string;
  roundType: RoundType;
  // An exact instant (ISO)
  scheduledAt: string;
  jobApplication: {
    id: string;
    title: string;
    organization: { id: string; name: string };
    country: { name: string; isoCode: string };
  };
}
