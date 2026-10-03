import OrganizationsToolbar from '@/features/organizations/components/organizations-toolbar.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { Accordion } from '@/components/ui/accordion.tsx';
import OrganizationItem from '@/features/organizations/components/organization-item.tsx';
import { getOrganizations } from '@/features/organizations/queries/get-organizations.ts';
import EmptyOrganizations from '@/features/organizations/components/empty-organizations.tsx';

const Organizations = async () => {
  const organizations = await getOrganizations();

  return (
    <div className={'flex flex-1 flex-col'}>
      <header>
        <h1 className={'text-2xl font-bold'}>Organizations</h1>
        <div className={'text-muted-foreground text-xs'}>
          All organizations you&#39;ve applied to, in one place
        </div>
      </header>

      <Separator className={'mt-4 mb-3'} />

      <main className={'flex flex-1 flex-col gap-4'}>
        {organizations.length > 0 && <OrganizationsToolbar />}

        {organizations.length > 0 && (
          <Accordion className={'gap-2.5'}>
            {organizations.map((organization) => (
              <OrganizationItem key={organization.id} organization={organization} />
            ))}
          </Accordion>
        )}

        {organizations.length === 0 && <EmptyOrganizations />}
      </main>
    </div>
  );
};

export default Organizations;
