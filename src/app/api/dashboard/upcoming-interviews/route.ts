import { getUpcomingInterviews } from '@/features/dashboard/queries/get-upcoming-interviews.ts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const result = await getUpcomingInterviews(Object.fromEntries(searchParams));
  if (!result.success) {
    return Response.json({ errors: result.errors }, { status: 400 });
  }
  return Response.json(result.data);
}
