import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../mongodb';
import { connectToDatabase } from '../mongodb';
import { ObjectId, WithId, Document } from 'mongodb';

interface User {
  _id: ObjectId;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
}

// GET /api/users - Get all users
export async function GET() {
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      console.log(`Attempt ${retryCount + 1} to fetch users...`);
      const { db } = await connectToDatabase();
      console.log('Connected to database successfully');

      // Verify the users collection exists
      const collections = await db.listCollections().toArray();
      const hasUsersCollection = collections.some(c => c.name === 'users');
      
      if (!hasUsersCollection) {
        console.log('Users collection does not exist, creating it...');
        await db.createCollection('users');
        console.log('Users collection created successfully');
        return NextResponse.json([]);
      }

      console.log('Fetching users from collection...');
      const users = await db.collection('users').find({}).toArray();
      console.log(`Found ${users.length} users`);
      
      // Remove sensitive information
      const sanitizedUsers = users.map((user: WithId<Document>) => {
        try {
          return {
            _id: user._id,
            firstName: user.firstName as string || '',
            lastName: user.lastName as string || '',
            fullName: user.fullName as string || '',
            email: user.email as string || '',
            role: user.role as string || 'patient', // Default to patient if role is missing
            createdAt: user.createdAt as string || new Date().toISOString()
          };
        } catch (err) {
          console.error('Error processing user:', user, err);
          return null;
        }
      }).filter(Boolean); // Remove any null entries from failed processing

      console.log('Successfully processed users');
      return NextResponse.json(sanitizedUsers);
    } catch (error) {
      console.error(`Attempt ${retryCount + 1} failed:`, error);
      retryCount++;
      
      if (retryCount === maxRetries) {
        console.error('All retry attempts failed');
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json(
          { 
            error: 'Failed to fetch users',
            details: errorMessage,
            attempts: retryCount
          },
          { status: 500 }
        );
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }

  return NextResponse.json(
    { error: 'Failed to fetch users after multiple attempts' },
    { status: 500 }
  );
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

// PUT /api/users/[userId] - Update user role
export async function PUT(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params;
    const { role } = await request.json();

    if (!['admin', 'doctor', 'patient'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        error: 'Failed to update user role',
        details: errorMessage
      },
      { status: 500 }
    );
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
