import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '../../mongodb';

// GET /api/appointment-requests/[requestId]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;
    const client = await clientPromise;
    const db = client.db('prescriptionApp');

    const doc = await db
      .collection('appointmentRequests')
      .findOne({ _id: new ObjectId(requestId) });

    if (!doc) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json(doc);
  } catch (error: any) {
    console.error('GET /api/appointment-requests/[requestId] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch appointment request' },
      { status: 500 }
    );
  }
}

// PUT /api/appointment-requests/[requestId]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;
    const body = await request.json();
    const { status, doctorName, doctorEmail, notes } = body;

    if (!status) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 });
    }

    if (!['pending', 'accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('prescriptionApp');

    const update: any = { status, updatedAt: new Date() };
    if (doctorName) update.doctorName = doctorName;
    if (doctorEmail) update.doctorEmail = doctorEmail;
    if (notes) update.notes = notes;

    const result = await db.collection('appointmentRequests').updateOne(
      { _id: new ObjectId(requestId) },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Appointment request updated' });
  } catch (error: any) {
    console.error('PUT /api/appointment-requests/[requestId] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update appointment request' },
      { status: 500 }
    );
  }
}

// DELETE /api/appointment-requests/[requestId]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;
    const client = await clientPromise;
    const db = client.db('prescriptionApp');

    const result = await db
      .collection('appointmentRequests')
      .deleteOne({ _id: new ObjectId(requestId) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Appointment request deleted' });
  } catch (error: any) {
    console.error('DELETE /api/appointment-requests/[requestId] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete appointment request' },
      { status: 500 }
    );
  }
}



