import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password, role } = await request.json();
    console.log('Signup attempt:', { email, role, name: `${firstName} ${lastName}` });

    if (!firstName || !lastName || !email || !password || !role) {
      console.log('Missing fields:', { 
        firstName: !!firstName, 
        lastName: !!lastName, 
        email: !!email, 
        password: !!password, 
        role: !!role 
      });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let client;
    try {
      client = await clientPromise;
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection error during signup:', error);
      return NextResponse.json({ error: 'Database connection error. Please try again.' }, { status: 503 });
    }

    const db = client.db('prescriptionApp');
    console.log('Checking for existing user...');

    const existingUser = await db.collection('users').findOne({ email, role });
    if (existingUser) {
      console.log('User already exists:', { email, role });
      return NextResponse.json({ error: `User with email ${email} and role ${role} already exists` }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    console.log('Creating new user...');
    const newUser = { 
      firstName, 
      lastName, 
      fullName: `${firstName} ${lastName}`, 
      email, 
      password: hashedPassword,
      role,
      createdAt: new Date(),
    };

    await db.collection('users').insertOne(newUser);
    console.log('User created successfully');

    return NextResponse.json({ 
      message: 'User registered successfully',
      name: `${firstName} ${lastName}`,
      email,
      role
    }, { status: 201 });
  } catch (error: any) {
    console.error('Signup error:', error);
    if (error.code === 'ECONNRESET') {
      return NextResponse.json({ error: 'Connection error. Please try again.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Internal server error during signup' }, { status: 500 });
  }
}
