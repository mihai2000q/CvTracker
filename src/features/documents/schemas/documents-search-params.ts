import type { SearchParamsState } from '@/lib/search-params.ts';
import { z } from 'zod';
import { getDocumentsQuerySchema } from '@/features/documents/schemas/get-documents-schema.ts';

enum DocumentsSearchParam {
  Page = 'p',
}

const documentsSearchParamsSchema = z.object({
  page: getDocumentsQuerySchema.shape.page.catch(1),
});

export type DocumentsSearchParamsState = z.infer<typeof documentsSearchParamsSchema>;

export const documentsSearchParamsState: SearchParamsState<DocumentsSearchParamsState> = {
  keys: Object.values(DocumentsSearchParam),
  deserialize: (params) =>
    documentsSearchParamsSchema.parse({
      page: params.get(DocumentsSearchParam.Page) ?? undefined,
    }),
  serialize: ({ page }) => new URLSearchParams({ [DocumentsSearchParam.Page]: String(page) }),
};
