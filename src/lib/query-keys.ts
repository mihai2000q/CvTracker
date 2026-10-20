import { DocumentType } from '@/features/documents/types/enums/document-type.ts';

export const queryKeys = {
  contacts: ['contacts'] as const,
  organizationContacts: (organizationId: string) =>
    [...queryKeys.contacts, organizationId] as const,
  countries: ['countries'] as const,
  countrySearch: (search: string) => [...queryKeys.countries, search] as const,
  dashboard: ['dashboard'] as const,
  // The signature is what the server rendered first, so a refreshed page starts its lists over
  dashboardUpcomingInterviews: (signature: string) =>
    [...queryKeys.dashboard, 'upcomingInterviews', signature] as const,
  dashboardRecentActivity: (signature: string) =>
    [...queryKeys.dashboard, 'recentActivity', signature] as const,
  documents: ['documents'] as const,
  documentSearch: (type: DocumentType, search: string) =>
    [...queryKeys.documents, type, search] as const,
  organizations: ['organizations'] as const,
  organizationSearch: (search: string) => [...queryKeys.organizations, search] as const,
};
