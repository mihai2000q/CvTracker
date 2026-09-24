import type { ContractHelpers, Model } from '../types.ts';

type UserModels = {
  User: Model;
  Organization: Model;
  Document: Model;
  Skill: Model;
  JobApplication: Model;
};

export function userRelations(
  { rel }: ContractHelpers,
  { User, Organization, Document, Skill, JobApplication }: UserModels
) {
  return {
    User: User.relations({
      organizations: rel.hasMany(Organization, { by: 'userId' }),
      documents: rel.hasMany(Document, { by: 'userId' }),
      skills: rel.hasMany(Skill, { by: 'userId' }),
      jobApplications: rel.hasMany(JobApplication, { by: 'userId' }),
    }),
  };
}
