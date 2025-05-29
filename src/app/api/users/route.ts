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
