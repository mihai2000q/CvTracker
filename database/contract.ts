import { defineContract } from '@prisma/orm-postgres/contract-builder';
import { DocumentType, ApplicationStatus, InterviewOutcome } from './enums.ts';
import { sqlTypes } from './sql-types.ts';
import { userModel } from './models/user.model.ts';
import { countryModel } from './models/country.model.ts';
import { organizationModels } from './models/organization.model.ts';
import { documentModels } from './models/document.model.ts';
import { skillModel } from './models/skill.model.ts';
import { jobApplicationModels } from './models/job-application.model.ts';
import { applicationStatusHistoryModel } from './models/application-status-history.model.ts';
import { contactModel } from './models/contact.model.ts';
import { interviewRoundModel } from './models/interview-round.model.ts';

import { organizationRelations } from './models/organization.relations.ts';
import { countryRelations } from './models/country.relations.ts';
import { userRelations } from './models/user.relations.ts';
import { documentRelations } from './models/document.relations.ts';
import { skillRelations } from './models/skill.relations.ts';
import { jobApplicationRelations } from './models/job-application.relations.ts';

export const contract = defineContract(
  {
    naming: {
      columns: 'snake_case',
      tables: 'snake_case',
    },
  },
  (helpers) => {
    const types = sqlTypes(helpers);

    const User = userModel(helpers, types);
    const Country = countryModel(helpers, types);
    const { Organization, OrganizationCountry } = organizationModels(helpers, types);
    const { Document, DocumentHasSkill } = documentModels(helpers, types);
    const Skill = skillModel(helpers, types);
    const { JobApplication, JobApplicationHasSkill } = jobApplicationModels(helpers, types);
    const ApplicationStatusHistory = applicationStatusHistoryModel(helpers);
    const Contact = contactModel(helpers, types);
    const InterviewRound = interviewRoundModel(helpers, types);

    return {
      enums: { DocumentType, ApplicationStatus, InterviewOutcome },
      types,
      models: {
        ...countryRelations(helpers, { Country, JobApplication, OrganizationCountry }),
        ...userRelations(helpers, { User, Organization, Document, Skill, JobApplication }),
        ...organizationRelations(helpers, {
          Organization,
          User,
          Country,
          OrganizationCountry,
          JobApplication,
        }),
        ...documentRelations(helpers, {
          Document,
          User,
          JobApplication,
          Skill,
          DocumentHasSkill,
        }),
        ...skillRelations(helpers, { Skill, User, JobApplicationHasSkill, DocumentHasSkill }),
        ...jobApplicationRelations(helpers, {
          JobApplication,
          Organization,
          Document,
          Country,
          User,
          Skill,
          ApplicationStatusHistory,
          Contact,
          InterviewRound,
          JobApplicationHasSkill,
        }),
      },
    };
  }
);
