import { NextRequest, NextResponse } from 'next/server';

const PASSWORD = process.env.APP_PASSWORD ?? 'burraco2026';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.startsWith('/favicon') ||
      request.nextUrl.pathname === '/api/auth') {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');

  if (authHeader) {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [_, password] = credentials.split(':');

    if (password === PASSWORD) {
      return NextResponse.next();
    }
  }

  return new NextResponse('Accesso non autorizzato', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Burraco Manager"',
    },
  });
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
