import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '../mongodb';

// GET /api/appointments - Get all appointments with optional filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const client = await clientPromise;
    const db = client.db('prescriptionApp');

    // Build query based on filters
    const query: any = {};
    if (email) {
      query[role === 'doctor' ? 'doctorEmail' : 'patientEmail'] = email;
    }
    if (status) {
      query.status = status;
    }
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const appointments = await db.collection('appointments')
      .find(query)
      .sort({ date: -1, time: 1 })
      .toArray();

    return NextResponse.json(appointments);
  } catch (error: any) {
    console.error('GET /api/appointments error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

// POST /api/appointments - Create a new appointment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      patientEmail,
      doctorEmail,
      patientName,
      doctorName,
      date,
      time,
      reason,
      status = 'pending'
    } = body;

    // Validate required fields
    if (!patientEmail || !doctorEmail || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('prescriptionApp');

    // Check for scheduling conflicts
    const existingAppointment = await db.collection('appointments').findOne({
      doctorEmail,
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

    const appointment = {
      patientEmail,
      doctorEmail,
      patientName,
      doctorName,
      date: new Date(date),
      time,
      reason,
      status,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('appointments').insertOne(appointment);

    return NextResponse.json({
      message: 'Appointment created successfully',
      appointment: { ...appointment, _id: result.insertedId }
    });
  } catch (error: any) {
    console.error('POST /api/appointments error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create appointment' },
      { status: 500 }
    );
  }
}

// PUT /api/appointments - Update appointment status
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { appointmentId, status, notes } = body;

    if (!appointmentId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (notes) {
      updateData.notes = notes;
    }

    const result = await db.collection('appointments').updateOne(
      { _id: new ObjectId(appointmentId) },
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
    console.error('PUT /api/appointments error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

// DELETE /api/appointments - Cancel an appointment
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('id');

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('prescriptionApp');

    const result = await db.collection('appointments').updateOne(
      { _id: new ObjectId(appointmentId) },
      { 
        $set: { 
          status: 'cancelled',
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Appointment cancelled successfully'
    });
  } catch (error: any) {
    console.error('DELETE /api/appointments error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel appointment' },
      { status: 500 }
    );
  }
} 