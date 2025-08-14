import { NextRequest, NextResponse } from 'next/server';

const primaryDomain = (
  process.env.PRIMARY_DOMAIN ?? 'localhost:3000'
).toLowerCase();

export function middleware(req: NextRequest) {
  const host = req.headers.get('host')?.toLowerCase() ?? primaryDomain;
  const isPrimary = host === primaryDomain;

  if (!isPrimary) {
    // subdomain or custom domain
    const url = req.nextUrl.clone();
    url.pathname = `/s${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth|public).*)'],
};
