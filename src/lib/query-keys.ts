import { DocumentType } from '@/features/documents/types/enums/document-type.ts';

export const queryKeys = {
  contacts: ['contacts'] as const,
  organizationContacts: (organizationId: string) =>
    [...queryKeys.contacts, organizationId] as const,
  countries: ['countries'] as const,
  countrySearch: (search: string) => [...queryKeys.countries, search] as const,
  documents: ['documents'] as const,
  documentSearch: (type: DocumentType, search: string) =>
    [...queryKeys.documents, type, search] as const,
  organizations: ['organizations'] as const,
  organizationSearch: (search: string) => [...queryKeys.organizations, search] as const,
};
