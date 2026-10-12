import { enumType, member } from '@prisma/orm-postgres/contract-builder';

const pgText = { codecId: 'pg/text@1', nativeType: 'text' } as const;

export const DocumentType = enumType(
  'DocumentType',
  pgText,
  member('Cv', 'cv'),
  member('CoverLetter', 'cover_letter')
);

export const ApplicationStatus = enumType(
  'ApplicationStatus',
  pgText,
  member('Applied', 'applied'),
  member('Screening', 'screening'),
  member('Interview', 'interview'),
  member('Offer', 'offer'),
  member('Rejected', 'rejected'),
  member('Withdrawn', 'withdrawn'),
  member('NoResponse', 'no_response')
);

export const InterviewOutcome = enumType(
  'InterviewOutcome',
  pgText,
  member('Scheduled', 'scheduled'),
  member('Passed', 'passed'),
  member('Failed', 'failed'),
  member('Cancelled', 'cancelled')
);

export const RoundType = enumType(
  'RoundType',
  pgText,
  member('IntroCall', 'intro_call'),
  member('Technical', 'technical'),
  member('Coding', 'coding'),
  member('TakeHome', 'take_home'),
  member('Behavioral', 'behavioral')
);
