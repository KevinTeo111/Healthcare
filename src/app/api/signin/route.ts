import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../mongodb';
import bcrypt from 'bcryptjs';
import { signJwt } from '../utils/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json();

    console.log('Sign-in attempt received for:', { email, role });

    if (!email || !password || !role) {
      console.log('Missing required fields:', { 
        hasEmail: !!email, 
        hasPassword: !!password, 
        hasRole: !!role 
      });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let client;
    try {
      client = await clientPromise;
      console.log('MongoDB connection successful');
    } catch (error) {
      console.error('MongoDB connection error during sign-in:', error);
      return NextResponse.json({ error: 'Database connection error. Please try again.' }, { status: 503 });
    }

    const db = client.db('prescriptionApp');
    console.log('Using database:', 'prescriptionApp');

    // First check if user exists
    const user = await db.collection('users').findOne({ email: email.toLowerCase(), role });

    console.log('Database query result:', {
      userFound: !!user,
      email: email.toLowerCase(),
      role,
      foundUserRole: user?.role,
    });

    if (!user) {
      console.log('User not found:', { email: email.toLowerCase(), role });
      return NextResponse.json({ error: 'Invalid email, password, or role' }, { status: 401 });
    }

    // Print first 5 chars of stored password for debugging
    console.log('Stored password type:', typeof user.password);
    console.log('Stored password starts with:', user.password ? user.password.substring(0, 5) : 'null');

    // Handle both hashed and unhashed passwords
    let isPasswordValid = false;
    try {
      if (user.password.startsWith('$2')) {
        // Password is already hashed
        console.log('Comparing hashed password');
        isPasswordValid = await bcrypt.compare(password, user.password);
      } else {
        // Plain text password (temporary)
        console.log('Comparing plain text password');
        isPasswordValid = user.password === password;
        if (isPasswordValid) {
          // Hash the password for future use
          const hashedPassword = await bcrypt.hash(password, 10);
          await db.collection('users').updateOne(
            { _id: user._id },
            { $set: { password: hashedPassword } }
          );
          console.log('Password hashed and updated for future use');
        }
      }
    } catch (error) {
      console.error('Error during password validation:', error);
      return NextResponse.json({ error: 'Error validating password' }, { status: 500 });
    }

    console.log('Password validation result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return NextResponse.json({ error: 'Invalid email, password, or role' }, { status: 401 });
    }

    console.log('Sign-in successful for:', { email, role });
    
    const response = {
      message: 'Sign in successful',
      name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.fullName || user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name),
      email: user.email,
      role: user.role
    };

    // Issue JWT
    const { token, maxAge } = signJwt({
      userId: String(user._id),
      email: user.email,
      role: user.role,
      name: response.name,
    });

    const res = NextResponse.json(response, { status: 200 });
    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });
    console.log('Sending response with JWT cookie');
    return res;
  } catch (error: any) {
    console.error('Sign-in error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during sign-in',
      details: error.message
    }, { status: 500 });
  }
}
