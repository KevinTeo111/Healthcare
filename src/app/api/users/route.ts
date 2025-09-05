import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../mongodb';
import { WithId, Document } from 'mongodb';
import { readTokenFromRequest, verifyJwt } from '../utils/jwt';

// GET /api/users - list all users (requires valid JWT)
export async function GET(request: NextRequest) {
  try {
    // Auth: require valid token
    const token = readTokenFromRequest(request as unknown as Request);
    const decoded = token ? verifyJwt(token) as any : null;
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
              firstName: (user.firstName as string) || '',
              lastName: (user.lastName as string) || '',
              fullName: (user.fullName as string) || '',
              email: (user.email as string) || '',
              role: (user.role as string) || 'patient',
              createdAt: (user.createdAt as string) || new Date().toISOString()
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
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}




