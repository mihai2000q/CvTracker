import { Document } from '@/features/documents/types/document.ts';
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
import { DocumentType } from '@/features/documents/types/enums/document-type.ts';

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
  { page, pageSize }: GetDocumentsQuery
): Promise<Page<Document>> {
  'use cache';
  cacheTag(cacheTags.documents(userId), cacheTags.jobApplications(userId));

  const modelsQuery = paginate(db.Document, { page, pageSize })
    .where({ userId: uuid(userId) })
    .orderBy((c) => c.uploadedAt.desc())
    .include('coverLetterForJobApplications', (ja) => ja.where({ userId: uuid(userId) }).count())
    .include('cvForJobApplications', (ja) => ja.where({ userId: uuid(userId) }).count())
    .all();
  const [models, { totalCount }] = await Promise.all([
    modelsQuery,
    db.Document.aggregate((aggregate) => ({ totalCount: aggregate.count() })),
  ]);

  const documents = models.map((document) => ({
    id: document.id,
    name: document.name,
    type: document.type as DocumentType,
    filePath: document.filePath,
    originalFilename: document.originalFilename,
    size: document.size,
    notes: document.notes,
    uploadedAt: document.uploadedAt,
    jobApplicationsCount: document.coverLetterForJobApplications || document.cvForJobApplications,
  }));

  return { items: documents, totalCount };
}
