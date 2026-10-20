'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TIME_ZONE_COOKIE_NAME } from '@/lib/time-zone.ts';

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

const readTimeZoneCookie = () =>
  document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${TIME_ZONE_COOKIE_NAME}=`))
    ?.slice(TIME_ZONE_COOKIE_NAME.length + 1);

// The server can't tell what day it is for the user, so the browser tells it, with a cookie. When
// the cookie is not the browser's time zone, it is set and the page is rendered again with it
const TimeZoneSync = () => {
  const router = useRouter();

  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const current = readTimeZoneCookie();
    if (current && decodeURIComponent(current) === timeZone) return;

    document.cookie = `${TIME_ZONE_COOKIE_NAME}=${encodeURIComponent(timeZone)}; path=/; max-age=${ONE_YEAR_IN_SECONDS}; samesite=lax`;
    router.refresh();
  }, [router]);

  return null;
};

export default TimeZoneSync;
