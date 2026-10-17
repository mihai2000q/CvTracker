import { INTERVIEW_OUTCOME_LABELS } from '@/features/job-applications/constants/interview-outcomes.ts';
import { InterviewOutcome } from '@/features/job-applications/types/enums/interview-outcome.ts';
import { ROUND_TYPE_LABELS } from '@/features/job-applications/constants/round-types.ts';
import { RoundType } from '@/features/job-applications/types/enums/round-type.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

export const JOB_APPLICATION_STATUSES: Record<JobApplicationStatus, string> = {
  [JobApplicationStatus.Applied]: 'Applied',
  [JobApplicationStatus.Screening]: 'Screening',
  [JobApplicationStatus.Interview]: 'Interview',
  [JobApplicationStatus.Offer]: 'Offer',
  [JobApplicationStatus.Withdrawn]: 'Withdrawn',
  [JobApplicationStatus.Rejected]: 'Rejected',
  [JobApplicationStatus.NoResponse]: 'Ghosted',
};

// How far along an application is, what sorting by status ranks by: the pipeline first, then
// the ways it closes, in the order of the tabs
export const JOB_APPLICATION_STATUS_ORDER: readonly JobApplicationStatus[] = [
  JobApplicationStatus.Applied,
  JobApplicationStatus.Screening,
  JobApplicationStatus.Interview,
  JobApplicationStatus.Offer,
  JobApplicationStatus.Withdrawn,
  JobApplicationStatus.Rejected,
  JobApplicationStatus.NoResponse,
];

// Scheduling an interview moves an application in one of these to Interview. Anywhere else
// (already interviewing, an offer, or closed by a rejection, a withdrawal or silence) the
// status is a decision of its own and stays
export const STATUSES_BEFORE_INTERVIEW: readonly string[] = [
  JobApplicationStatus.Applied,
  JobApplicationStatus.Screening,
];

// Moving an application to one of these ends it from the candidate's side or the silence of the
// company: the interview rounds that were still to take place won't
export const STATUSES_THAT_CANCEL_UPCOMING_ROUNDS: readonly string[] = [
  JobApplicationStatus.Withdrawn,
  JobApplicationStatus.NoResponse,
];

// An application still in progress, which a failed interview round can end
export const IN_PROGRESS_STATUSES: readonly string[] = [
  JobApplicationStatus.Applied,
  JobApplicationStatus.Screening,
  JobApplicationStatus.Interview,
];

// What a move to a status did to the interview rounds
export interface StatusChangeEffect {
  // The next round, given the outcome the decision means: failed by a rejection,
  // passed by an offer
  settledRound: { roundType: RoundType; outcome: InterviewOutcome } | null;
  cancelledRounds: number;
}

// What a toast says of a move to a status: its name, and what happened to the rounds with it
export const describeStatusChange = (
  status: JobApplicationStatus,
  { settledRound, cancelledRounds }: StatusChangeEffect
) =>
  [
    JOB_APPLICATION_STATUSES[status],
    settledRound &&
      `${ROUND_TYPE_LABELS[settledRound.roundType]} round marked ${INTERVIEW_OUTCOME_LABELS[settledRound.outcome]}`,
    cancelledRounds > 0 &&
      `${cancelledRounds} upcoming ${cancelledRounds === 1 ? 'round' : 'rounds'} cancelled`,
  ]
    .filter(Boolean)
    .join(' · ');

export const NO_STATUS_CHANGE_EFFECT: StatusChangeEffect = {
  settledRound: null,
  cancelledRounds: 0,
};
