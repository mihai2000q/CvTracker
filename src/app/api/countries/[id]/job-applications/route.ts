import { getCountryJobApplications } from '@/features/countries/queries/get-country-job-applications.ts';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const result = await getCountryJobApplications({
    ...Object.fromEntries(searchParams),
    countryId: id,
  });
  if (!result.success) {
    return Response.json({ errors: result.errors }, { status: 400 });
  }
  return Response.json(result.data);
}
