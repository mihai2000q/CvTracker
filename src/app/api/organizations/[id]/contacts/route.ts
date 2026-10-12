import { getOrganizationContacts } from '@/features/organizations/queries/get-organization-contacts.ts';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getOrganizationContacts(id);
  if (!result.success) {
    return Response.json({ errors: result.errors }, { status: 400 });
  }
  return Response.json(result.data);
}
