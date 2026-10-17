export interface Country {
  id: string;
  name: string;
  isoCode: string;
  organizationsCount: number;
  jobApplicationsCount: number;
}

export interface CountrySummary {
  id: string;
  name: string;
  isoCode: string;
}
