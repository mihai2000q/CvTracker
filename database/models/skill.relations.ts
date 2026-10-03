import type { ContractHelpers, Model } from '../types.ts';

type SkillModels = {
  Skill: Model;
  User: Model;
  JobApplicationHasSkill: Model;
  DocumentHasSkill: Model;
};

export function skillRelations(
  { rel }: ContractHelpers,
  { Skill, User, JobApplicationHasSkill, DocumentHasSkill }: SkillModels
) {
  return {
    Skill: Skill.relations({
      user: rel
        .belongsTo(User, { from: 'userId', to: 'id' })
        .sql({ fk: { name: 'fk_skill_user_id', onDelete: 'cascade' } }),
      jobApplicationHasSkills: rel.hasMany(JobApplicationHasSkill, { by: 'skillId' }),
      documentHasSkills: rel.hasMany(DocumentHasSkill, { by: 'skillId' }),
    }),
  };
}
