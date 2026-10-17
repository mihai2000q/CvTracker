import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import FlagIcon from '@/features/countries/components/flag-icon.tsx';
import CountryOrganizationsSection from '@/features/countries/components/country-organizations-section.tsx';
import CountryJobApplicationsSection from '@/features/countries/components/country-job-applications-section.tsx';
import {
  COUNTRY_JOB_APPLICATIONS_PAGE_SIZE,
  COUNTRY_ORGANIZATIONS_PAGE_SIZE,
} from '@/features/countries/constants/country-page.ts';
import { getCountry } from '@/features/countries/queries/get-country.ts';
import { getCountryOrganizations } from '@/features/countries/queries/get-country-organizations.ts';
import { getJobApplicationSummaries } from '@/features/job-applications/queries/get-job-application-summaries.ts';

const CountryPage = async ({ params }: PageProps<'/countries/[id]'>) => {
  const { id } = await params;

  const [countryResult, organizationsResult, jobApplicationsResult] = await Promise.all([
    getCountry(id),
    getCountryOrganizations({ countryId: id, pageSize: COUNTRY_ORGANIZATIONS_PAGE_SIZE }),
    getJobApplicationSummaries({ countryId: id, pageSize: COUNTRY_JOB_APPLICATIONS_PAGE_SIZE }),
  ]);
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
        <CountryOrganizationsSection
          country={country}
          initialOrganizations={organizations.items}
          totalCount={organizations.totalCount}
        />

        <CountryJobApplicationsSection
          countryId={country.id}
          initialJobApplications={jobApplications}
          totalCount={jobApplicationsCount}
        />
      </main>
    </div>
  );
};

export default CountryPage;
