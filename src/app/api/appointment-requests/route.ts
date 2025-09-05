import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '../mongodb';

// Collection: appointmentRequests

// GET /api/appointment-requests
// Supports filters: email (patient), role, status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    const client = await clientPromise;
    const db = client.db('prescriptionApp');

    const query: any = {};
    if (email) {
      query.requestedBy = email;
    }
    if (status) {
      query.status = status;
    }
    // For admin/doctor views you might want broader visibility; keep as-is for now
    // If role === 'admin' and no specific filter, return recent items

    const requests = await db
      .collection('appointmentRequests')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(requests);
  } catch (error: any) {
    console.error('GET /api/appointment-requests error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch appointment requests' },
      { status: 500 }
    );
  }
}

// POST /api/appointment-requests
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      patientName,
      patientAge,
      patientGender,
      patientBloodGroup,
      preferredDate,
      preferredTime,
      notes,
      requestedBy,
      doctorEmail,
      doctorName
    } = body;

    if (!patientName || !preferredDate || !preferredTime || !requestedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('prescriptionApp');

    const doc = {
      patientName,
      patientAge: patientAge || null,
      patientGender: patientGender || null,
      patientBloodGroup: patientBloodGroup || null,
      preferredDate,
      preferredTime,
      notes: notes || null,
      requestedBy,
      status: 'pending',
      doctorEmail: doctorEmail || null,
      doctorName: doctorName || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('appointmentRequests').insertOne(doc);

    return NextResponse.json({
      message: 'Appointment request submitted',
      request: { ...doc, _id: result.insertedId }
    });
  } catch (error: any) {
    console.error('POST /api/appointment-requests error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit appointment request' },
      { status: 500 }
    );
  }
}

// PUT /api/appointment-requests (bulk/status update by id in body)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { requestId, status, doctorName, doctorEmail, notes } = body;

    if (!requestId || !status) {
      return NextResponse.json(
        { error: 'requestId and status are required' },
        { status: 400 }
      );
    }

    if (!['pending', 'accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
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
    console.error('PUT /api/appointment-requests error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update appointment request' },
      { status: 500 }
    );
  }
}

// DELETE /api/appointment-requests?id=...
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('prescriptionApp');

    const result = await db.collection('appointmentRequests').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Appointment request deleted' });
  } catch (error: any) {
    console.error('DELETE /api/appointment-requests error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete appointment request' },
      { status: 500 }
    );
  }
}



