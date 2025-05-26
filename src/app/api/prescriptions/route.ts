import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../mongodb';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.patientName || !data.medicines || !Array.isArray(data.medicines)) {
      return NextResponse.json({ error: 'Missing or invalid prescription data' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('prescriptionApp');

    const result = await db.collection('prescriptions').insertOne(data);

    return NextResponse.json({ message: 'Prescription saved successfully', id: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save prescription' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('prescriptionApp');

    const prescriptions = await db.collection('prescriptions').find({}).toArray();

    return NextResponse.json(prescriptions, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 });
  }
}
