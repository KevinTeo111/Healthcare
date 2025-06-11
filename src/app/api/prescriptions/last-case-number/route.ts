import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Find the prescription with the highest case number
    const lastPrescription = await db.collection('prescriptions')
      .find({ caseNumber: { $exists: true } })
      .sort({ caseNumber: -1 })
      .limit(1)
      .toArray();

    const lastCaseNumber = lastPrescription.length > 0 ? lastPrescription[0].caseNumber : 'CASE0000';

    return NextResponse.json({ lastCaseNumber });
  } catch (error) {
    console.error('Error fetching last case number:', error);
    return NextResponse.json({ error: 'Failed to fetch last case number' }, { status: 500 });
  }
} 