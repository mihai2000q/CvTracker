'use client';

import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';
import { JOB_APPLICATION_STATUSES } from '@/features/job-applications/constants/job-application-statuses.ts';
import type { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

interface Props {
  status: JobApplicationStatus;
  count: number;
  share: number;
}

// The bar of a status, with what it stands for in a tooltip, like the bars of a chart have. The
// numbers are in the text beside it, so it is hidden from a screen reader
const PipelineStatusBar = ({ status, count, share }: Props) => (
  <Tooltip trackCursorAxis="both">
    {/* The padding makes the hit area taller than the thin bar */}
    <TooltipTrigger render={<div className="-my-1 py-1" aria-hidden />}>
      <div className="bg-muted h-2 overflow-hidden rounded-full">
        <div
          data-job-application-status={status}
          className="h-full rounded-full bg-(--status-color)"
          style={{ width: `${share}%` }}
        />
      </div>
    </TooltipTrigger>
    <TooltipContent className="gap-2" showArrow={false}>
      <span
        data-job-application-status={status}
        className="size-2.5 shrink-0 rounded-xs bg-(--status-color)"
      />
      <span className="text-muted-foreground">{JOB_APPLICATION_STATUSES[status]}</span>
      <span className="font-mono font-medium tabular-nums">{count}</span>
    </TooltipContent>
  </Tooltip>
);

export default PipelineStatusBar;
