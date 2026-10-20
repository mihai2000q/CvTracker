import { Temporal } from 'temporal-polyfill';

export const TIME_ZONE_COOKIE_NAME = 'time-zone';

export const DEFAULT_TIME_ZONE = 'UTC';

// Today as `YYYY-MM-DD` in a time zone, or in the one of the runtime when left out
export const todayIn = (timeZone?: string) => Temporal.Now.plainDateISO(timeZone).toString();

export const isTimeZone = (value: string) => {
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: value });
    return true;
  } catch {
    return false;
  }
};
