import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../mongodb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    
    if (!email) {
      console.log('No email provided');
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    console.log('Fetching user data for:', email);

    let client;
    try {
      client = await clientPromise;
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      return NextResponse.json({ error: 'Database connection error' }, { status: 503 });
    }

    const db = client.db('prescriptionApp');
    
    const user = await db.collection('users').findOne(
      { email },
      { projection: { password: 0 } } // Exclude password from the response
    );

    if (!user) {
      console.log('User not found:', email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('User found:', { email, role: user.role });

    const responseData = {
      name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.fullName || user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name),
      email: user.email,
      role: user.role
    };

    console.log('Sending user data:', responseData);
    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
