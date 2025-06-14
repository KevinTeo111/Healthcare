'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AppointmentRequest {
  _id: string;
  patientName: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface PreviousAppointment {
  _id: string;
  doctorName: string;
  date: string;
  time: string;
  diagnosis?: string;
  prescription?: string;
}

export default function PatientAppointmentsPage() {
  const [appointmentRequests, setAppointmentRequests] = useState<AppointmentRequest[]>([]);
  const [previousAppointments, setPreviousAppointments] = useState<PreviousAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAppointments = async () => {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setError('User not logged in.');
        setLoading(false);
        return;
      }

      try {
        // Fetch appointment requests for the logged-in user
        const [requestsRes, previousRes] = await Promise.all([
          fetch(`/api/appointment-requests?email=${userEmail}`),
          fetch(`/api/appointments/previous?email=${userEmail}`)
        ]);

        if (!requestsRes.ok || !previousRes.ok) {
          throw new Error('Failed to fetch appointments.');
        }

        const [requestsData, previousData] = await Promise.all([
          requestsRes.json(),
          previousRes.json()
        ]);

        setAppointmentRequests(requestsData);
        setPreviousAppointments(previousData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div style={{
      padding: '32px',
      background: '#f7faff',
      minHeight: '100vh',
      fontFamily: 'Segoe UI, Arial, sans-serif'
    }}>
      <h1 style={{ fontWeight: 700, fontSize: 28, color: '#2563eb', marginBottom: 24 }}>Your Appointments</h1>

      {/* Button to navigate to the new appointment booking page */}
      <button
        onClick={() => router.push('/patient/appointments/new')}
        style={{
          marginBottom: '24px',
          padding: '12px 24px',
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '16px'
        }}
      >
        Book New Appointment
      </button>

      <div style={{ display: 'flex', gap: '24px', flexDirection: 'column' }}>
        {/* Appointment Requests Section */}
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24, maxWidth: 800 }}>
          <h2 style={{ color: '#2563eb', marginBottom: '16px' }}>Pending Appointment Requests</h2>
          {loading ? (
            <div>Loading appointment requests...</div>
          ) : error ? (
            <div style={{ color: '#ef4444' }}>{error}</div>
          ) : appointmentRequests.length === 0 ? (
            <div>You have no pending appointment requests.</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {appointmentRequests.map((request) => (
                <li key={request._id} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
                  <p><strong>Patient Name:</strong> {request.patientName}</p>
                  <p><strong>Date:</strong> {request.preferredDate}</p>
                  <p><strong>Time:</strong> {request.preferredTime}</p>
                  {request.notes && <p><strong>Notes:</strong> {request.notes}</p>}
                  <p><strong>Status:</strong> 
                    <span style={{ 
                      color: 
                        request.status === 'accepted' ? '#10b981' : 
                        request.status === 'rejected' ? '#ef4444' : 
                        '#f59e0b'
                    }}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Previous Appointments Section */}
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24, maxWidth: 800 }}>
          <h2 style={{ color: '#2563eb', marginBottom: '16px' }}>Previous Appointments</h2>
          {loading ? (
            <div>Loading previous appointments...</div>
          ) : error ? (
            <div style={{ color: '#ef4444' }}>{error}</div>
          ) : previousAppointments.length === 0 ? (
            <div>You have no previous appointments.</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {previousAppointments.map((appointment) => (
                <li key={appointment._id} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
                  <p><strong>Doctor:</strong> {appointment.doctorName}</p>
                  <p><strong>Date:</strong> {appointment.date}</p>
                  <p><strong>Time:</strong> {appointment.time}</p>
                  {appointment.diagnosis && <p><strong>Diagnosis:</strong> {appointment.diagnosis}</p>}
                  {appointment.prescription && <p><strong>Prescription:</strong> {appointment.prescription}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 