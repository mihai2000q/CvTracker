import { z } from 'zod';

export const getDashboardStatsQuerySchema = z.object({
  from: z.iso.date().nullable(),
  to: z.iso.date().nullable(),
  today: z.iso.date(),
});

export type GetDashboardStatsQueryInput = z.input<typeof getDashboardStatsQuerySchema>;
