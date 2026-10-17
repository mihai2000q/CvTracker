'use client';

import React, { useState } from 'react';
import { RiAddLine } from '@remixicon/react';
import { Button } from '@/components/ui/button.tsx';
import InterviewRoundItem from '@/features/job-applications/components/interview/interview-round-item.tsx';
import ScheduleInterviewDialog from '@/features/job-applications/components/interview/schedule-interview-dialog.tsx';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import { InterviewRound } from '@/features/job-applications/types/interview-round.ts';

interface Props {
  jobApplication: {
    id: string;
    title: string;
    currentStatus: JobApplicationStatus;
    organization: { id: string; name: string };
  };
  rounds: InterviewRound[];
}

const InterviewRoundsSection = ({ jobApplication, rounds }: Props) => {
  const [scheduleOpen, setScheduleOpen] = useState(false);

  return (
    <section className={'flex flex-col gap-3'}>
      <div className={'flex items-center justify-between gap-2'}>
        <div className={'flex items-baseline gap-1.5'}>
          <h2 className={'text-lg font-semibold'}>Interview Rounds</h2>
          <span className={'text-muted-foreground text-sm tabular-nums'}>{rounds.length}</span>
        </div>
        <Button variant={'ghost'} size={'sm'} onClick={() => setScheduleOpen(true)}>
          <RiAddLine />
          Schedule interview
        </Button>
      </div>

      {rounds.length > 0 ? (
        <ul role="list" className={'flex flex-col gap-3'}>
          {rounds.map((round) => (
            <li key={round.id}>
              <InterviewRoundItem
                round={round}
                jobApplicationId={jobApplication.id}
                organizationId={jobApplication.organization.id}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div
          className={
            'text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm'
          }
        >
          No interviews scheduled yet
        </div>
      )}

      <ScheduleInterviewDialog
        jobApplication={jobApplication}
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
      />
    </section>
  );
};

export default InterviewRoundsSection;
