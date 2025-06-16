import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');

    if (!userEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('prescriptionApp');

    // Get the 5 most recent appointments for the user, regardless of status
    const previousAppointments = await db.collection('appointmentRequests')
      .find({
        requestedBy: userEmail,
      })
      .sort({ preferredDate: -1, preferredTime: -1 })
      .limit(5)
      .toArray();

    return NextResponse.json(previousAppointments);

  } catch (error: any) {
    console.error('Error fetching previous appointments:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch previous appointments' }, { status: 500 });
  }
} 