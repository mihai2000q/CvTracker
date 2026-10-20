import 'server-only';
import { cookies } from 'next/headers';
import { DEFAULT_TIME_ZONE, isTimeZone, TIME_ZONE_COOKIE_NAME } from '@/lib/time-zone.ts';

// The time zone of the user's browser, as it told the cookie, or UTC until it has
export async function getTimeZone(): Promise<string> {
  const value = (await cookies()).get(TIME_ZONE_COOKIE_NAME)?.value;
  return value && isTimeZone(value) ? value : DEFAULT_TIME_ZONE;
}
