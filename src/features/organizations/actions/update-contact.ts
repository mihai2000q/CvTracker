'use server';

import { updateTag } from 'next/cache';
import { db } from '@database/db';
import { sized, uuid } from '@database/field-values';
import { getUserId, verifySession } from '@/lib/auth/session';
import type { SubmissionResult } from '@conform-to/react';
import { zodValidateForm } from '@/lib/zod/parse.ts';
import { updateContactSchema } from '@/features/organizations/schemas/update-contact-schema.ts';
import { cacheTags } from '@/lib/cache-tags.ts';

export async function updateContact(_state: SubmissionResult | undefined, formData: FormData) {
  const userId = getUserId(await verifySession());

  const submission = zodValidateForm({ formData, schema: updateContactSchema });
  if (submission.status !== 'success') {
    return submission.reply();
  }

  const { id, name, email, phone, role } = submission.value;

  const existing = await db.Contact.first({ id: uuid(id) });
  if (!existing) {
    return submission.reply({ formErrors: ['Contact not found'] });
  }

  await db.Contact.where({ id: uuid(id) }).update({
    name: sized<150>(name),
    email: email ? sized<255>(email) : null,
    phone: phone ? sized<50>(phone) : null,
    role: role ? sized<100>(role) : null,
  });

  updateTag(cacheTags.contacts(existing.organizationId));
  updateTag(cacheTags.jobApplications(userId));
  return submission.reply({ resetForm: true });
}
