import { searchOrganizations } from '@/features/organizations/queries/search-organizations.ts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const result = await searchOrganizations(Object.fromEntries(searchParams));
  if (!result.success) {
    return Response.json({ errors: result.errors }, { status: 400 });
  }
  return Response.json(result.data);
}
