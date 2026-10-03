import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion.tsx';
import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx';
import { Organization } from '@/features/organizations/types/organization.ts';
import { Card } from '@/components/ui/card.tsx';
import OrganizationWebsiteUrl from '@/features/organizations/components/organization/organization-website-url.tsx';
import { RiSendPlaneFill } from '@remixicon/react';
import OrganizationCountryBadge from '@/features/organizations/components/organization/organization-country-badge.tsx';

interface Props {
  organization: Organization;
}

const OrganizationItem = ({ organization }: Props) => {
  return (
    <Card className={'p-0'}>
      <AccordionItem value={organization.id} key={organization.id}>
        <AccordionTrigger className={'flex gap-4 p-4'}>
          <Avatar className={'size-13 rounded-xl after:rounded-xl'}>
            <AvatarFallback className={'rounded-xl after:rounded-xl'}>
              <span className={'text-lg'}>{organization.name[0]}</span>
            </AvatarFallback>
          </Avatar>
          <div className={'flex flex-col gap-1'}>
            <div className={'flex items-center gap-2'}>
              <div className={'truncate text-lg font-semibold'}>{organization.name}</div>
              {organization.websiteUrl && <OrganizationWebsiteUrl link={organization.websiteUrl} />}
            </div>
            <div className={'flex items-center gap-2'}>
              {organization.countries.map((country) => (
                <OrganizationCountryBadge key={country.id} country={country} />
              ))}

              <div className={'text-muted-foreground flex items-center gap-2 pl-3'}>
                <RiSendPlaneFill className={'size-3'} />
                <div className={'text-[11px]'}>
                  {organization.jobApplications.length} applications sent
                </div>
              </div>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent>
          {organization.jobApplications.map((jobApplication) => (
            <div key={jobApplication.id}>{jobApplication.title}</div>
          ))}

          {organization.jobApplications.length === 0 && (
            <div className={'text-muted-foreground pt-4 text-center'}>No job applications sent</div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Card>
  );
};

export default OrganizationItem;
