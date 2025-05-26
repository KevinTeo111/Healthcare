import { NextResponse } from 'next/server';
import clientPromise from '../mongodb';

export async function GET(request: Request) {
  // Here, you would normally get the user from a session or JWT token.
  // For demo, try to get user from DB by a hardcoded email (or from cookie in real app)
  // Example: get email from cookie or session (not implemented here)
  // const email = getEmailFromSessionOrCookie(request);
  // For now, just return the first user in DB
  try {
    const client = await clientPromise;
    const db = client.db('prescriptionApp');
    const user = await db.collection('users').findOne({});
    if (user) {
      return NextResponse.json({ name: user.fullName });
    } else {
      return NextResponse.json({ name: 'Guest' });
    }
  } catch (e) {
    return NextResponse.json({ name: 'Guest' });
  }
}
