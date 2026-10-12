import { Contact } from '@/features/organizations/types/contact.ts';
import { InterviewOutcome } from '@/features/job-applications/types/enums/interview-outcome.ts';
import { RoundType } from '@/features/job-applications/types/enums/round-type.ts';

export interface InterviewRound {
  id: string;
  roundType: RoundType;
  // An exact instant (ISO)
  scheduledAt: string;
  outcome: InterviewOutcome;
  notes: string | null;
  contacts: Contact[];
}
