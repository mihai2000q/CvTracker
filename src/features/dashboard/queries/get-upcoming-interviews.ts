import 'server-only';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values.ts';
import { InterviewOutcome as DbInterviewOutcome } from '@database/enums.ts';
import { getUserId, verifySession } from '@/lib/auth/session.ts';
import { cacheLife, cacheTag } from 'next/cache';
import { cacheTags } from '@/lib/cache-tags.ts';
import { zodValidate } from '@/lib/zod/parse.ts';
import { Result } from '@/types/result.ts';
import { CursorPage, decodeCursor, encodeCursor } from '@/lib/pagination.ts';
import {
  GetUpcomingInterviewsQuery,
  GetUpcomingInterviewsQueryInput,
  getUpcomingInterviewsQuerySchema,
} from '@/features/dashboard/schemas/get-upcoming-interviews-schema.ts';
import { startsAfter } from '@/features/job-applications/lifecycle/upcoming.ts';
import type { RoundType } from '@/features/job-applications/types/enums/round-type.ts';
import type { UpcomingInterview } from '@/features/dashboard/types/upcoming-interview.ts';

export async function getUpcomingInterviews(
  query: GetUpcomingInterviewsQueryInput
): Promise<Result<CursorPage<UpcomingInterview>>> {
  const userId = getUserId(await verifySession());
  const parsed = zodValidate(query, getUpcomingInterviewsQuerySchema);
  if (!parsed.success) {
    return parsed;
  }

  return getUpcomingInterviewsQuery(userId, parsed.data);
}

async function getUpcomingInterviewsQuery(
  userId: string,
  { cursor, limit }: GetUpcomingInterviewsQuery
): Promise<Result<CursorPage<UpcomingInterview>>> {
  'use cache';
  cacheTag(cacheTags.jobApplications(userId), cacheTags.organizations(userId));
  // What is upcoming depends on the time, not only on writes: the list is good for a minute, and
  // "now" is the moment it is made, so it is not part of the cache key
  cacheLife('minutes');

  let dbQuery = db.InterviewRound.where({ outcome: DbInterviewOutcome.members.Scheduled })
    .where(startsAfter(new Date()))
    .where((round) => round.jobApplication.some((ja) => ja.userId.eq(uuid(userId))))
    .include('jobApplication', (ja) =>
      ja
        .select('id', 'title')
        .include('organization', (o) => o.select('id', 'name'))
        .include('country', (c) => c.select('name', 'isoCode'))
    )
    .orderBy([(round) => round.scheduledAt.asc(), (round) => round.id.asc()])
    .limit(limit + 1);
  const decoded = cursor ? decodeCursor(cursor, 2) : null;
  if (decoded) {
    const [scheduledAt, id] = decoded;
    dbQuery = dbQuery.cursor({ scheduledAt, id: uuid(id) });
  }

  const rounds = await dbQuery.all();

  const hasMore = rounds.length > limit;
  const models = hasMore ? rounds.slice(0, limit) : rounds;
  const last = models[models.length - 1];
  const nextCursor = hasMore ? encodeCursor(last.scheduledAt, last.id) : null;

  const items: UpcomingInterview[] = models.map((round) => ({
    id: round.id,
    roundType: round.roundType as RoundType,
    scheduledAt: round.scheduledAt,
    jobApplication: {
      id: round.jobApplication!.id,
      title: round.jobApplication!.title,
      organization: round.jobApplication!.organization!,
      country: round.jobApplication!.country!,
    },
  }));

  return { success: true, data: { items, nextCursor } };
}
