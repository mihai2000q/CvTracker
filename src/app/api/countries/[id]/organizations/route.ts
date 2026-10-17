import { getCountryOrganizations } from '@/features/countries/queries/get-country-organizations.ts';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const result = await getCountryOrganizations({
    ...Object.fromEntries(searchParams),
    countryId: id,
    sortBy: searchParams.getAll('sortBy'),
  });
  if (!result.success) {
    return Response.json({ errors: result.errors }, { status: 400 });
  }
  return Response.json(result.data);
}
