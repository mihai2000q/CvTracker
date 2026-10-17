'use server';

import { updateTag } from 'next/cache';
import { db } from '@database/db';
import { sized, uuid } from '@database/field-values';
import { verifySession } from '@/lib/auth/session';
import type { SubmissionResult } from '@conform-to/react';
import { zodValidateForm } from '@/lib/zod/parse.ts';
import { createContactSchema } from '@/features/organizations/schemas/contact-schema.ts';
import { cacheTags } from '@/lib/cache-tags.ts';

export async function createContact(_state: SubmissionResult | undefined, formData: FormData) {
  await verifySession();

  const submission = zodValidateForm({ formData, schema: createContactSchema });
  if (submission.status !== 'success') {
    return submission.reply();
  }

  const { organizationId, name, email, phone, role } = submission.value;

  const organization = await db.Organization.first({ id: uuid(organizationId) });
  if (!organization) {
    return submission.reply({ formErrors: ['Organization not found'] });
  }

  await db.Contact.create({
    name: sized<150>(name),
    email: email ? sized<255>(email) : undefined,
    phone: phone ? sized<50>(phone) : undefined,
    role: role ? sized<100>(role) : undefined,
    organizationId: uuid(organizationId),
  });

  updateTag(cacheTags.contacts(organizationId));
  return submission.reply({ resetForm: true });
}
