'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { Label, Pie, PieChart, Sector, type PieSectorShapeProps } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart.tsx';
import JobApplicationStatusIndicator from '@/features/job-applications/components/status/job-application-status-indicator.tsx';
import { JOB_APPLICATION_STATUSES } from '@/features/job-applications/constants/job-application-statuses.ts';
import { cn } from '@/lib/utils.ts';
import type { JobApplicationStatus } from '@/features/job-applications/types/enums/job-application-status.ts';
import type { StatusCount } from '@/features/dashboard/types/dashboard-stats.ts';

// The colours the statuses have everywhere else, from the theme
const STATUS_COLORS: Record<string, string> = {
  applied: 'var(--color-status-applied)',
  screening: 'var(--color-status-screening)',
  interview: 'var(--color-status-interview)',
  offer: 'var(--color-status-offer)',
  rejected: 'var(--color-status-rejected)',
  withdrawn: 'var(--color-status-withdrawn)',
  no_response: 'var(--color-status-no-response)',
};

const chartConfig = Object.fromEntries(
  Object.entries(JOB_APPLICATION_STATUSES).map(([status, label]) => [
    status,
    { label, color: STATUS_COLORS[status] },
  ])
) satisfies ChartConfig;

// How far the tooltip sits from the cursor
const TOOLTIP_OFFSET = 10;

// How long a status stays in focus after the pointer leaves it, so that moving quickly over
// several of them doesn't have the ring flicker from one to the next
const UNFOCUS_DELAY_MS = 100;

// The status in focus, which the slices and the centre of the ring read from here. The chart can't
// be given it as a prop: it takes new props for new data, and draws its slices all over again, so
// that they would never get to transition from one state to the next
const ActiveStatusContext = createContext<JobApplicationStatus | null>(null);

// A slice grows when it is the one in focus and the others shrink back and fade, from the centre
// of the chart. Where the user prefers no motion there is none of it
const sliceClassName = (status: string, active: JobApplicationStatus | null) =>
  cn(
    'origin-center cursor-pointer [transform-box:view-box] transition-[scale,opacity] duration-150',
    'motion-reduce:scale-100 motion-reduce:opacity-100 motion-reduce:transition-none',
    active !== null && (active === status ? 'scale-[1.06]' : 'scale-[0.96] opacity-60')
  );

const Slice = (props: PieSectorShapeProps) => {
  const active = useContext(ActiveStatusContext);
  return <Sector {...props} className={sliceClassName(props.payload.status, active)} />;
};

// Defined here, not where the chart is, so that it is the same function every time
const renderSlice = (props: PieSectorShapeProps) => <Slice {...props} />;

interface CenterProps {
  cx: number;
  cy: number;
  total: number;
  counts: StatusCount[];
}

// The total, or the count of the status in focus
const Center = ({ cx, cy, total, counts }: CenterProps) => {
  const active = useContext(ActiveStatusContext);
  const count = counts.find(({ status }) => status === active)?.count;

  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} y={cy} className="fill-foreground text-3xl font-semibold">
        {active === null ? total : count}
      </tspan>
      <tspan x={cx} y={cy + 22} className="fill-muted-foreground text-xs">
        {active === null ? 'Applications' : JOB_APPLICATION_STATUSES[active]}
      </tspan>
    </text>
  );
};

interface Props {
  data: StatusCount[];
  total: number;
}

// The statuses as a ring and as the list beside it. The one the pointer is on, in either, is the
// one in focus in both
const OutcomesChart = ({ data, total }: Props) => {
  const [active, setActive] = useState<JobApplicationStatus | null>(null);
  // The tooltip would stay at the middle of the slice it is over, so it is the cursor's instead
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>();

  const unfocusTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const cancelUnfocus = useCallback(() => clearTimeout(unfocusTimeout.current), []);
  useEffect(() => cancelUnfocus, [cancelUnfocus]);

  const focus = useCallback(
    (status: JobApplicationStatus) => {
      cancelUnfocus();
      setActive(status);
    },
    [cancelUnfocus]
  );
  const unfocus = useCallback(() => {
    cancelUnfocus();
    unfocusTimeout.current = setTimeout(() => setActive(null), UNFOCUS_DELAY_MS);
  }, [cancelUnfocus]);

  // Kept as it is while the status in focus changes, for what is said above
  const pie = useMemo(
    () => (
      <Pie
        data={data.map(({ status, count }) => ({
          status,
          count,
          fill: `var(--color-${status})`,
        }))}
        dataKey="count"
        nameKey="status"
        innerRadius="56%"
        outerRadius="88%"
        paddingAngle={3}
        cornerRadius={3}
        stroke="none"
        onMouseEnter={(_, index) => focus(data[index].status)}
        onMouseLeave={unfocus}
        shape={renderSlice}
      >
        <Label
          content={({ viewBox }) =>
            viewBox && 'cx' in viewBox ? (
              <Center cx={viewBox.cx ?? 0} cy={viewBox.cy ?? 0} total={total} counts={data} />
            ) : null
          }
        />
      </Pie>
    ),
    [data, total, focus, unfocus]
  );

  return (
    <ActiveStatusContext.Provider value={active}>
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square h-52"
        // Leaving the chart, from a slice or from the ring around, puts nothing in focus
        onMouseLeave={unfocus}
      >
        <PieChart
          accessibilityLayer
          onMouseMove={(_, event) => {
            const { left, top } = event.currentTarget.getBoundingClientRect();
            setTooltipPosition({
              x: event.clientX - left + TOOLTIP_OFFSET,
              y: event.clientY - top + TOOLTIP_OFFSET,
            });
          }}
        >
          <ChartTooltip
            // Without the animation it doesn't slide in from the top left corner
            isAnimationActive={false}
            position={tooltipPosition}
            content={<ChartTooltipContent hideLabel nameKey="status" />}
          />
          {pie}
        </PieChart>
      </ChartContainer>

      <ul className="flex flex-col gap-1">
        {data.map(({ status, count }) => (
          <li key={status}>
            <Link
              href={`/jobs?f=status:eq:${status}`}
              prefetch={false}
              onMouseEnter={() => focus(status)}
              onMouseLeave={unfocus}
              onFocus={() => focus(status)}
              onBlur={unfocus}
              className={cn(
                'hover:bg-accent/60 focus-visible:ring-ring/50 flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-[background-color,opacity] outline-none focus-visible:ring-3',
                active === status && 'bg-accent/60',
                active !== null && active !== status && 'opacity-60'
              )}
            >
              <JobApplicationStatusIndicator status={status} />
              <span className="flex-1">{JOB_APPLICATION_STATUSES[status]}</span>
              <span className="text-muted-foreground tabular-nums">{count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </ActiveStatusContext.Provider>
  );
};

export default OutcomesChart;
