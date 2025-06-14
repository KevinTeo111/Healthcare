import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    console.log('Search params:', search);

    const { db } = await connectToDatabase();
    console.log('Connected to database');
    
    // Create a case-insensitive search query
    const query = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { caseNumber: { $regex: search, $options: 'i' } }
      ]
    } : {};
    console.log('Query:', JSON.stringify(query));

    const patients = await db.collection('patients')
      .find(query)
      .project({
        _id: 0,
        id: '$_id',
        name: '$patientName',
        age: 1,
        gender: 1,
        bloodGroup: 1,
        caseNumber: 1,
        diagnoses: 1,
        treatments: 1,
        allergies: 1,
        labs: 1,
        prescriptions: 1
      })
      .toArray();
    
    console.log('Found patients:', patients.length);
    console.log('First patient:', patients[0]);

    return NextResponse.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
} 