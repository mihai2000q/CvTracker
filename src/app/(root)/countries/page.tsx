import type { Metadata } from 'next';
import { readListSearchParams } from '@/lib/search-params.ts';
import { countriesSearchParamsState } from '@/features/countries/schemas/countries-search-params.ts';
import { getCountries } from '@/features/countries/queries/get-countries.ts';
import { countCountries } from '@/features/countries/queries/count-countries.ts';
import { redirect } from 'next/navigation';
import CountriesToolbar from '@/features/countries/components/countries-toolbar.tsx';
import CountryItem from '@/features/countries/components/country-item.tsx';
import EmptyCountries from '@/features/countries/components/empty-countries.tsx';
import ListHeader from '@/components/list/list-header.tsx';
import ListFooter from '@/components/list/list-footer.tsx';
import NoResults from '@/components/list/no-results.tsx';
import { SegmentedControl } from '@/components/ui/segmented-control.tsx';

export const metadata: Metadata = { title: 'Countries' };

const Countries = async ({ searchParams }: PageProps<'/countries'>) => {
  const {
    values: { page, sortBy, scope, search },
    hrefForPage,
    hrefForSortBy,
    hrefForPatch,
    hrefForNoFilters,
  } = readListSearchParams(countriesSearchParamsState, '/countries', await searchParams);

  const [result, allCount, appliedCount, interviewCount, offerCount] = await Promise.all([
    getCountries({ page, sortBy, scope, search }),
    countCountries('all'),
    countCountries('applied'),
    countCountries('interview'),
    countCountries('offer'),
  ]);
  if (!result.success) {
    redirect('/countries');
  }

  const { items: countries, totalCount } = result.data;

  return (
    <div className={'flex flex-1 flex-col gap-6'}>
      <ListHeader
        title="Countries"
        description="Manage and track the applications you've sent, filtered by country"
        rightSection={
          <SegmentedControl
            aria-label="Country filter"
            items={[
              {
                label: 'All',
                href: hrefForPatch({ scope: 'all' }),
                active: scope === 'all',
                count: allCount,
              },
              {
                label: 'Applied',
                href: hrefForPatch({ scope: 'applied' }),
                active: scope === 'applied',
                count: appliedCount,
              },
              {
                label: 'Interview',
                href: hrefForPatch({ scope: 'interview' }),
                active: scope === 'interview',
                count: interviewCount,
              },
              {
                label: 'Offer',
                href: hrefForPatch({ scope: 'offer' }),
                active: scope === 'offer',
                count: offerCount,
              },
            ]}
          />
        }
      />

      <div className={'flex flex-1 flex-col gap-6'}>
        <CountriesToolbar sortBy={sortBy} hrefForSortBy={hrefForSortBy} />

        {totalCount > 0 && (
          <ul role="list" className={'grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4'}>
            {countries.map((country) => (
              <li key={country.id}>
                <CountryItem country={country} />
              </li>
            ))}
          </ul>
        )}

        {totalCount === 0 && !search && <EmptyCountries />}
        {totalCount === 0 && search && (
          <NoResults noun="countries" clearHref={hrefForNoFilters()} />
        )}
      </div>

      <ListFooter
        shown={countries.length}
        totalCount={totalCount}
        noun="countries"
        page={page}
        hrefForPage={hrefForPage}
      />
    </div>
  );
};

export default Countries;
