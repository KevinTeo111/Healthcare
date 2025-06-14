import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting signup process...');
    const { firstName, lastName, email, password, role } = await request.json();
    console.log('Received signup request for:', { email, role });

    if (!firstName || !lastName || !email || !password || !role) {
      console.log('Missing required fields:', { firstName, lastName, email, role });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('Connecting to database...');
    const { db } = await connectToDatabase();
    console.log('Connected to database successfully');

    // Check if user already exists
    console.log('Checking for existing user...');
    const existingUser = await db.collection('users').findOne({ email, role });
    if (existingUser) {
      console.log('User already exists:', { email, role });
      return NextResponse.json({ error: `User with email ${email} and role ${role} already exists` }, { status: 409 });
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    console.log('Creating new user...');
    const result = await db.collection('users').insertOne({ 
      firstName, 
      lastName, 
      fullName: `${firstName} ${lastName}`,
      email, 
      password: hashedPassword, 
      role,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('User created successfully:', { userId: result.insertedId });

    return NextResponse.json({ 
      message: 'User registered successfully',
      name: `${firstName} ${lastName}`,
      email,
      role
    }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return NextResponse.json({ 
      error: 'Internal server error during signup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
