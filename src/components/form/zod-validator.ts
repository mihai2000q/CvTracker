import type { z } from 'zod';
import { zodValidateForm } from '@/lib/zod.ts';

export function zodValidator<Schema extends z.ZodType>(schema: Schema) {
  return ({ formData }: { formData: FormData }) => zodValidateForm({ formData, schema });
}
