import { NextResponse } from 'next/server';

const recentActivities = [
  { id: 'r1', description: 'Prescription created for John Doe', date: '2024-05-10' },
  { id: 'r2', description: 'Appointment scheduled with Jane Smith', date: '2024-05-09' },
  { id: 'r3', description: 'Patient Michael Johnson updated profile', date: '2024-05-08' },
];

export async function GET() {
  return NextResponse.json(recentActivities);
}
