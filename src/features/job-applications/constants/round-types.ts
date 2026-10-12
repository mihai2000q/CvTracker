import { RoundType } from '@/features/job-applications/types/enums/round-type.ts';

export const ROUND_TYPE_LABELS: Record<RoundType, string> = {
  [RoundType.IntroCall]: 'Intro call',
  [RoundType.Technical]: 'Technical',
  [RoundType.Coding]: 'Coding',
  [RoundType.TakeHome]: 'Take-home assignment',
  [RoundType.Behavioral]: 'Behavioral',
};
