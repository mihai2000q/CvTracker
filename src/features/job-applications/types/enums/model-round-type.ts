import 'server-only';
import { RoundType as ModelRoundType } from '@database/enums.ts';
import { RoundType } from '@/features/job-applications/types/enums/round-type.ts';

// The round types as the model has them, for what writes one. It stays out of the enum's own file
// because that one is imported by client components, and the model's enums would come with it
export const MODEL_ROUND_TYPES = {
  [RoundType.IntroCall]: ModelRoundType.members.IntroCall,
  [RoundType.Technical]: ModelRoundType.members.Technical,
  [RoundType.Coding]: ModelRoundType.members.Coding,
  [RoundType.TakeHome]: ModelRoundType.members.TakeHome,
  [RoundType.Behavioral]: ModelRoundType.members.Behavioral,
};
