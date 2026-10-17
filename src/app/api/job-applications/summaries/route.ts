import { getJobApplicationSummaries } from '@/features/job-applications/queries/get-job-application-summaries.ts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const result = await getJobApplicationSummaries({
    ...Object.fromEntries(searchParams),
    sortBy: searchParams.getAll('sortBy'),
  });
  if (!result.success) {
    return Response.json({ errors: result.errors }, { status: 400 });
  }
  return Response.json(result.data);
}
