'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PatientAppointmentsPage() {
  const [appointmentRequests, setAppointmentRequests] = useState<any[]>([]);
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
        const res = await fetch(`/api/appointment-requests?email=${userEmail}`);
        if (!res.ok) {
          throw new Error('Failed to fetch appointments.');
        }
        const data = await res.json();
        setAppointmentRequests(data);
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
      <h1 style={{ fontWeight: 700, fontSize: 28, color: '#2563eb', marginBottom: 24 }}>Your Appointment Requests</h1>

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

      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24, maxWidth: 800 }}>
        {loading ? (
          <div>Loading appointment requests...</div>
        ) : error ? (
          <div style={{ color: '#ef4444' }}>{error}</div>
        ) : appointmentRequests.length === 0 ? (
          <div>You have no appointment requests yet.</div>
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
                      '#f59e0b' // pending color
                  }}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </p>
                {/* You could add more details here if needed */}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 