import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json();

    console.log('Sign-in attempt for:', { email, role });
    console.log('Password provided (first 5 chars): ', password ? password.substring(0, 5) + '...' : '[empty]');

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let client;
    try {
      client = await clientPromise;
    } catch (error) {
      console.error('MongoDB connection error during sign-in:', error);
      return NextResponse.json({ error: 'Database connection error. Please try again.' }, { status: 503 });
    }

    const db = client.db('healthsync');
    const user = await db.collection('users').findOne({ email, role });

    if (!user) {
      console.log('User not found for:', { email, role });
      return NextResponse.json({ error: 'Invalid email, password, or role' }, { status: 401 });
    }

    console.log('User found. Hashed password in DB (first 5 chars): ', user.password ? user.password.substring(0, 5) + '...' : '[empty]');
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('Password mismatch for:', { email, role });
      return NextResponse.json({ error: 'Invalid email, password, or role' }, { status: 401 });
    }

    console.log('Sign-in successful for:', { email, role });
    return NextResponse.json({ 
      message: 'Sign in successful', 
      name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.fullName || user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name),
      email: user.email,
      role: user.role
    }, { status: 200 });
  } catch (error: any) {
    console.error('Sign-in error:', error);
    if (error.code === 'ECONNRESET') {
      return NextResponse.json({ error: 'Connection error. Please try again.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Internal server error during sign-in' }, { status: 500 });
  }
}
