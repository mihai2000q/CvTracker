import React from 'react';
import Link from 'next/link';
import { RiLink, RiSendPlaneFill } from '@remixicon/react';
import { Card } from '@/components/ui/card.tsx';
import { cn } from '@/lib/utils.ts';
import OrganizationAvatar from '@/features/organizations/components/organization/organization-avatar.tsx';
import OrganizationContextMenu from '@/features/organizations/components/organization-context-menu.tsx';
import type { CountrySummary } from '@/features/countries/types/country.ts';
import type { CountryOrganization } from '@/features/countries/types/country-organization.ts';

interface Props {
  organization: CountryOrganization;
  country: CountrySummary;
}

const CountryOrganizationItem = ({ organization, country }: Props) => {
  const count = organization.jobApplicationsCount;

  return (
    <OrganizationContextMenu
      organization={{ ...organization, countries: [country] }}
      jobApplicationsCount={organization.totalJobApplicationsCount}
    >
      <Card
        className={cn(
          'relative flex-row items-center gap-3 p-3',
          'hover:bg-muted hover:border-muted-foreground/50 transition-colors duration-125',
          'has-[a:focus-visible]:ring-ring has-[a:focus-visible]:ring-2'
        )}
      >
        <OrganizationAvatar organization={organization} className={'size-11'} />
        <div className={'flex min-w-0 flex-1 flex-col gap-1'}>
          <Link
            href={`/organizations/${organization.id}`}
            prefetch={false}
            title={organization.name}
            className={'truncate font-semibold outline-none after:absolute after:inset-0'}
          >
            {organization.name}
          </Link>
          <div className={'text-muted-foreground flex items-center gap-3 text-[0.6875rem]'}>
            <span className={'flex shrink-0 items-center gap-1 leading-none'}>
              <RiSendPlaneFill className={'size-3'} />
              {count} {count === 1 ? 'application' : 'applications'}
            </span>
          </div>
        </div>
        {organization.websiteUrl && (
          <a
            href={organization.websiteUrl}
            target={'_blank'}
            rel={'noopener noreferrer'}
            aria-label={`Open ${organization.name}'s website`}
            title={organization.websiteUrl}
            className={
              'text-muted-foreground/60 hover:text-foreground relative z-10 shrink-0 self-start transition-colors'
            }
          >
            <RiLink className={'size-4'} />
          </a>
        )}
      </Card>
    </OrganizationContextMenu>
  );
};

export default CountryOrganizationItem;
