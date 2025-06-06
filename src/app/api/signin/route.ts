import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../mongodb';

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('prescriptionApp');
    const user = await db.collection('users').findOne({ email, password, role });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email, password, or role' }, { status: 401 });
    }

    return NextResponse.json({ 
      message: 'Sign in successful', 
      name: user.name || user.fullName,
      fullName: user.fullName || user.name,
      email: user.email,
      role: user.role
    }, { status: 200 });
  } catch (error: any) {
    console.error('Sign-in error:', error);
    return NextResponse.json({ error: 'Internal server error during sign-in' }, { status: 500 });
  }
}
