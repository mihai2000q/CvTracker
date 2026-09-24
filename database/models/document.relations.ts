import type { ContractHelpers, Model } from '../types.ts';

type DocumentModels = {
  Document: Model;
  User: Model;
  JobApplication: Model;
};

export function documentRelations(
  { rel }: ContractHelpers,
  { Document, User, JobApplication }: DocumentModels
) {
  return {
    Document: Document.relations({
      user: rel
        .belongsTo(User, { from: 'userId', to: 'id' })
        .sql({ fk: { name: 'fk_document_user_id', onDelete: 'cascade' } }),
      cvForJobApplications: rel.hasMany(JobApplication, { by: 'cvDocumentId' }),
      coverLetterForJobApplications: rel.hasMany(JobApplication, { by: 'coverLetterDocumentId' }),
    }),
  };
}
