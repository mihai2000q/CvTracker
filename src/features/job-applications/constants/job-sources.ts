// The sources an application can be tagged with, anything else is "Other" and is stored as typed.
export const JOB_SOURCES = ['LinkedIn', 'Indeed', 'Stepstone', 'Company site', 'Referral'] as const;
export type JobSource = (typeof JOB_SOURCES)[number];

export const OTHER_SOURCE = 'Other';

export const isJobSource = (value: string): value is JobSource =>
  (JOB_SOURCES as readonly string[]).includes(value);

const HOST_SOURCES: [RegExp, JobSource][] = [
  [/(^|\.)linkedin\.com$/, 'LinkedIn'],
  [/(^|\.)stepstone\.[a-z.]+$/, 'Stepstone'],
  [/(^|\.)indeed\.[a-z.]+$/, 'Indeed'],
];

// The source a posting URL points to: a known job board by its hostname, any other valid
// URL is the company's own site. Undefined while the text isn't a URL yet.
export function detectSourceFromUrl(input: string): JobSource | undefined {
  const typed = input.trim();
  if (!typed) return undefined;
  let host: string;
  try {
    host = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(typed) ? typed : `https://${typed}`).hostname;
  } catch {
    return undefined;
  }
  if (!host.includes('.')) return undefined;
  host = host.toLowerCase();
  return HOST_SOURCES.find(([pattern]) => pattern.test(host))?.[1] ?? 'Company site';
}

// A typed source that matches a known one, whatever its casing or spacing, takes that
// source's own spelling ("linkedin" becomes "LinkedIn").
// Anything else is kept as typed
export function normalizeSource(input: string) {
  const typed = input.trim().replace(/\s+/g, ' ');
  return JOB_SOURCES.find((source) => source.toLowerCase() === typed.toLowerCase()) ?? typed;
}
