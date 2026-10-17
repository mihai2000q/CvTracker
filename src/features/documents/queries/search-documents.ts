import 'server-only';
import { buildSearch } from '@database/filter.ts';
import { DOCUMENT_NAME_SEARCH_COLUMNS } from '@/features/documents/constants/document-filtering.ts';
import { db } from '@database/db.ts';
import { Result } from '@/types/result.ts';
import { zodValidate } from '@/lib/zod/parse.ts';
import { DocumentSummary } from '@/features/documents/types/document.ts';
import {
  SearchDocumentsQuery,
  SearchDocumentsQueryParams,
  searchDocumentsQuerySchema,
} from '@/features/documents/schemas/search-documents-schema.ts';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import { uuid } from '@database/field-values.ts';
import { CursorPage, decodeCursor, encodeCursor } from '@/lib/pagination.ts';
import { DocumentType } from '@/features/documents/types/enums/document-type.ts';
import { DocumentType as DbDocumentType } from '@database/enums.ts';

export async function searchDocuments(
  query: SearchDocumentsQueryParams
): Promise<Result<CursorPage<DocumentSummary>>> {
  const userId = getUserId(await verifySession());
  const parsed = zodValidate(query, searchDocumentsQuerySchema);
  if (!parsed.success) {
    return parsed;
  }

  return searchDocumentsQuery(userId, parsed.data);
}

export async function searchDocumentsQuery(
  userId: string,
  { type, search, cursor, limit }: SearchDocumentsQuery
): Promise<Result<CursorPage<DocumentSummary>>> {
  'use cache';
  cacheTag(cacheTags.documents(userId));

  let dbQuery = db.Document.select('id', 'name', 'originalFilename', 'type', 'size', 'uploadedAt')
    .where({
      userId: uuid(userId),
      type:
        type === DocumentType.CV ? DbDocumentType.members.Cv : DbDocumentType.members.CoverLetter,
    })
    .orderBy([(c) => c.uploadedAt.desc(), (c) => c.name.asc(), (c) => c.id.desc()])
    .limit(limit + 1);
  const decoded = cursor ? decodeCursor(cursor, 3) : null;
  if (decoded) {
    const [uploadedAt, id] = decoded;
    dbQuery = dbQuery.cursor({ uploadedAt, id: uuid(id) });
  }
  dbQuery = dbQuery.where(buildSearch(search, DOCUMENT_NAME_SEARCH_COLUMNS));

  const documents = await dbQuery.all();

  const hasMore = documents.length > limit;
  const models = hasMore ? documents.slice(0, limit) : documents;
  const last = models[models.length - 1];
  const nextCursor = hasMore ? encodeCursor(last.uploadedAt, last.id) : null;

  const items: DocumentSummary[] = models.map((model) => ({
    ...model,
    type: type as DocumentType,
  }));

  return {
    success: true,
    data: { items, nextCursor },
  };
}
