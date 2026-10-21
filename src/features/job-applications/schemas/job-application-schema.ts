import { z } from 'zod';
import { zEmptyToUndefined, zFile } from '@/lib/zod/fields.ts';

export const jobApplicationSchema = (getToday: () => string) =>
  z.object({
    title: z.string().trim().min(1, 'Title cannot be blank').max(200, 'Title is too long'),
    postingUrl: zEmptyToUndefined(z.url('Posting URL is invalid').optional()),
    source: zEmptyToUndefined(z.string().trim().max(100, 'Source is too long').optional()),
    appliedAt: z
      .string('Applied date is required')
      .min(1, 'Applied date is required')
      .pipe(z.iso.date('Applied date is invalid'))
      .pipe(
        z.string().refine((date) => date <= getToday(), {
          message: 'Applied date cannot be in the future',
        })
      ),
    notes: zEmptyToUndefined(z.string().trim().optional()),
    organizationName: z
      .string('Organization is required')
      .trim()
      .min(1, 'Organization is required')
      .max(200, 'Organization name is too long'),
    organizationId: zEmptyToUndefined(z.uuid('Organization is invalid').optional()),
    countryId: z.uuid('Country is required'),
    cvDocumentId: zEmptyToUndefined(z.uuid('CV is invalid').optional()),
    // Left without one (and without a file), the application has no cover letter
    coverLetterDocumentId: zEmptyToUndefined(z.uuid('Cover letter is invalid').optional()),
    cvDocumentFile: zEmptyToUndefined(zFile('CV').optional()),
    coverLetterDocumentFile: zEmptyToUndefined(zFile('Cover Letter').optional()),
  });

// The CV is an existing document or a new file, not both and not neither. It is a check on the
// whole schema, so it is not part of the one above: a schema with a check can't be extended
export const hasExactlyOneCv = ({
  cvDocumentId,
  cvDocumentFile,
}: {
  cvDocumentId?: string;
  cvDocumentFile?: File;
}) => Boolean(cvDocumentId) !== Boolean(cvDocumentFile);

export const CV_ISSUE = {
  path: ['cvDocumentId'],
  message: 'Select an existing CV or upload a new one',
  when: () => true,
};
