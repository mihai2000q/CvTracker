import React, { CSSProperties } from 'react';
import { cn } from '@/lib/utils.ts';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion.tsx';
import OrganizationAvatar, {
  getOrganizationHue,
} from '@/features/organizations/components/organization/organization-avatar.tsx';
import { Organization } from '@/features/organizations/types/organization.ts';
import { Card } from '@/components/ui/card.tsx';
import OrganizationWebsiteUrl from '@/features/organizations/components/organization/organization-website-url.tsx';
import { RiSendPlaneFill } from '@remixicon/react';
import OrganizationCountryBadge from '@/features/organizations/components/organization/organization-country-badge.tsx';
import OrganizationContextMenu from '@/features/organizations/components/organization-context-menu.tsx';
import OrganizationJobApplicationItem from '@/features/organizations/components/organization/organization-job-application-item.tsx';

interface Props {
  organization: Organization;
}

// How many country badges show per breakpoint, in ascending order
const VISIBLE_COUNTRIES = [
  { count: 1, showFrom: 'inline-flex', hideFrom: 'sm:hidden' },
  { count: 2, showFrom: 'hidden sm:inline-flex', hideFrom: 'md:hidden' },
  { count: 3, showFrom: 'hidden md:inline-flex', hideFrom: 'xl:hidden' },
  { count: 5, showFrom: 'hidden xl:inline-flex', hideFrom: '2xl:hidden' },
  { count: 7, showFrom: 'hidden 2xl:inline-flex', hideFrom: '' },
];

const MAX_COUNTRIES = VISIBLE_COUNTRIES[VISIBLE_COUNTRIES.length - 1].count;

const OrganizationItem = ({ organization }: Props) => {
  const countries = organization.countries;
  const badgeShowFrom = (index: number) =>
    VISIBLE_COUNTRIES.find(({ count }) => index < count)!.showFrom;

  return (
    <OrganizationContextMenu
      organization={organization}
      jobApplicationsCount={organization.jobApplications.length}
    >
      <Card className={'p-0'}>
        <AccordionItem
          value={organization.id}
          key={organization.id}
          style={{ '--org-hue': getOrganizationHue(organization.id) } as CSSProperties}
          className={cn(
            '[--org-color:oklch(0.45_0.15_var(--org-hue))] dark:[--org-color:oklch(0.7_0.14_var(--org-hue))]',
            'data-open:after:ring-[oklch(0.58_0.15_var(--org-hue)_/_0.7)]'
          )}
        >
          <div className={'relative'}>
            {/* The trigger is an overlay, so the links below are siblings instead of nested in the button */}
            <AccordionTrigger className={'absolute inset-0 px-4 py-0'}>
              <span className={'sr-only'}>{organization.name}</span>
            </AccordionTrigger>

            <div className={'pointer-events-none relative flex items-center gap-4 p-4 pr-12'}>
              <OrganizationAvatar organization={organization} />
              <div className={'flex min-w-0 flex-1 flex-col gap-1'}>
                <div className={'flex min-w-0 items-center gap-2'}>
                  <div className={'truncate text-lg font-semibold'}>{organization.name}</div>
                  {organization.websiteUrl && (
                    <OrganizationWebsiteUrl link={organization.websiteUrl} />
                  )}
                </div>
                <div className={'flex flex-wrap items-center gap-x-2 gap-y-1.5'}>
                  {countries.slice(0, MAX_COUNTRIES).map((country, index) => (
                    <OrganizationCountryBadge
                      key={country.id}
                      country={country}
                      className={badgeShowFrom(index)}
                    />
                  ))}
                  {VISIBLE_COUNTRIES.filter(({ count }) => countries.length > count).map(
                    ({ count, showFrom, hideFrom }) => (
                      <span
                        key={count}
                        title={countries
                          .slice(count)
                          .map((country) => country.name)
                          .join(', ')}
                        className={cn(
                          'bg-muted/50 text-muted-foreground pointer-events-auto rounded-sm border px-2 py-1 text-[0.6875rem] leading-none',
                          showFrom,
                          hideFrom
                        )}
                      >
                        +{countries.length - count} more
                      </span>
                    )
                  )}

                  <div
                    className={cn(
                      'flex items-center gap-2 pl-1 leading-none',
                      organization.jobApplications.length > 0
                        ? 'text-[color:var(--org-color)]'
                        : 'text-muted-foreground'
                    )}
                  >
                    <RiSendPlaneFill className={'size-3'} />
                    <div className={'text-[0.6875rem]'}>
                      {organization.jobApplications.length}{' '}
                      {organization.jobApplications.length === 1 ? 'application' : 'applications'}{' '}
                      sent
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <AccordionContent className={'dark:bg-background/40'}>
            {organization.jobApplications.length > 0 && (
              <div className={'flex flex-col gap-1 px-6 pt-3'}>
                <div className={'text-muted-foreground mb-1 text-[0.70rem] font-bold uppercase'}>
                  ATTACHED JOBS
                </div>
                {organization.jobApplications.map((jobApplication) => (
                  <OrganizationJobApplicationItem
                    key={jobApplication.id}
                    jobApplication={jobApplication}
                  />
                ))}
              </div>
            )}

            {organization.jobApplications.length === 0 && (
              <div className={'text-muted-foreground pt-4 text-center'}>
                No job applications sent
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Card>
    </OrganizationContextMenu>
  );
};

export default OrganizationItem;
