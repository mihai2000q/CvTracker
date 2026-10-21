import 'server-only';
import { Document, toDocument } from '@/features/documents/types/document.ts';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import {
  GetDocumentsQueryInput,
  getDocumentsQuerySchema,
  GetDocumentsQuery,
} from '@/features/documents/schemas/get-documents-schema.ts';
import { Page } from '@/lib/pagination.ts';
import { Result } from '@/types/result.ts';
import { paginate } from '@database/paginate.ts';
import { zodValidate } from '@/lib/zod/parse.ts';
import { buildOrderBy } from '@database/sort.ts';
import { buildSearch, buildWhere } from '@database/filter.ts';
import {
  DOCUMENT_FILTERS,
  DOCUMENT_SEARCH_COLUMNS,
} from '@/features/documents/constants/document-filtering.ts';
import {
  DOCUMENT_TIEBREAKERS,
  documentSorters,
} from '@/features/documents/constants/document-sorting.tsx';

export async function getDocuments(query: GetDocumentsQueryInput): Promise<Result<Page<Document>>> {
  const userId = getUserId(await verifySession());

  const parsed = zodValidate(query, getDocumentsQuerySchema);
  if (!parsed.success) {
    return parsed;
  }

  return { success: true, data: await getDocumentsQuery(userId, parsed.data) };
}

async function getDocumentsQuery(
  userId: string,
  { page, pageSize, sortBy, filterBy, search }: GetDocumentsQuery
): Promise<Page<Document>> {
  'use cache';
  cacheTag(cacheTags.documents(userId), cacheTags.jobApplications(userId));

  const filteredQuery = db.Document.where({ userId: uuid(userId) })
    .where(buildWhere(filterBy, DOCUMENT_FILTERS))
    .where(buildSearch(search, DOCUMENT_SEARCH_COLUMNS));

  const modelsQuery = paginate(filteredQuery, { page, pageSize })
    .orderBy(buildOrderBy(sortBy, documentSorters, DOCUMENT_TIEBREAKERS))
    .include('coverLetterForJobApplications', (ja) => ja.where({ userId: uuid(userId) }).count())
    .include('cvForJobApplications', (ja) => ja.where({ userId: uuid(userId) }).count())
    .all();
  const [models, { totalCount }] = await Promise.all([
    modelsQuery,
    filteredQuery.aggregate((aggregate) => ({ totalCount: aggregate.count() })),
  ]);

  return { items: models.map(toDocument), totalCount };
}
