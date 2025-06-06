'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PatientDetails {
  patientName: string;
  age: string;
  gender: string;
  bloodGroup: string;
  symptoms: string;
  preferredDate: string;
  preferredTime: string;
}

interface UserData {
  fullName: string;
  email: string;
  role: string;
}

interface Appointment {
  _id: string;
  preferredDate: string;
  preferredTime: string;
  status: string;
  doctorName: string;
  createdAt: string;
}

const Navbar: React.FC = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const email = localStorage.getItem('userEmail');
      if (!email) {
        router.push('/auth/signup');
        return;
      }
      
      try {
        const response = await fetch(`/api/users?email=${email}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    router.push('/auth/signup');
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '64px',
      backgroundColor: 'white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', width: '100%' }}>
        <div style={{ 
          color: '#2563eb', 
          fontWeight: 700, 
          fontSize: '20px',
          cursor: 'pointer'
        }} onClick={() => router.push('/dashboard/patient')}>
          Patient Portal
        </div>
        <div style={{ display: 'flex', gap: '16px', marginLeft: 'auto', alignItems: 'center' }}>
          {userData?.fullName && (
            <div style={{ 
              color: '#1e293b',
              fontWeight: 500,
              fontSize: '16px',
              marginRight: '16px'
            }}>
              Welcome, {userData.fullName}
            </div>
          )}
          <button
            onClick={() => router.push('/dashboard/patient')}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              color: '#2563eb',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => router.push('/patient/appointments')}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              color: '#2563eb',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Appointments
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      width: '100%',
      maxWidth: '600px'
    }}>
      <h2 style={{ color: '#2563eb', fontWeight: 700, marginBottom: 16 }}>{title}</h2>
      {children}
    </div>
  );
};

const PatientDashboard: React.FC = () => {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch('/api/appointment-requests');
        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }
        const data = await response.json();
        setAppointments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        Loading appointments...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '32px', color: '#ef4444' }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{
      padding: '32px',
      background: '#f7faff',
      minHeight: '100vh',
      fontFamily: 'Segoe UI, Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ 
          fontWeight: 700, 
          fontSize: 28, 
          color: '#2563eb', 
          marginBottom: 24 
        }}>
          Patient Dashboard
        </h1>

        {/* Upcoming Appointments Card */}
        <div style={{ 
          background: 'white', 
          borderRadius: 12, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)', 
          padding: 24, 
          marginBottom: 24 
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 16 
          }}>
            <h2 style={{ color: '#1e293b' }}>Upcoming Appointments</h2>
            <button
              onClick={() => router.push('/patient/appointments/new')}
              style={{
                padding: '8px 16px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Book New Appointment
            </button>
          </div>

          {appointments.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '24px 0' }}>
              No appointments found. Book your first appointment!
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {appointments.map((appointment) => (
                <div
                  key={appointment._id}
                  style={{
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    background: '#f8fafc'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>
                        Dr. {appointment.doctorName}
                      </p>
                      <p style={{ color: '#64748b', marginBottom: '4px' }}>
                        {new Date(appointment.preferredDate).toLocaleDateString()} at {appointment.preferredTime}
                      </p>
                      <p style={{ 
                        color: appointment.status === 'accepted' ? '#10b981' : 
                               appointment.status === 'rejected' ? '#ef4444' : 
                               '#f59e0b',
                        fontWeight: 500
                      }}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {appointment.status === 'pending' && (
                        <button
                          onClick={() => router.push(`/patient/appointments/${appointment._id}/edit`)}
                          style={{
                            padding: '6px 12px',
                            background: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          Edit
                        </button>
                      )}
                      {appointment.status === 'pending' && (
                        <button
                          onClick={async () => {
                            if (confirm('Are you sure you want to cancel this appointment?')) {
                              try {
                                const response = await fetch(`/api/appointment-requests/${appointment._id}`, {
                                  method: 'DELETE',
                                });
                                if (!response.ok) throw new Error('Failed to cancel appointment');
                                setAppointments(appointments.filter(a => a._id !== appointment._id));
                              } catch (err) {
                                setError(err instanceof Error ? err.message : 'Failed to cancel appointment');
                              }
                            }
                          }}
                          style={{
                            padding: '6px 12px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard; 