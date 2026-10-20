import { getRecentActivity } from '@/features/dashboard/queries/get-recent-activity.ts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const result = await getRecentActivity(Object.fromEntries(searchParams));
  if (!result.success) {
    return Response.json({ errors: result.errors }, { status: 400 });
  }
  return Response.json(result.data);
}
