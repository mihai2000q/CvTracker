'use server';

import { updateTag } from 'next/cache';
import { db, dbClient } from '@database/db.ts';
import { sized, uuid } from '@database/field-values.ts';
import { isForeignKeyConstraintError } from '@database/sql-error.ts';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import type { SubmissionResult } from '@conform-to/react';
import { zodValidateForm } from '@/lib/zod/parse.ts';
import { updateOrganizationSchema } from '@/features/organizations/schemas/update-organization-schema.ts';
import { cacheTags } from '@/lib/cache-tags.ts';

export async function updateOrganization(_state: SubmissionResult | undefined, formData: FormData) {
  const userId = getUserId(await verifySession());

  const submission = zodValidateForm({ formData, schema: updateOrganizationSchema });
  if (submission.status !== 'success') {
    return submission.reply();
  }

  const { id, name, websiteUrl, notes, countryIds } = submission.value;

  const existing = await db.Organization.first({ id: uuid(id) });
  if (!existing) {
    return submission.reply({ formErrors: ['Organization not found'] });
  }

  try {
    await dbClient.transaction(async ({ orm }) => {
      const tx = orm.public;

      await tx.Organization.where({ id: uuid(id) }).update({
        name: sized<200>(name),
        websiteUrl: websiteUrl ?? null,
        notes: notes ?? null,
      });
      // The countries are replaced as a whole: the ones left out go, the new ones come
      await tx.OrganizationCountry.where({ organizationId: uuid(id) }).deleteAll();
      await tx.OrganizationCountry.createAll(
        [...new Set(countryIds)].map((countryId) => ({
          organizationId: uuid(id),
          countryId: uuid(countryId),
        }))
      );
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
