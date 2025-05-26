import { NextResponse } from 'next/server';

export async function POST() {
  // Clear authentication cookies or session here
  // For example, clear cookies by setting them with expired date
  const response = NextResponse.json({ message: 'Logged out' });
  response.cookies.set('token', '', { maxAge: 0, path: '/' });
  return response;
}
