import type { ContractHelpers, Model } from '../types.ts';

type JobApplicationModels = {
  JobApplication: Model;
  Organization: Model;
  Document: Model;
  Country: Model;
  User: Model;
  Skill: Model;
  ApplicationStatusHistory: Model;
  Contact: Model;
  InterviewRound: Model;
  InterviewRoundHasContact: Model;
  JobApplicationHasSkill: Model;
};

export function jobApplicationRelations(
  { rel }: ContractHelpers,
  {
    JobApplication,
    Organization,
    Document,
    Country,
    User,
    Skill,
    ApplicationStatusHistory,
    Contact,
    InterviewRound,
    InterviewRoundHasContact,
    JobApplicationHasSkill,
  }: JobApplicationModels
) {
  return {
    JobApplication: JobApplication.relations({
      organization: rel
        .belongsTo(Organization, { from: 'organizationId', to: 'id' })
        .sql({ fk: { name: 'fk_job_application_organization_id', onDelete: 'restrict' } }),
      cvDocument: rel
        .belongsTo(Document, { from: 'cvDocumentId', to: 'id' })
        .sql({ fk: { name: 'fk_job_application_cv_document_id', onDelete: 'restrict' } }),
      coverLetterDocument: rel
        .belongsTo(Document, { from: 'coverLetterDocumentId', to: 'id', optional: true })
        .sql({ fk: { name: 'fk_job_application_cover_letter_document_id', onDelete: 'restrict' } }),
      country: rel
        .belongsTo(Country, { from: 'countryId', to: 'id' })
        .sql({ fk: { name: 'fk_job_application_country_id', onDelete: 'restrict' } }),
      user: rel
        .belongsTo(User, { from: 'userId', to: 'id' })
        .sql({ fk: { name: 'fk_job_application_user_id', onDelete: 'cascade' } }),
      statusHistory: rel.hasMany(ApplicationStatusHistory, { by: 'jobApplicationId' }),
      contacts: rel.hasMany(Contact, { by: 'jobApplicationId' }),
      interviewRounds: rel.hasMany(InterviewRound, { by: 'jobApplicationId' }),
      skills: rel.hasMany(JobApplicationHasSkill, { by: 'jobApplicationId' }),
    }),
    ApplicationStatusHistory: ApplicationStatusHistory.relations({
      jobApplication: rel.belongsTo(JobApplication, { from: 'jobApplicationId', to: 'id' }).sql({
        fk: { name: 'fk_application_status_history_job_application_id', onDelete: 'cascade' },
      }),
    }),
    Contact: Contact.relations({
      jobApplication: rel
        .belongsTo(JobApplication, { from: 'jobApplicationId', to: 'id' })
        .sql({ fk: { name: 'fk_contact_job_application_id', onDelete: 'cascade' } }),
      interviewRounds: rel.hasMany(InterviewRoundHasContact, { by: 'contactId' }),
    }),
    InterviewRound: InterviewRound.relations({
      jobApplication: rel
        .belongsTo(JobApplication, { from: 'jobApplicationId', to: 'id' })
        .sql({ fk: { name: 'fk_interview_round_job_application_id', onDelete: 'cascade' } }),
      contacts: rel.hasMany(InterviewRoundHasContact, { by: 'interviewRoundId' }),
    }),
    InterviewRoundHasContact: InterviewRoundHasContact.relations({
      interviewRound: rel.belongsTo(InterviewRound, { from: 'interviewRoundId', to: 'id' }).sql({
        fk: { name: 'fk_interview_round_has_contact_interview_round_id', onDelete: 'cascade' },
      }),
      contact: rel
        .belongsTo(Contact, { from: 'contactId', to: 'id' })
        .sql({ fk: { name: 'fk_interview_round_has_contact_contact_id', onDelete: 'cascade' } }),
    }),
    JobApplicationHasSkill: JobApplicationHasSkill.relations({
      jobApplication: rel.belongsTo(JobApplication, { from: 'jobApplicationId', to: 'id' }).sql({
        fk: { name: 'fk_job_application_has_skill_job_application_id', onDelete: 'cascade' },
      }),
      skill: rel
        .belongsTo(Skill, { from: 'skillId', to: 'id' })
        .sql({ fk: { name: 'fk_job_application_has_skill_skill_id', onDelete: 'cascade' } }),
    }),
  };
}
