import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@database/db';
import { uuid } from '@database/field-values';
import { createAuthToken, verifyAuthToken } from '@/lib/jwt';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '@/lib/session';

const PUBLIC_ROUTES = ['/sign-in', '/sign-up'];

// auth: redirects based on real session validity
// and rotates an expiring-but-refreshable token
export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicRoute = PUBLIC_ROUTES.includes(path);

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const result = token ? await verifyAuthToken(token) : ({ status: 'invalid' } as const);

  if (result.status === 'invalid') {
    return isPublicRoute
      ? NextResponse.next()
      : NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (result.status !== 'expired' || !result.payload.sub) {
    return NextResponse.next();
  }

  const user = await db.User.first({ id: uuid(result.payload.sub) });
  if (!user) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  const newToken = await createAuthToken(user);

  // Forward to the request too, so this same request's render/action sees the fresh token.
  request.cookies.set(SESSION_COOKIE_NAME, newToken);

  const response = NextResponse.next({ request });
  response.cookies.set(SESSION_COOKIE_NAME, newToken, sessionCookieOptions);
  return response;
}

// noinspection JSUnusedGlobalSymbols
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
