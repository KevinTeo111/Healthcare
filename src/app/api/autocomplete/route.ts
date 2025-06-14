import { NextResponse } from 'next/server';
import clientPromise from '../mongodb';
import { Document } from 'mongodb';

interface User {
  name: string;
  email: string;
  specialization?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const type = searchParams.get('type'); // 'doctor' or 'patient'

    if (!query || !type) {
      return NextResponse.json(
        { error: 'Query and type parameters are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('healthsync');

    let results: User[] = [];
    if (type === 'doctor') {
      const docs = await db.collection('users')
        .find({
          role: 'doctor',
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        })
        .project({ name: 1, email: 1, specialization: 1 })
        .limit(10)
        .toArray();
      results = docs as unknown as User[];
    } else if (type === 'patient') {
      const docs = await db.collection('users')
        .find({
          role: 'patient',
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        })
        .project({ name: 1, email: 1 })
        .limit(10)
        .toArray();
      results = docs as unknown as User[];
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('GET /api/autocomplete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch autocomplete results' },
      { status: 500 }
    );
  }
}
