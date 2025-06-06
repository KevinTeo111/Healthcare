'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Appointment {
  _id: string;
  patientName: string;
  preferredDate: string;
  preferredTime: string;
  status: string;
  requestedBy: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const usersResponse = await fetch('/api/users');
        if (!usersResponse.ok) {
          throw new Error('Failed to fetch users');
        }
        const usersData = await usersResponse.json();
        setUsers(usersData);

        // Fetch appointments
        const appointmentsResponse = await fetch('/api/appointment-requests');
        if (!appointmentsResponse.ok) {
          throw new Error('Failed to fetch appointments');
        }
        const appointmentsData = await appointmentsResponse.json();
        setAppointments(appointmentsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setUpdatingUser(userId);
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user role');
      }

      const updatedUser = await response.json();
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
    } finally {
      setUpdatingUser(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        Loading dashboard data...
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
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{
            fontWeight: 700,
            fontSize: 28,
            color: '#2563eb',
          }}>
            Admin Dashboard
          </h1>
          <button
            onClick={() => router.push('/auth/signup')}
            style={{
              padding: '8px 16px',
              background: '#ef4444',
              color: 'white',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 500,
            }}
          >
            Logout
          </button>
        </div>

        {/* User Management Section */}
        <div style={{ 
          background: 'white', 
          borderRadius: 12, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)', 
          padding: 24, 
          marginBottom: 24 
        }}>
          <h2 style={{ color: '#1e293b', marginBottom: 16 }}>User Management</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#64748b' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#64748b' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#64748b' }}>Role</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#64748b' }}>Joined Date</th>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#64748b' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px' }}>{user.name}</td>
                    <td style={{ padding: '12px' }}>{user.email}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: 500,
                        background: user.role === 'admin' ? '#fee2e2' :
                                  user.role === 'doctor' ? '#dcfce7' :
                                  user.role === 'patient' ? '#dbeafe' : '#f3f4f6',
                        color: user.role === 'admin' ? '#ef4444' :
                               user.role === 'doctor' ? '#10b981' :
                               user.role === 'patient' ? '#2563eb' : '#6b7280'
                      }}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        disabled={updatingUser === user._id}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          background: 'white',
                          opacity: updatingUser === user._id ? 0.7 : 1,
                          cursor: updatingUser === user._id ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <option value="patient">Patient</option>
                        <option value="doctor">Doctor</option>
                        <option value="admin">Admin</option>
                      </select>
                      {updatingUser === user._id && (
                        <span style={{ marginLeft: '8px', color: '#64748b' }}>
                          Updating...
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Appointments Overview */}
        <div style={{ 
          background: 'white', 
          borderRadius: 12, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)', 
          padding: 24 
        }}>
          <h2 style={{ color: '#1e293b', marginBottom: 16 }}>Recent Appointments</h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {appointments.slice(0, 5).map((appointment) => (
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
                      {appointment.patientName}
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
                  <div style={{ color: '#64748b', fontSize: '14px' }}>
                    Requested by: {appointment.requestedBy}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 