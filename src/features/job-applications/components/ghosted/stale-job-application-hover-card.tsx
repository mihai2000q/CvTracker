import React from 'react';
import { RiEarthFill } from '@remixicon/react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card.tsx';
import OrganizationAvatar from '@/features/organizations/components/organization/organization-avatar.tsx';
import type { StaleJobApplication } from '@/features/job-applications/types/job-application.ts';

// A card with what the row cuts short, shown when the element it wraps is hovered, the
// organization's avatar: the whole title and organization name, and the country
const StaleJobApplicationHoverCard = ({
  jobApplication,
  children,
}: {
  jobApplication: StaleJobApplication;
  children: React.ReactElement;
}) => {
  return (
    <HoverCard>
      <HoverCardTrigger render={children} />
      <HoverCardContent side={'top'} className={'max-w-80'}>
        <div className={'flex items-center gap-3'}>
          <OrganizationAvatar
            organization={jobApplication.organization}
            variant={'outline'}
            className={'shrink-0'}
          />
          <div className={'flex min-w-0 flex-1 flex-col gap-0.5'}>
            <div className={'text-base leading-tight font-bold'}>{jobApplication.title}</div>
            <div className={'text-muted-foreground text-xs'}>
              {jobApplication.organization.name}
            </div>
            <div className={'text-muted-foreground mt-0.5 flex items-center gap-1 text-xs'}>
              <RiEarthFill className={'size-3.5 shrink-0'} />
              {jobApplication.country.name}
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default StaleJobApplicationHoverCard;
