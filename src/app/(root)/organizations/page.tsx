import OrganizationsToolbar from '@/features/organizations/components/organizations-toolbar.tsx';
import { Accordion } from '@/components/ui/accordion.tsx';
import OrganizationItem from '@/features/organizations/components/organization-item.tsx';
import { getOrganizations } from '@/features/organizations/queries/get-organizations.ts';
import EmptyOrganizations from '@/features/organizations/components/empty-organizations.tsx';
import { redirect } from 'next/navigation';
import AppPagination from '@/components/pagination/app-pagination.tsx';
import { organizationsSearchParamsState } from '@/features/organizations/schemas/organizations-search-params.ts';
import { readSearchParams } from '@/lib/search-params.ts';

const Organizations = async ({ searchParams }: PageProps<'/organizations'>) => {
  const {
    values: { page },
    hrefFor,
  } = readSearchParams(organizationsSearchParamsState, await searchParams);
  const hrefForPage = (page: number) => hrefFor('/organizations', { page });

  const result = await getOrganizations({ page });
  if (!result.success) {
    redirect('/organizations');
  }

  const { items: organizations, totalCount } = result.data;

  return (
    <div className={'flex flex-1 flex-col gap-6'}>
      <header>
        <h1 className={'text-2xl font-bold'}>Organizations</h1>
        <div className={'text-muted-foreground text-xs'}>
          Manage and track the organizations you&#39;ve applied to, in one place
        </div>
      </header>

      <main className={'flex flex-1 flex-col gap-6'}>
        {totalCount > 0 && <OrganizationsToolbar />}

        {organizations.length > 0 && (
          <Accordion className={'gap-2.5'}>
            {organizations.map((organization) => (
              <OrganizationItem key={organization.id} organization={organization} />
            ))}
          </Accordion>
        )}

        {totalCount === 0 && <EmptyOrganizations />}
      </main>

      {totalCount > 0 && (
        <div className={'flex flex-wrap items-center justify-between gap-2 pt-4'}>
          <div className={'text-muted-foreground text-xs'}>
            Displaying {organizations.length} of {totalCount} organizations
          </div>

          <AppPagination page={page} totalCount={totalCount} hrefForPage={hrefForPage} />
        </div>
      )}
    </div>
  );
};

export default Organizations;
