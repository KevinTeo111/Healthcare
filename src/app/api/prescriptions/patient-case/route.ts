import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientName = searchParams.get('name');
    const age = searchParams.get('age');
    const bloodGroup = searchParams.get('bloodGroup');

    if (!patientName) {
      return NextResponse.json({ error: 'Patient name is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    // Create a query object with the required fields
    const query: any = { patientName: patientName };
    
    // Add optional fields to the query if they are provided
    if (age) query.age = age;
    if (bloodGroup) query.bloodGroup = bloodGroup;
    
    // Find the most recent prescription for the patient with matching details
    const patientPrescription = await db.collection('prescriptions')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    if (patientPrescription.length > 0) {
      return NextResponse.json({ 
        caseNumber: patientPrescription[0].caseNumber,
        exists: true,
        patientDetails: {
          name: patientPrescription[0].patientName,
          age: patientPrescription[0].age,
          bloodGroup: patientPrescription[0].bloodGroup
        }
      });
    }

    return NextResponse.json({ 
      caseNumber: null,
      exists: false 
    });
  } catch (error) {
    console.error('Error checking patient case:', error);
    return NextResponse.json({ error: 'Failed to check patient case' }, { status: 500 });
  }
} 