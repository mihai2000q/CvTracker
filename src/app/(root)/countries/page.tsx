import { readSearchParams } from '@/lib/search-params.ts';
import { countriesSearchParamsState } from '@/features/countries/schemas/countries-search-params.ts';
import { getCountries } from '@/features/countries/queries/get-countries.ts';
import { countCountries } from '@/features/countries/queries/count-countries.ts';
import { redirect } from 'next/navigation';
import CountriesToolbar from '@/features/countries/components/countries-toolbar.tsx';
import CountryItem from '@/features/countries/components/country-item.tsx';
import EmptyCountries from '@/features/countries/components/empty-countries.tsx';
import AppPagination from '@/components/pagination/app-pagination.tsx';
import { SegmentedControl } from '@/components/ui/segmented-control.tsx';

const Countries = async ({ searchParams }: PageProps<'/countries'>) => {
  const {
    values: { page },
    hrefFor,
  } = readSearchParams(countriesSearchParamsState, await searchParams);
  const hrefForPage = (page: number) => hrefFor('/countries', { page });

  const [result, allCount, appliedCount] = await Promise.all([
    getCountries({ page }),
    countCountries('all'),
    countCountries('applied'),
  ]);
  if (!result.success) {
    redirect('/countries');
  }

  const { items: countries, totalCount } = result.data;

  return (
    <div className={'flex flex-1 flex-col gap-6'}>
      <header className={'flex flex-wrap items-center justify-between gap-3'}>
        <div className={'flex flex-col'}>
          <h1 className={'text-2xl font-bold'}>Countries</h1>
          <div className={'text-muted-foreground text-xs'}>
            Manage and track the applications you&#39;ve sent, filtered by country
          </div>
        </div>

        {totalCount > 0 && (
          <SegmentedControl
            aria-label="Country filter"
            items={[
              { label: 'All', href: '/countries', count: allCount },
              {
                label: 'Applied',
                href: '/countries?type=applied',
                active: true,
                count: appliedCount,
              },
            ]}
          />
        )}
      </header>

      <main className={'flex flex-1 flex-col gap-6'}>
        {totalCount > 0 && <CountriesToolbar />}

        {totalCount > 0 && (
          <ul role="list" className={'grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4'}>
            {countries.map((country) => (
              <li key={country.id}>
                <CountryItem country={country} />
              </li>
            ))}
          </ul>
        )}

        {totalCount === 0 && <EmptyCountries />}
      </main>

      {totalCount > 0 && (
        <div className={'flex flex-wrap items-center justify-between gap-2 pt-4'}>
          <div className={'text-muted-foreground text-xs'}>
            Displaying {countries.length} of {totalCount} countries
          </div>

          <AppPagination page={page} totalCount={totalCount} hrefForPage={hrefForPage} />
        </div>
      )}
    </div>
  );
};

export default Countries;
