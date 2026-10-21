import 'server-only';
import { Temporal } from 'temporal-polyfill';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values.ts';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import { zodValidate } from '@/lib/zod/parse.ts';
import { Result } from '@/types/result.ts';
import { CursorPage, decodeCursor, encodeCursor } from '@/lib/pagination.ts';
import {
  GetRecentActivityQuery,
  GetRecentActivityQueryInput,
  getRecentActivityQuerySchema,
} from '@/features/dashboard/schemas/get-recent-activity-schema.ts';
import type { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import type { RecentActivityItem } from '@/features/dashboard/types/recent-activity.ts';

export async function getRecentActivity(
  query: GetRecentActivityQueryInput
): Promise<Result<CursorPage<RecentActivityItem>>> {
  const userId = getUserId(await verifySession());
  const parsed = zodValidate(query, getRecentActivityQuerySchema);
  if (!parsed.success) {
    return parsed;
  }

  return getRecentActivityQuery(userId, parsed.data);
}

async function getRecentActivityQuery(
  userId: string,
  { cursor, limit, from, to }: GetRecentActivityQuery
): Promise<Result<CursorPage<RecentActivityItem>>> {
  'use cache';
  cacheTag(cacheTags.jobApplications(userId));

  let dbQuery = db.ApplicationStatusHistory.where((change) =>
    change.jobApplication.some((ja) => ja.userId.eq(uuid(userId)))
  )
    .include('jobApplication', (ja) =>
      ja
        .select('id', 'title')
        .include('organization', (o) => o.select('id', 'name'))
        .include('country', (c) => c.select('name', 'isoCode'))
    )
    .orderBy([(change) => change.changedAt.desc(), (change) => change.id.desc()])
    .limit(limit + 1);
  const decoded = cursor ? decodeCursor(cursor, 2) : null;
  if (decoded) {
    const [changedAt, id] = decoded;
    dbQuery = dbQuery.cursor({ changedAt, id: uuid(id) });
  }
  if (from) {
    const start = Temporal.PlainDate.from(from);
    dbQuery = dbQuery.where((change) =>
      change.jobApplication.some((ja) => ja.appliedAt.gte(start))
    );
  }
  if (to) {
    const end = Temporal.PlainDate.from(to);
    dbQuery = dbQuery.where((change) => change.jobApplication.some((ja) => ja.appliedAt.lte(end)));
  }

  const changes = await dbQuery.all();

  const hasMore = changes.length > limit;
  const models = hasMore ? changes.slice(0, limit) : changes;
  const last = models[models.length - 1];
  const nextCursor = hasMore ? encodeCursor(last.changedAt, last.id) : null;

  const items: RecentActivityItem[] = models.map((change) => ({
    id: change.id,
    status: change.status as JobApplicationStatus,
    note: change.note ?? null,
    changedAt: change.changedAt,
    jobApplication: {
      id: change.jobApplication!.id,
      title: change.jobApplication!.title,
      organization: change.jobApplication!.organization!,
      country: change.jobApplication!.country!,
    },
  }));

  return { success: true, data: { items, nextCursor } };
}
