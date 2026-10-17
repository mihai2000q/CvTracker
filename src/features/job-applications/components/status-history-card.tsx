import React from 'react';
import { Card } from '@/components/ui/card.tsx';
import LocalDateTime from '@/components/date/local-date-time.tsx';
import JobApplicationStatusIndicator from '@/features/job-applications/components/status/job-application-status-indicator.tsx';
import { JOB_APPLICATION_STATUSES } from '@/features/job-applications/constants/job-application-statuses.ts';
import { StatusChange } from '@/features/job-applications/types/job-application.ts';

const StatusHistoryCard = ({ statusHistory }: { statusHistory: StatusChange[] }) => (
  <Card className={'gap-3 p-5'}>
    <h2 className={'text-muted-foreground text-[0.70rem] font-bold uppercase'}>Status history</h2>
    {statusHistory.length > 0 ? (
      <ol role="list" className={'border-border ml-1 flex flex-col gap-4 border-l'}>
        {statusHistory.map((change) => (
          <li key={change.id} className={'relative pl-4'}>
            <JobApplicationStatusIndicator
              status={change.status}
              className={'absolute top-1.5 left-0 -translate-x-1/2 p-1'}
            />
            <div className={'text-sm leading-tight font-medium'}>
              {JOB_APPLICATION_STATUSES[change.status]}
            </div>
            <LocalDateTime
              date={change.changedAt}
              pattern={'dd MMM yyyy, HH:mm'}
              className={'text-muted-foreground text-xs'}
            />
            {change.note && <p className={'text-muted-foreground mt-1 text-xs'}>{change.note}</p>}
          </li>
        ))}
      </ol>
    ) : (
      <p className={'text-muted-foreground text-sm'}>No changes recorded</p>
    )}
  </Card>
);

export default StatusHistoryCard;
