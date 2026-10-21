import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth/session.ts';

export function GET(request: Request) {
  const response = NextResponse.redirect(new URL('/sign-in', request.url));
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
