import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../mongodb';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('prescriptionApp');
    const users = await db.collection('users').find({}).toArray();

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'No users found' }, { status: 404 });
    }

    // Map users to include only necessary fields
    const formattedUsers = users.map(user => ({
      name: user.name || user.fullName || '',
      email: user.email || '',
      password: user.password || '',
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('prescriptionApp');

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const userData = {
      name,
      email,
      password,
      createdAt: new Date(),
    };

    const result = await db.collection('users').insertOne(userData);

    return NextResponse.json({ message: 'User added successfully', id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Error adding user:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to add user', details: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('prescriptionApp');

    const result = await db.collection('users').updateOne(
      { email },
      { $set: { name, password } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to update user', details: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('prescriptionApp');

    const result = await db.collection('users').deleteOne({ email });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to delete user', details: errorMessage }, { status: 500 });
  }
}
