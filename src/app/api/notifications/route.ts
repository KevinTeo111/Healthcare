import clientPromise from '../mongodb';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const patientEmail = searchParams.get('patientEmail');
  const client = await clientPromise;
  const db = client.db('hospital');
  let query = {};
  if (patientEmail) {
    query = { patient: patientEmail };
  }
  const notifications = await db.collection('notifications').find(query).sort({ createdAt: -1 }).toArray();
  return NextResponse.json(notifications);
}
