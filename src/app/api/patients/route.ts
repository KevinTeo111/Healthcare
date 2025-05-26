import { NextResponse } from 'next/server';

const patients = [
  { id: '1', name: 'John Doe', age: 35, lastVisit: '2024-05-01' },
  { id: '2', name: 'Jane Smith', age: 28, lastVisit: '2024-04-20' },
  { id: '3', name: 'Michael Johnson', age: 42, lastVisit: '2024-04-15' },
];

export async function GET() {
  return NextResponse.json(patients);
}
