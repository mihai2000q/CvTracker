import React from 'react';
import { RiExternalLinkLine } from '@remixicon/react';
import { Card } from '@/components/ui/card.tsx';
import PastDate from '@/components/date/past-date.tsx';
import JobApplicationSourceIcon from '@/features/job-applications/components/source/job-application-source-icon.tsx';
import { JobApplicationDetail } from '@/features/job-applications/types/job-application.ts';

const toHostname = (link: string) => {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return link;
  }
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className={'flex items-center justify-between gap-4 text-sm'}>
    <dt className={'text-muted-foreground shrink-0'}>{label}</dt>
    <dd className={'flex min-w-0 items-center justify-end gap-1.5 text-right font-medium'}>
      {children}
    </dd>
  </div>
);

const JobApplicationDetailsCard = ({
  jobApplication,
}: {
  jobApplication: JobApplicationDetail;
}) => (
  <Card className={'gap-3 p-5'}>
    <h2 className={'text-muted-foreground text-[0.70rem] font-bold uppercase'}>Details</h2>
    <dl className={'flex flex-col gap-2.5'}>
      <Row label={'Applied'}>
        <PastDate date={jobApplication.appliedAt} />
      </Row>
      <Row label={'Source'}>
        {jobApplication.source ? (
          <>
            <JobApplicationSourceIcon
              source={jobApplication.source}
              colored
              className={'mb-1 size-3.5'}
            />
            <span className={'truncate'}>{jobApplication.source}</span>
          </>
        ) : (
          <span className={'text-muted-foreground font-normal italic'}>Not set</span>
        )}
      </Row>
      <Row label={'Posting'}>
        {jobApplication.postingUrl ? (
          <a
            href={jobApplication.postingUrl}
            target={'_blank'}
            rel={'noopener noreferrer'}
            title={jobApplication.postingUrl}
            className={'link-underline flex min-w-0 items-center gap-1'}
          >
            <span className={'truncate'}>{toHostname(jobApplication.postingUrl)}</span>
            <RiExternalLinkLine className={'size-3.5 shrink-0'} />
          </a>
        ) : (
          <span className={'text-muted-foreground font-normal italic'}>Not set</span>
        )}
      </Row>
    </dl>
  </Card>
);

export default JobApplicationDetailsCard;
