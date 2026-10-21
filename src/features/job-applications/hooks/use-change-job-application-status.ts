'use client';

import { toast } from '@/components/ui/toast.tsx';
import { useResultTransition } from '@/hooks/use-result-transition.ts';
import { changeJobApplicationStatus } from '@/features/job-applications/actions/change-job-application-status.ts';
import {
  describeStatusChange,
  NO_STATUS_CHANGE_EFFECT,
} from '@/features/job-applications/constants/job-application-statuses.ts';
import { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';

interface Options {
  jobApplicationId: string;
  currentStatus?: JobApplicationStatus;
  title?: string;
}

export function useChangeJobApplicationStatus({ jobApplicationId, currentStatus, title }: Options) {
  const [isPending, run] = useResultTransition();

  function changeStatus(status: JobApplicationStatus, note?: string) {
    if (status === currentStatus) return;
    run(() => changeJobApplicationStatus({ jobApplicationId, status, note }), {
      onSuccess: (data) => {
        const description = describeStatusChange(status, data ?? NO_STATUS_CHANGE_EFFECT);
        toast.add({
          type: 'success',
          title: 'Status changed',
          description: title ? `${title}: ${description}` : description,
        });
      },
    });
  }

  return [isPending, changeStatus] as const;
}
