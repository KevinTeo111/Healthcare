import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../mongodb';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const patientId = url.searchParams.get('patientId');
    const patientName = url.searchParams.get('patientName');
    const age = url.searchParams.get('age');
    const bloodGroup = url.searchParams.get('bloodGroup');

    const client = await clientPromise;
    const db = client.db('prescriptionApp');

    let query = {};

    if (patientId) {
      query = { patientId };
    } else if (patientName && age && bloodGroup) {
      query = { patientName, age, bloodGroup };
    } else {
      return NextResponse.json({ error: 'Missing query parameters' }, { status: 400 });
    }

    const reports = await db.collection('reports').find(query).toArray();

    return NextResponse.json(reports, { status: 200 });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const patientName = formData.get('patientName');
    const age = formData.get('age');
    const bloodGroup = formData.get('bloodGroup');
    const fileName = formData.get('fileName');
    const file = formData.get('file');

    if (!patientName || !fileName || !file) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('prescriptionApp');

    const reportData = {
      patientName,
      age: age || 'Unknown',
      bloodGroup: bloodGroup || 'Unknown',
      fileName,
      file, // Assuming file is stored as binary or base64
      uploadedAt: new Date(),
    };

    const result = await db.collection('reports').insertOne(reportData);

    return NextResponse.json({ message: 'Report uploaded successfully', id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Error uploading report:', error);
    return NextResponse.json({ error: 'Failed to upload report' }, { status: 500 });
  }
}