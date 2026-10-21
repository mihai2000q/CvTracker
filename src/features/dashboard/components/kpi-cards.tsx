import React from 'react';
import Link from 'next/link';
import { RiInformationLine } from '@remixicon/react';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card.tsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';
import {
  IN_PROGRESS_STATUSES,
  JOB_APPLICATION_STATUSES,
} from '@/features/job-applications/constants/job-application-statuses.ts';
import type { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import { getDashboardStats } from '@/features/dashboard/queries/get-dashboard-stats.ts';
import type { DashboardKpis } from '@/features/dashboard/types/dashboard-stats.ts';
import type { DashboardPeriod } from '@/features/dashboard/types/dashboard-filtering.ts';

interface KpiCardProps {
  title: string;
  value: string | number;
  detail: string;
  href?: string;
  // What the card means, in a tooltip next to its title
  hint?: string;
}

const KpiCard = ({ title, value, detail, href, hint }: KpiCardProps) => {
  const card = (
    <Card size="sm" className={href ? 'hover:bg-accent/40 h-full transition-colors' : 'h-full'}>
      <CardHeader>
        <CardDescription className="flex items-center gap-1">
          {title}
          {hint && (
            <Tooltip>
              <TooltipTrigger
                aria-label={hint}
                className="text-muted-foreground/70 hover:text-foreground focus-visible:ring-ring/50 rounded-full outline-none focus-visible:ring-3"
              >
                <RiInformationLine className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent>{hint}</TooltipContent>
            </Tooltip>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-1">
        <div className="text-3xl font-semibold tabular-nums">{value}</div>
        <div className="text-muted-foreground text-xs">{detail}</div>
      </CardContent>
    </Card>
  );

  return href ? (
    <Link
      href={href}
      className="focus-visible:ring-ring/50 rounded-xl outline-none focus-visible:ring-3"
    >
      {card}
    </Link>
  ) : (
    card
  );
};

// How the applications of the period compare with the ones of the period before. Without that one,
// it is how many were applied to this month
const describeTotal = ({ total, comparisonTotal, thisMonth }: DashboardKpis) => {
  if (comparisonTotal === null) {
    return thisMonth > 0 ? `+${thisMonth} this month` : 'None yet this month';
  }
  const change = total - comparisonTotal;
  if (change === 0) return 'No change';
  return `${change > 0 ? '+' : '-'}${Math.abs(change)} from last period`;
};

// "Applied, Screening and Interview"
const joinLabels = (statuses: readonly string[]) => {
  const labels = statuses.map((status) => JOB_APPLICATION_STATUSES[status as JobApplicationStatus]);
  return labels.length > 1
    ? `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`
    : labels.join('');
};

const KpiCards = async ({ period }: { period: DashboardPeriod }) => {
  const result = await getDashboardStats(period);
  if (!result.success) {
    throw new Error('The dashboard stats could not be loaded');
  }
  const { kpis } = result.data;

  return (
    <div className="grid gap-4 max-sm:grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
      <KpiCard
        title="Total applications"
        value={kpis.total}
        detail={describeTotal(kpis)}
        href="/jobs"
      />
      <KpiCard
        title="Active"
        hint={`Applications that are still in progress: ${joinLabels(IN_PROGRESS_STATUSES)}`}
        value={kpis.active}
        detail={`${kpis.awaitingReply} awaiting a reply`}
      />
      <KpiCard
        title="Response rate"
        value={`${kpis.responseRate}%`}
        detail={`${kpis.rejectionRate}% rejection rate`}
      />
      <KpiCard
        title="Interviews"
        value={kpis.interviews}
        detail={`${kpis.interviewRate}% interview rate`}
        href="/jobs?f=status:eq:interview"
      />
      <KpiCard
        title="Offers"
        value={kpis.offers}
        detail={`${kpis.offerRate}% offer rate`}
        href="/jobs?f=status:eq:offer"
      />
      <KpiCard
        title="Ghosted"
        value={kpis.ghosted}
        detail={`${kpis.ghostedRate}% of applications`}
        href="/jobs?f=status:eq:no_response"
      />
    </div>
  );
};

export default KpiCards;
