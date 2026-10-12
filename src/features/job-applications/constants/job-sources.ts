// The sources an application can be tagged with, anything else is "Other" and is stored as typed.
export const JOB_SOURCES = ['LinkedIn', 'Indeed', 'Stepstone', 'Company site', 'Referral'] as const;
export type JobSource = (typeof JOB_SOURCES)[number];

export const OTHER_SOURCE = 'Other';

export const isJobSource = (value: string): value is JobSource =>
  (JOB_SOURCES as readonly string[]).includes(value);

// A typed source that matches a known one, whatever its casing or spacing, takes that
// source's own spelling ("linkedin" becomes "LinkedIn").
// Anything else is kept as typed
export function normalizeSource(input: string) {
  const typed = input.trim().replace(/\s+/g, ' ');
  return JOB_SOURCES.find((source) => source.toLowerCase() === typed.toLowerCase()) ?? typed;
}
