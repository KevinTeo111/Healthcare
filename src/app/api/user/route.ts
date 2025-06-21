import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../mongodb';
import { connectToDatabase } from '../mongodb';
import { ObjectId, WithId, Document } from 'mongodb';

// GET /api/user?email=... (single user) or /api/user (all users)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (email) {
      // Fetch single user by email
      let client;
      try {
        client = await clientPromise;
      } catch (error) {
        return NextResponse.json({ error: 'Database connection error' }, { status: 503 });
      }
      const db = client.db('prescriptionApp');
      const user = await db.collection('users').findOne(
        { email },
        { projection: { password: 0 } }
      );
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      const responseData = {
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.fullName || user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name),
        email: user.email,
        role: user.role
      };
      return NextResponse.json(responseData);
    } else {
      // Fetch all users
      let retryCount = 0;
      const maxRetries = 3;
      while (retryCount < maxRetries) {
        try {
          const { db } = await connectToDatabase('prescriptionApp');
          const collections = await db.listCollections().toArray();
          const hasUsersCollection = collections.some(c => c.name === 'users');
          if (!hasUsersCollection) {
            await db.createCollection('users');
            return NextResponse.json([]);
          }
          const users = await db.collection('users').find({}).toArray();
          const sanitizedUsers = users.map((user: WithId<Document>) => {
            try {
              return {
                _id: user._id,
                firstName: user.firstName as string || '',
                lastName: user.lastName as string || '',
                fullName: user.fullName as string || '',
                email: user.email as string || '',
                role: user.role as string || 'patient',
                createdAt: user.createdAt as string || new Date().toISOString()
              };
            } catch (err) {
              return null;
            }
          }).filter(Boolean);
          return NextResponse.json(sanitizedUsers);
        } catch (error) {
          retryCount++;
          if (retryCount === maxRetries) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return NextResponse.json(
              { error: 'Failed to fetch users', details: errorMessage, attempts: retryCount },
              { status: 500 }
            );
          }
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
      }
      return NextResponse.json(
        { error: 'Failed to fetch users after multiple attempts' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

// POST /api/user (add new user)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db('prescriptionApp');
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to add user', details: errorMessage }, { status: 500 });
  }
}

// DELETE /api/user?email=... (delete user by email)
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to delete user', details: errorMessage }, { status: 500 });
  }
}
