import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../mongodb';

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, password, role } = await request.json();

    if (!fullName || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('prescriptionApp');

    const existingUser = await db.collection('users').findOne({ email, role });
    if (existingUser) {
      return NextResponse.json({ error: `User with email ${email} and role ${role} already exists` }, { status: 409 });
    }

    await db.collection('users').insertOne({ fullName, email, password, role });

    return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error during signup' }, { status: 500 });
  }
}
