import type { z } from 'zod';
import { zodValidate } from '@/lib/zod.ts';

export function zodValidator<Schema extends z.ZodType>(schema: Schema) {
  return ({ formData }: { formData: FormData }) => zodValidate({ formData, schema });
}
