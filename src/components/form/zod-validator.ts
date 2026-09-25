import { parseWithZod } from '@conform-to/zod/v4';
import type { z } from 'zod';

export function zodValidator<Schema extends z.ZodType>(schema: Schema) {
  return ({ formData }: { formData: FormData }) => parseWithZod(formData, { schema });
}
