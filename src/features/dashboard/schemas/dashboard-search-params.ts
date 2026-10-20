import type { SearchParamsState } from '@/lib/search-params.ts';
import { z } from 'zod';
import {
  DASHBOARD_RANGES,
  DEFAULT_DASHBOARD_RANGE,
} from '@/features/dashboard/constants/dashboard-filtering.ts';

enum DashboardSearchParam {
  Range = 'r',
  From = 'from',
  To = 'to',
}

const dashboardSearchParamsSchema = z
  .object({
    range: z.enum(DASHBOARD_RANGES).catch(DEFAULT_DASHBOARD_RANGE),
    from: z.iso.date().optional().catch(undefined),
    to: z.iso.date().optional().catch(undefined),
  })
  // Two days in order are a custom range, and a custom range is nothing without them
  .transform(({ range, from, to }) =>
    from && to && from <= to
      ? { range: 'custom' as const, from, to }
      : {
          range: range === 'custom' ? DEFAULT_DASHBOARD_RANGE : range,
          from: undefined,
          to: undefined,
        }
  );

export type DashboardSearchParamsState = z.infer<typeof dashboardSearchParamsSchema>;

export const dashboardSearchParamsState: SearchParamsState<DashboardSearchParamsState> = {
  keys: Object.values(DashboardSearchParam),
  deserialize: (params) =>
    dashboardSearchParamsSchema.parse({
      range: params.get(DashboardSearchParam.Range) ?? undefined,
      from: params.get(DashboardSearchParam.From) ?? undefined,
      to: params.get(DashboardSearchParam.To) ?? undefined,
    }),
  serialize: ({ range, from, to }) =>
    range === 'custom' && from && to
      ? new URLSearchParams({ [DashboardSearchParam.From]: from, [DashboardSearchParam.To]: to })
      : new URLSearchParams({ [DashboardSearchParam.Range]: range }),
};
