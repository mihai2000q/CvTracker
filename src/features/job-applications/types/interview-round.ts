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

// Upcoming: still Scheduled, and yet to take place. A round that was settled by hand or by a
// decision on the application is not, even when its date has not come
export const isUpcoming = (round: InterviewRound, now: Date) =>
  round.outcome === InterviewOutcome.Scheduled && new Date(round.scheduledAt) >= now;

export const toInterviewRound = (
  row: Omit<InterviewRound, 'roundType' | 'outcome' | 'contacts'> & {
    roundType: string;
    outcome: string;
    contacts: { contact: Contact }[];
  }
): InterviewRound => ({
  id: row.id,
  roundType: row.roundType as RoundType,
  scheduledAt: row.scheduledAt,
  outcome: row.outcome as InterviewOutcome,
  notes: row.notes,
  contacts: row.contacts.map(({ contact }) => ({
    id: contact.id,
    name: contact.name,
    role: contact.role,
    email: contact.email,
    phone: contact.phone,
  })),
});
