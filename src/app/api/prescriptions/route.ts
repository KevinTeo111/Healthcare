import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

async function generateCaseNumber(db: any) {
  // Find the last prescription to get the highest case number
  const lastPrescription = await db.collection('prescriptions')
    .find({ caseNumber: { $exists: true } })
    .sort({ caseNumber: -1 })
    .limit(1)
    .toArray();

  let nextNumber = 1;
  if (lastPrescription.length > 0) {
    // Extract the number from the last case number (e.g., "CASE0001" -> 1)
    const lastNumber = parseInt(lastPrescription[0].caseNumber.replace('CASE', ''));
    nextNumber = lastNumber + 1;
  }

  // Format the case number with leading zeros (e.g., "CASE0001")
  return `CASE${nextNumber.toString().padStart(4, '0')}`;
}

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

    const { db } = await connectToDatabase();

    // Check for existing prescription with same patientName, age, and bloodGroup
    const existingPrescription = await db.collection('prescriptions')
      .findOne({ patientName, age, bloodGroup });

    let caseNumber;
    if (existingPrescription && existingPrescription.caseNumber) {
      caseNumber = existingPrescription.caseNumber;
    } else {
      caseNumber = await generateCaseNumber(db);
    }

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
      caseNumber,
      createdAt: createdAt ? new Date(createdAt) : new Date(),
    };

    const result = await db.collection('prescriptions').insertOne(prescriptionData);

    return NextResponse.json({ 
      message: 'Prescription uploaded successfully', 
      id: result.insertedId,
      caseNumber 
    }, { status: 201 });
  } catch (error) {
    console.error('Error uploading prescription:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to upload prescription', details: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Fetch all prescriptions with case numbers
    const prescriptions = await db.collection('prescriptions')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 });
  }
}
