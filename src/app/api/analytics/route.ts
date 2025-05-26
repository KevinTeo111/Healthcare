import { NextResponse } from 'next/server';

const analytics = {
  patientsCount: 120,
  upcomingAppointments: 15,
  prescriptionsThisMonth: 45,
};

export async function GET() {
  return NextResponse.json(analytics);
}
