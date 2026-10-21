import { InterviewOutcome } from '@/features/job-applications/types/enums/interview-outcome.ts';

// Upcoming: still Scheduled, and strictly yet to take place. A round that was settled by hand or
// by a decision on the application is not, even when its date has not come.
// This is the one definition: the database side only has to ask for the same time condition
export const isUpcoming = (round: { outcome: string; scheduledAt: string }, now: Date) =>
  round.outcome === InterviewOutcome.Scheduled && new Date(round.scheduledAt) > now;

// The time condition of Upcoming for a database query, to go with the Scheduled outcome filter
export const startsAfter =
  (now: Date) =>
  <Condition>(round: { scheduledAt: { gt(value: string): Condition } }) =>
    round.scheduledAt.gt(now.toISOString());
