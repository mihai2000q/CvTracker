import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { RiArrowDownSLine } from '@remixicon/react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible.tsx';
import FlagIcon from '@/features/countries/components/flag-icon.tsx';
import CountryOrganizationsList from '@/features/countries/components/country-organizations-list.tsx';
import CountryJobApplicationsList from '@/features/countries/components/country-job-applications-list.tsx';
import {
  COUNTRY_JOB_APPLICATIONS_PAGE_SIZE,
  COUNTRY_ORGANIZATIONS_PAGE_SIZE,
} from '@/features/countries/constants/country-page.ts';
import { getCountry } from '@/features/countries/queries/get-country.ts';
import { getCountryOrganizations } from '@/features/countries/queries/get-country-organizations.ts';
import { getCountryJobApplications } from '@/features/countries/queries/get-country-job-applications.ts';

const CountryPage = async ({ params }: PageProps<'/countries/[id]'>) => {
  const { id } = await params;

  // The lists don't wait for the country: a missing one is found out together with them.
  // They are the first page of each, and "Show more" loads the rest from the browser
  const [countryResult, organizationsResult, jobApplicationsResult] = await Promise.all([
    getCountry(id),
    getCountryOrganizations({ countryId: id, pageSize: COUNTRY_ORGANIZATIONS_PAGE_SIZE }),
    getCountryJobApplications({ countryId: id, pageSize: COUNTRY_JOB_APPLICATIONS_PAGE_SIZE }),
  ]);
  // An id that isn't one is as missing as one that matches no country
  if (!countryResult.success || !countryResult.data) {
    notFound();
  }
  if (!organizationsResult.success || !jobApplicationsResult.success) {
    redirect('/countries');
  }

  const country = countryResult.data;
  const organizations = organizationsResult.data;
  const { items: jobApplications, totalCount: jobApplicationsCount } = jobApplicationsResult.data;

  return (
    <div className={'flex flex-1 flex-col gap-8'}>
      <header className={'flex flex-col gap-5'}>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href={'/countries'} />}>Countries</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{country.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className={'flex items-center gap-5 max-md:flex-col max-md:text-center'}>
          <FlagIcon
            isoCode={country.isoCode}
            className={'ring-foreground/10 shrink-0 rounded-xl text-7xl shadow-sm ring-1'}
          />
          <div className={'flex flex-col items-start gap-2 max-md:items-center'}>
            <h1 className={'text-3xl leading-none font-bold'}>{country.name}</h1>
            <Badge variant={'primary-alt'} className={'font-bold'}>
              {country.isoCode}
            </Badge>
          </div>
        </div>
      </header>

      <main className={'flex flex-1 flex-col gap-8'}>
        <Section
          title={'Organizations'}
          count={organizations.totalCount}
          empty={'No organizations in this country yet'}
        >
          <CountryOrganizationsList
            country={country}
            initialOrganizations={organizations.items}
            totalCount={organizations.totalCount}
          />
        </Section>

        <Section
          title={'Job Applications'}
          count={jobApplicationsCount}
          empty={'No job applications sent to this country yet'}
        >
          <CountryJobApplicationsList
            countryId={country.id}
            initialJobApplications={jobApplications}
            totalCount={jobApplicationsCount}
          />
        </Section>
      </main>
    </div>
  );
};

interface SectionProps {
  title: string;
  count: number;
  empty: string;
  children: React.ReactNode;
}

const Section = ({ title, count, empty, children }: SectionProps) => (
  <Collapsible defaultOpen render={<section className={'flex flex-col gap-3'} />}>
    <CollapsibleTrigger className={'group/trigger flex w-fit cursor-pointer items-center gap-1.5'}>
      <RiArrowDownSLine
        className={
          'text-muted-foreground size-5 -rotate-90 transition-transform duration-200 group-data-panel-open/trigger:rotate-0'
        }
      />
      <h2 className={'text-lg font-semibold'}>{title}</h2>
      <span className={'text-muted-foreground text-sm tabular-nums'}>{count}</span>
    </CollapsibleTrigger>

    <CollapsibleContent>
      {count > 0 ? (
        children
      ) : (
        <div
          className={
            'text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm'
          }
        >
          {empty}
        </div>
      )}
    </CollapsibleContent>
  </Collapsible>
);

export default CountryPage;
