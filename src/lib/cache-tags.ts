export const cacheTags = {
  // Per organization, since a contact belongs to one
  contacts: (organizationId: string) => `contacts:${organizationId}`,
  countries: (userId: string) => `countries:${userId}`,
  documents: (userId: string) => `documents:${userId}`,
  jobApplications: (userId: string) => `jobApplications:${userId}`,
  organizations: (userId: string) => `organizations:${userId}`,
};
