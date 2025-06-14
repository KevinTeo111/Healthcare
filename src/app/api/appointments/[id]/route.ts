import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '../../mongodb';

// GET /api/appointments/[id] - Get a specific appointment
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid appointment ID' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('prescriptionApp');

    const appointment = await db.collection('appointments').findOne({
      _id: new ObjectId(id)
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error: any) {
    console.error('GET /api/appointments/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch appointment' },
      { status: 500 }
    );
  }
}

// PUT /api/appointments/[id] - Update a specific appointment
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, notes, date, time } = body;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid appointment ID' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('prescriptionApp');

    // If updating date/time, check for conflicts
    if (date && time) {
      const existingAppointment = await db.collection('appointments').findOne({
        _id: { $ne: new ObjectId(id) },
        date: new Date(date),
        time,
        status: { $in: ['pending', 'accepted'] }
      });

      if (existingAppointment) {
        return NextResponse.json(
          { error: 'Time slot is already booked' },
          { status: 409 }
        );
      }
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    if (status) {
      if (!['pending', 'accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (notes) updateData.notes = notes;
    if (date) updateData.date = new Date(date);
    if (time) updateData.time = time;

    const result = await db.collection('appointments').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Appointment updated successfully'
    });
  } catch (error: any) {
    console.error('PUT /api/appointments/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

// DELETE /api/appointments/[id] - Delete a specific appointment
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid appointment ID' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('prescriptionApp');

    const result = await db.collection('appointments').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Appointment deleted successfully'
    });
  } catch (error: any) {
    console.error('DELETE /api/appointments/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete appointment' },
      { status: 500 }
    );
  }
} 