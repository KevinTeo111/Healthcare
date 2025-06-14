import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/app/api/mongodb'; // Adjust path as needed

export async function PUT(
  request: Request,
  { params }: { params: { requestId: string } }
) {
  const { requestId } = params;

  try {
    // Validate ObjectId
    if (!ObjectId.isValid(requestId)) {
      return NextResponse.json(
        { error: 'Invalid request ID format' },
        { status: 400 }
      );
    }

    // Parse JSON body
    const body = await request.json();
    const status = body?.status;

    // Validate status
    const validStatuses = ['accepted', 'rejected', 'pending'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('prescriptionApp');

    const result = await db.collection('appointmentRequests').updateOne(
      { _id: new ObjectId(requestId) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Appointment request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Appointment request status updated successfully',
    });

  } catch (err: any) {
    console.error('PUT /appointment-requests error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
