import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../mongodb';
import { ObjectId } from 'mongodb';

// PUT /api/users/[userId] - Update user role
export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const { role } = await request.json();

    // Validate role
    if (!['admin', 'doctor', 'patient'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin, doctor, or patient' },
        { status: 400 }
      );
    }

    // Validate userId format
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // First check if user exists
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update the user's role
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'User role updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: role
      }
    });
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