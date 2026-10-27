import { NextResponse } from 'next/server';
import { token } from './lib/auth';

export async function middleware(req) {
  if (req.nextUrl.pathname === '/login') return NextResponse.next();
  const ok = req.cookies.get('pena')?.value === (await token());
  return ok ? NextResponse.next() : NextResponse.redirect(new URL('/login', req.url));
}

export const config = { matcher: ['/((?!_next|favicon.ico|icon.svg|manifest.webmanifest).*)'] };
