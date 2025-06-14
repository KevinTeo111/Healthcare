import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '../../mongodb';

export async function PUT(
  request: Request,
  context: { params: { requestId: string } }
) {
  try {
    const { requestId } = context.params;
    const { status } = await request.json();

    if (!['accepted', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status provided' }, { status: 400 });
    }

    if (!ObjectId.isValid(requestId)) {
      return NextResponse.json({ error: 'Invalid request ID format' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('prescriptionApp');

    const result = await db.collection('appointmentRequests').updateOne(
      { _id: new ObjectId(requestId) },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Appointment request not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Appointment request status updated successfully' });

  } catch (error: any) {
    console.error('Error updating appointment request status:', error);
    return NextResponse.json({ error: error.message || 'Failed to update appointment request status' }, { status: 500 });
  }
}
