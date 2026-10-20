'use client';

import React, { useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart.tsx';
import type { TimeBucket } from '@/features/dashboard/types/dashboard-stats.ts';

const chartConfig = {
  count: { label: 'Applications', color: 'var(--chart-2)' },
} satisfies ChartConfig;

// How far the tooltip sits from the cursor, and about how wide it is, which is how far to the left
// of the cursor it goes when there isn't the room for it on the right
const TOOLTIP_OFFSET = 10;
const TOOLTIP_WIDTH = 160;

const ApplicationsOverTimeChart = ({ data }: { data: TimeBucket[] }) => {
  // The tooltip would stay at the middle of the bar it is over, so its x is the cursor's instead
  const [tooltipX, setTooltipX] = useState<number>();

  return (
    <ChartContainer config={chartConfig} className="aspect-auto min-h-64 w-full flex-1">
      <BarChart
        accessibilityLayer
        data={data}
        onMouseMove={(_, event) => {
          const { left, width } = event.currentTarget.getBoundingClientRect();
          const cursorX = event.clientX - left;
          setTooltipX(
            cursorX + TOOLTIP_OFFSET + TOOLTIP_WIDTH > width
              ? cursorX - TOOLTIP_OFFSET - TOOLTIP_WIDTH
              : cursorX + TOOLTIP_OFFSET
          );
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
        <ChartTooltip
          cursor={false}
          // Without the animation it doesn't slide in from the top left corner
          isAnimationActive={false}
          position={{ x: tooltipX }}
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) =>
                (payload[0]?.payload as TimeBucket | undefined)?.fullLabel
              }
            />
          }
        />
        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
};

export default ApplicationsOverTimeChart;
