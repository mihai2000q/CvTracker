import type { SearchParamsState } from '@/lib/search-params.ts';
import { z } from 'zod';
import { getDocumentsQuerySchema } from '@/features/documents/schemas/get-documents-schema.ts';
import { DEFAULT_DOCUMENT_SORT_BY } from '@/features/documents/constants/documents-sorting.tsx';
import { serializeSort } from '@/lib/sort.ts';

enum DocumentsSearchParam {
  Page = 'p',
  SortBy = 's',
}

const documentsSearchParamsSchema = z.object({
  page: getDocumentsQuerySchema.shape.page.catch(1),
  sortBy: getDocumentsQuerySchema.shape.sortBy
    .catch([])
    .transform((sortBy) => (sortBy.length > 0 ? sortBy : DEFAULT_DOCUMENT_SORT_BY)),
});

export type DocumentsSearchParamsState = z.infer<typeof documentsSearchParamsSchema>;

export const documentsSearchParamsState: SearchParamsState<DocumentsSearchParamsState> = {
  keys: Object.values(DocumentsSearchParam),
  deserialize: (params) =>
    documentsSearchParamsSchema.parse({
      page: params.get(DocumentsSearchParam.Page) ?? undefined,
      sortBy: params.getAll(DocumentsSearchParam.SortBy) ?? [],
    }),
  serialize: ({ page, sortBy }) => {
    const params = new URLSearchParams({ [DocumentsSearchParam.Page]: String(page) });
    serializeSort(sortBy).forEach((entry) => params.append(DocumentsSearchParam.SortBy, entry));
    return params;
  },
};
