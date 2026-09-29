export interface Country extends CountrySummary {
  organizationsCount: number;
  jobApplicationsCount: number;
}

export interface CountrySummary {
  id: string;
  name: string;
  isoCode: string;
}
