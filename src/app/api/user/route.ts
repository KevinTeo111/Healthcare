import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const client = await clientPromise;
    const db = client.db('prescriptionApp');
    let user;
    if (email) {
      user = await db.collection('users').findOne({ email });
    } else {
      user = await db.collection('users').findOne();
    }
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const firstName = user.firstName || (user.fullName ? user.fullName.split(' ')[0] : user.name ? user.name.split(' ')[0] : '');

    return NextResponse.json({
      name: user.name || user.fullName || '',
      firstName: firstName,
      email: user.email || '',
      password: user.password || '',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
