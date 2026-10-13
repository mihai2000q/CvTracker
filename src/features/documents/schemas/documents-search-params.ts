import type { SearchParamsState } from '@/lib/search-params.ts';
import { z } from 'zod';
import { getDocumentsQuerySchema } from '@/features/documents/schemas/get-documents-schema.ts';
import { DEFAULT_DOCUMENT_SORT_BY } from '@/features/documents/constants/document-sorting.tsx';
import { serializeFilter } from '@/lib/filter.ts';
import { serializeSort } from '@/lib/sort.ts';

enum DocumentsSearchParam {
  Page = 'p',
  SortBy = 's',
  FilterBy = 'f',
  Search = 'q',
}

const documentsSearchParamsSchema = z.object({
  page: getDocumentsQuerySchema.shape.page.catch(1),
  sortBy: getDocumentsQuerySchema.shape.sortBy
    .catch([])
    .transform((sortBy) => (sortBy.length > 0 ? sortBy : DEFAULT_DOCUMENT_SORT_BY)),
  filterBy: getDocumentsQuerySchema.shape.filterBy.catch([]),
  search: getDocumentsQuerySchema.shape.search.catch(undefined),
});

export type DocumentsSearchParamsState = z.infer<typeof documentsSearchParamsSchema>;

export const documentsSearchParamsState: SearchParamsState<DocumentsSearchParamsState> = {
  keys: Object.values(DocumentsSearchParam),
  deserialize: (params) =>
    documentsSearchParamsSchema.parse({
      page: params.get(DocumentsSearchParam.Page) ?? undefined,
      sortBy: params.getAll(DocumentsSearchParam.SortBy) ?? [],
      filterBy: params.getAll(DocumentsSearchParam.FilterBy),
      search: params.get(DocumentsSearchParam.Search) ?? undefined,
    }),
  serialize: ({ page, sortBy, filterBy, search }) => {
    const params = new URLSearchParams({ [DocumentsSearchParam.Page]: String(page) });
    serializeSort(sortBy).forEach((entry) => params.append(DocumentsSearchParam.SortBy, entry));
    serializeFilter(filterBy).forEach((entry) =>
      params.append(DocumentsSearchParam.FilterBy, entry)
    );
    if (search) params.set(DocumentsSearchParam.Search, search);
    return params;
  },
};
