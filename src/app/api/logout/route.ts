import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Clear authentication cookies or session here
  // For example, clear cookies by setting them with expired date
  // Use absolute URL for redirect
  const baseUrl = req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = NextResponse.redirect(baseUrl + '/auth/signin');
  response.cookies.set('token', '', { maxAge: 0, path: '/' });
  return response;
}
