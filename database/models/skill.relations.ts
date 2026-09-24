import type { ContractHelpers, Model } from '../types.ts';

type SkillModels = {
  Skill: Model;
  User: Model;
  JobApplicationHasSkill: Model;
};

export function skillRelations(
  { rel }: ContractHelpers,
  { Skill, User, JobApplicationHasSkill }: SkillModels
) {
  return {
    Skill: Skill.relations({
      user: rel
        .belongsTo(User, { from: 'userId', to: 'id' })
        .sql({ fk: { name: 'fk_skill_user_id', onDelete: 'cascade' } }),
      jobApplicationTags: rel.hasMany(JobApplicationHasSkill, { by: 'skillId' }),
    }),
  };
}
