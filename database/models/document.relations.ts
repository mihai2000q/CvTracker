import type { ContractHelpers, Model } from '../types.ts';

type DocumentModels = {
  Document: Model;
  User: Model;
  JobApplication: Model;
  Skill: Model;
  DocumentHasSkill: Model;
};

export function documentRelations(
  { rel }: ContractHelpers,
  { Document, User, JobApplication, Skill, DocumentHasSkill }: DocumentModels
) {
  return {
    Document: Document.relations({
      user: rel
        .belongsTo(User, { from: 'userId', to: 'id' })
        .sql({ fk: { name: 'fk_document_user_id', onDelete: 'cascade' } }),
      cvForJobApplications: rel.hasMany(JobApplication, { by: 'cvDocumentId' }),
      coverLetterForJobApplications: rel.hasMany(JobApplication, { by: 'coverLetterDocumentId' }),
      skills: rel.hasMany(DocumentHasSkill, { by: 'documentId' }),
    }),
    DocumentHasSkill: DocumentHasSkill.relations({
      document: rel
        .belongsTo(Document, { from: 'documentId', to: 'id' })
        .sql({ fk: { name: 'fk_document_has_skill_document_id', onDelete: 'cascade' } }),
      skill: rel
        .belongsTo(Skill, { from: 'skillId', to: 'id' })
        .sql({ fk: { name: 'fk_document_has_skill_skill_id', onDelete: 'cascade' } }),
    }),
  };
}
