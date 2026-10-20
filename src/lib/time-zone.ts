export const TIME_ZONE_COOKIE_NAME = 'time-zone';

export const DEFAULT_TIME_ZONE = 'UTC';

export const isTimeZone = (value: string) => {
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: value });
    return true;
  } catch {
    return false;
  }
};
