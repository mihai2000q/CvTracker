import { z } from 'zod';
import { format } from 'date-fns';
import { zEmptyToUndefined, zFile, zToArray } from '@/lib/zod/fields.ts';

export const createJobApplicationSchema = z
  .object({
    title: z.string().trim().min(1, 'Title cannot be blank').max(200, 'Title is too long'),
    postingUrl: zEmptyToUndefined(z.url('Posting URL is invalid').optional()),
    source: zEmptyToUndefined(z.string().trim().max(100, 'Source is too long').optional()),
    appliedAt: z
      .string('Applied date is required')
      .min(1, 'Applied date is required')
      .pipe(z.iso.date('Applied date is invalid'))
      .pipe(
        z.string().refine((date) => date <= format(new Date(), 'yyyy-MM-dd'), {
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
    coverLetterDocumentId: zEmptyToUndefined(z.uuid('Cover letter is invalid').optional()),
    cvDocumentFile: zEmptyToUndefined(zFile('CV').optional()),
    coverLetterDocumentFile: zEmptyToUndefined(zFile('Cover Letter').optional()),
    skillIds: zToArray(z.array(z.uuid('Skill must be identifiable'))),
  })
  .refine(({ cvDocumentId, cvDocumentFile }) => Boolean(cvDocumentId) !== Boolean(cvDocumentFile), {
    path: ['cvDocumentId'],
    message: 'Select an existing CV or upload a new one',
    when: () => true,
  });

export type CreateJobApplicationForm = z.infer<typeof createJobApplicationSchema>;
