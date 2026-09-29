import { searchCountries } from '@/features/countries/queries/search-countries.ts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const result = await searchCountries(Object.fromEntries(searchParams));
  if (!result.success) {
    return Response.json({ errors: result.errors }, { status: 400 });
  }
  return Response.json(result.data);
}
