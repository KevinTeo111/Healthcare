import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password, role } = await request.json();

    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email, role });
    if (existingUser) {
      return NextResponse.json({ error: `User with email ${email} and role ${role} already exists` }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await db.collection('users').insertOne({ 
      firstName, 
      lastName, 
      fullName: `${firstName} ${lastName}`,
      email, 
      password: hashedPassword, 
      role,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ 
      message: 'User registered successfully',
      name: `${firstName} ${lastName}`,
      email,
      role
    }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error during signup' }, { status: 500 });
  }
}
