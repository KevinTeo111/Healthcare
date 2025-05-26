import clientPromise from '../mongodb';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET() {
  const client = await clientPromise;
  const db = client.db('hospital');
  const appointments = await db.collection('appointments').find({}).toArray();
  return NextResponse.json(appointments);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const client = await clientPromise;
    const db = client.db('hospital');
    const result = await db.collection('appointments').insertOne({
      patient: data.patient,
      date: data.date,
      time: data.time,
    });
    const newAppointment = await db.collection('appointments').findOne({ _id: result.insertedId });
    return NextResponse.json(newAppointment, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  try {
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid id format' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db('hospital');
    const result = await db.collection('appointments').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('DELETE appointment error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  try {
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid id format' }, { status: 400 });
    }
    const data = await req.json();
    const client = await clientPromise;
    const db = client.db('hospital');
    const result = await db.collection('appointments').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { patient: data.patient, date: data.date, time: data.time } },
      { returnDocument: 'after' }
    );
    if (!result || !result.value) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    // Return with id as string for frontend
    const updated = { ...result.value, id: result.value._id?.toString?.() };
    return NextResponse.json(updated);
  } catch (e) {
    console.error('PUT appointment error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
