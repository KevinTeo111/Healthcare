import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientName,
      age,
      gender,
      bloodGroup,
      doctorName,
      date,
      disease,
      notes,
      medicines,
      createdAt
    } = body;

    if (!patientName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('prescriptionApp');

    const prescriptionData = {
      patientName,
      age: age || '',
      gender: gender || '',
      bloodGroup: bloodGroup || '',
      doctorName: doctorName || '',
      date: date || '',
      disease: disease || '',
      notes: notes || '',
      medicines: Array.isArray(medicines) ? medicines : [],
      createdAt: createdAt ? new Date(createdAt) : new Date(),
    };

    const result = await db.collection('prescriptions').insertOne(prescriptionData);

    return NextResponse.json({ message: 'Prescription uploaded successfully', id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Error uploading prescription:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to upload prescription', details: errorMessage }, { status: 500 });
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
