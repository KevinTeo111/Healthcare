// Patient's Appointments Page
'use client';
import React, { useEffect, useState } from 'react';

interface Appointment {
  id: string;
  doctor: string;
  date: string;
  time: string;
}

const PatientsAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch('/api/appointments');
        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }
        const data = await response.json();
        setAppointments(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  if (loading) {
    return <div style={{ padding: 24 }}>Loading your appointments...</div>;
  }
  if (error) {
    return <div style={{ padding: 24, color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7faff', fontFamily: 'Segoe UI, Arial, sans-serif', padding: 32 }}>
      <h1 style={{ fontWeight: 700, fontSize: 28, color: '#2563eb', marginBottom: 24 }}>My Appointments</h1>
      {appointments.length === 0 ? (
        <div style={{ color: '#64748b' }}>You have no appointments scheduled.</div>
      ) : (
        <table style={{ width: '100%', background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e5e7eb', padding: 24 }}>
          <thead>
            <tr style={{ color: '#64748b', fontWeight: 600 }}>
              <th style={{ padding: 12, textAlign: 'left' }}>Doctor</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Date</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(app => (
              <tr key={app.id}>
                <td style={{ padding: 12 }}>{app.doctor}</td>
                <td style={{ padding: 12 }}>{app.date}</td>
                <td style={{ padding: 12 }}>{app.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PatientsAppointmentsPage;
