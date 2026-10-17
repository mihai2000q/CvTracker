// What setting the outcome of an interview round did to its application
export interface InterviewOutcomeEffect {
  // The round failed and no other was to come, so the application was rejected
  rejected: boolean;
  // The round failed but another is still to come: the user is asked whether to reject
  suggestRejection: boolean;
}
