import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion.tsx';
import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx';
import { Organization } from '@/features/organizations/types/organization.ts';
import { Card } from '@/components/ui/card.tsx';
import OrganizationWebsiteUrl from '@/features/organizations/components/organization/organization-website-url.tsx';
import { RiSendPlaneFill } from '@remixicon/react';
import OrganizationCountryBadge from '@/features/organizations/components/organization/organization-country-badge.tsx';
import OrganizationJobApplicationItem from '@/features/organizations/components/organization/organization-job-application-item.tsx';

interface Props {
  organization: Organization;
}

const OrganizationItem = ({ organization }: Props) => {
  return (
    <Card className={'p-0'}>
      <AccordionItem value={organization.id} key={organization.id}>
        <AccordionTrigger className={'flex gap-4 p-4'}>
          <Avatar className={'size-13 rounded-xl'}>
            <AvatarFallback>
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

              <div className={'text-muted-foreground flex items-center gap-2 pl-3 leading-none'}>
                <RiSendPlaneFill className={'size-3'} />
                <div className={'text-[0.6875rem]'}>
                  {organization.jobApplications.length} applications sent
                </div>
              </div>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className={'dark:bg-background/40'}>
          {organization.jobApplications.length > 0 && (
            <div className={'pt-3 flex flex-col gap-1 px-6'}>
              <div className={'mb-1 text-muted-foreground text-[0.70rem] font-bold uppercase'}>
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
            <div className={'text-muted-foreground pt-4 text-center'}>No job applications sent</div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Card>
  );
};

export default OrganizationItem;
