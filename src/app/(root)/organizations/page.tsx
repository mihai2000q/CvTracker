import OrganizationsToolbar from '@/features/organizations/components/organizations-toolbar.tsx';
import { Accordion } from '@/components/ui/accordion.tsx';
import OrganizationItem from '@/features/organizations/components/organization-item.tsx';
import { getOrganizations } from '@/features/organizations/queries/get-organizations.ts';
import EmptyOrganizations from '@/features/organizations/components/empty-organizations.tsx';
import { redirect } from 'next/navigation';
import ListHeader from '@/components/list/list-header.tsx';
import ListFooter from '@/components/list/list-footer.tsx';
import { organizationsSearchParamsState } from '@/features/organizations/schemas/organizations-search-params.ts';
import { readListSearchParams } from '@/lib/search-params.ts';

const Organizations = async ({ searchParams }: PageProps<'/organizations'>) => {
  const {
    values: { page, sortBy },
    hrefForPage,
    hrefForSortBy,
  } = readListSearchParams(organizationsSearchParamsState, '/organizations', await searchParams);

  const result = await getOrganizations({ page, sortBy });
  if (!result.success) {
    redirect('/organizations');
  }

  const { items: organizations, totalCount } = result.data;

  return (
    <div className={'flex flex-1 flex-col gap-6'}>
      <ListHeader
        title="Organizations"
        description="Manage and track the organizations you've applied to, in one place"
      />

      <main className={'flex flex-1 flex-col gap-6'}>
        {totalCount > 0 && <OrganizationsToolbar sortBy={sortBy} hrefForSortBy={hrefForSortBy} />}

        {organizations.length > 0 && (
          <Accordion className={'gap-2.5'}>
            {organizations.map((organization) => (
              <OrganizationItem key={organization.id} organization={organization} />
            ))}
          </Accordion>
        )}

        {totalCount === 0 && <EmptyOrganizations />}
      </main>

      <ListFooter
        shown={organizations.length}
        totalCount={totalCount}
        noun="organizations"
        page={page}
        hrefForPage={hrefForPage}
      />
    </div>
  );
};

export default Organizations;
