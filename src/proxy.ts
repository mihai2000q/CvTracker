import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@database/db.ts';
import { uuid } from '@database/field-values.ts';
import { createAuthToken, verifyAuthToken } from '@/lib/auth/jwt.ts';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '@/lib/auth/session.ts';

const PUBLIC_ROUTES = ['/sign-in', '/sign-up'];

// Clears the cookie of a user that no longer exists, so it has to be reachable without a session
const SESSION_CLEAR_ROUTE = '/api/session/clear';

// auth: redirects based on real session validity
// and rotates an expiring-but-refreshable token
export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === SESSION_CLEAR_ROUTE) {
    return NextResponse.next();
  }

  const isPublicRoute = PUBLIC_ROUTES.includes(path);
  const isApiRoute = path.startsWith('/api/');
  // A fetch would follow a redirect to the sign-in page and get HTML back, so an API route says
  // it plainly
  const unauthorized = () =>
    isApiRoute
      ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      : NextResponse.redirect(new URL('/sign-in', request.url));

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const result = token ? await verifyAuthToken(token) : ({ status: 'invalid' } as const);

  if (result.status === 'invalid') {
    return isPublicRoute ? NextResponse.next() : unauthorized();
  }

  if (isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (result.status !== 'expired' || !result.payload.sub) {
    return NextResponse.next();
  }

  const user = await db.User.first({ id: uuid(result.payload.sub) });
  if (!user) {
    return unauthorized();
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg).*)'],
};
