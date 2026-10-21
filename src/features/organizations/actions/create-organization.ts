'use server';

import { updateTag } from 'next/cache';
import { db } from '@database/db';
import { sized, uuid } from '@database/field-values';
import { isForeignKeyConstraintError } from '@database/sql-error';
import { getUserId, verifySession } from '@/lib/auth/session';
import type { SubmissionResult } from '@conform-to/react';
import { zodValidateForm } from '@/lib/zod/parse.ts';
import { createOrganizationSchema } from '@/features/organizations/schemas/create-organization-schema.ts';
import { cacheTags } from '@/lib/cache-tags.ts';

export async function createOrganization(_state: SubmissionResult | undefined, formData: FormData) {
  const session = await verifySession();
  const userId = getUserId(session);

  const submission = zodValidateForm({ formData, schema: createOrganizationSchema });
  if (submission.status !== 'success') {
    return submission.reply();
  }

  const { name, websiteUrl, notes, countryIds } = submission.value;

  try {
    await db.Organization.create({
      name: sized<200>(name),
      websiteUrl,
      notes,
      organizationCountries: (organizationCountries) =>
        organizationCountries.create(
          [...new Set(countryIds)].map((countryId) => ({ countryId: uuid(countryId) }))
        ),
      userId: uuid(userId),
    });
  } catch (error) {
    if (isForeignKeyConstraintError(error)) {
      return submission.reply({ formErrors: ['One of the selected countries no longer exists.'] });
    }
    throw error;
  }

  updateTag(cacheTags.organizations(userId));
  return submission.reply({ resetForm: true });
}
