import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { RiAddLine } from '@remixicon/react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Card } from '@/components/ui/card.tsx';
import OrganizationActions from '@/features/organizations/components/organization-actions.tsx';
import OrganizationAvatar from '@/features/organizations/components/organization/organization-avatar.tsx';
import OrganizationCountryBadge from '@/features/organizations/components/organization/organization-country-badge.tsx';
import OrganizationWebsiteUrl from '@/features/organizations/components/organization/organization-website-url.tsx';
import OrganizationContactItem from '@/features/organizations/components/contact/organization-contact-item.tsx';
import CreateContactDialog from '@/features/organizations/components/contact/create-contact-dialog.tsx';
import OrganizationJobApplicationsSection from '@/features/organizations/components/organization-job-applications-section.tsx';
import { ORGANIZATION_JOB_APPLICATIONS_PAGE_SIZE } from '@/features/organizations/constants/organization-page.ts';
import { getOrganization } from '@/features/organizations/queries/get-organization.ts';
import { getOrganizationContacts } from '@/features/organizations/queries/get-organization-contacts.ts';
import { getJobApplicationSummaries } from '@/features/job-applications/queries/get-job-application-summaries.ts';

export async function generateMetadata({
  params,
}: PageProps<'/organizations/[id]'>): Promise<Metadata> {
  const { id } = await params;
  // Queries are cached, so the page reuses this lookup. A missing entity gets the page's notFound()
  const result = await getOrganization(id);
  if (!result.success || !result.data) {
    return {};
  }
  const data = result.data;
  return { title: data.name };
}

const OrganizationPage = async ({ params }: PageProps<'/organizations/[id]'>) => {
  const { id } = await params;

  // The contacts and applications don't wait for the organization: a missing one is found out
  // together with them. The applications are the first page, and "Show more" loads the rest
  // from the browser
  const [organizationResult, contactsResult, jobApplicationsResult] = await Promise.all([
    getOrganization(id),
    getOrganizationContacts(id),
    getJobApplicationSummaries({
      organizationId: id,
      pageSize: ORGANIZATION_JOB_APPLICATIONS_PAGE_SIZE,
    }),
  ]);
  // An id that isn't one is as missing as one that matches no organization
  if (!organizationResult.success || !organizationResult.data) {
    notFound();
  }
  if (!contactsResult.success || !jobApplicationsResult.success) {
    redirect('/organizations');
  }

  const organization = organizationResult.data;
  const contacts = contactsResult.data;
  const { items: jobApplications, totalCount } = jobApplicationsResult.data;

  return (
    <div className={'flex flex-1 flex-col gap-6'}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={'/organizations'} />}>Organizations</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{organization.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className={'grid flex-1 items-start gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]'}>
        <Card className={'items-center gap-4 px-5 text-center lg:sticky lg:top-6'}>
          <OrganizationAvatar
            organization={organization}
            className={'size-20 rounded-2xl'}
            letterClassName={'text-3xl'}
          />

          <div className={'flex w-full min-w-0 flex-col items-center gap-2'}>
            <h1 className={'w-full text-2xl leading-tight font-bold break-words'}>
              {organization.name}
            </h1>
            {organization.websiteUrl && <OrganizationWebsiteUrl link={organization.websiteUrl} />}
          </div>

          <div className={'flex flex-wrap items-center justify-center gap-1.5'}>
            {organization.countries.map((country) => (
              <OrganizationCountryBadge key={country.id} country={country} />
            ))}
          </div>

          {organization.notes && (
            <p className={'text-muted-foreground w-full text-left text-sm whitespace-pre-line'}>
              {organization.notes}
            </p>
          )}

          <OrganizationActions organization={organization} />
        </Card>

        <div className={'flex min-w-0 flex-col gap-8'}>
          <section className={'flex flex-col gap-3'}>
            <div className={'flex items-center justify-between gap-2'}>
              <div className={'flex items-baseline gap-1.5'}>
                <h2 className={'text-lg font-semibold'}>Contacts</h2>
                <span className={'text-muted-foreground text-sm tabular-nums'}>
                  {contacts.length}
                </span>
              </div>
              <CreateContactDialog organizationId={organization.id}>
                <Button variant={'ghost'} size={'sm'}>
                  <RiAddLine />
                  Add contact
                </Button>
              </CreateContactDialog>
            </div>

            {contacts.length > 0 ? (
              <ul
                role="list"
                className={'grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3'}
              >
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    <OrganizationContactItem contact={contact} organizationId={organization.id} />
                  </li>
                ))}
              </ul>
            ) : (
              <div
                className={
                  'text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm'
                }
              >
                No contacts at this organization yet
              </div>
            )}
          </section>

          <OrganizationJobApplicationsSection
            organizationId={organization.id}
            initialJobApplications={jobApplications}
            totalCount={totalCount}
          />
        </div>
      </div>
    </div>
  );
};

export default OrganizationPage;
