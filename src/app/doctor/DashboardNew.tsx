'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '../components/Footer';

interface Appointment {
  id: string;
  patient: string;
  date: string;
  time: string;
  _id?: string; // Add optional MongoDB _id for robust backend operations
}

// Sidebar component with icons
const Sidebar: React.FC = () => {
  const router = useRouter();

  return (
    <aside style={{
      width: 72,
      backgroundColor: '#1e293b',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 24,
      paddingBottom: 24,
      gap: 24,
      borderTopRightRadius: 16,
      borderBottomRightRadius: 16,
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
    }}>
      <div style={{ cursor: 'pointer' }} title="Dashboard" onClick={() => router.push('/doctor')}>
        {/* Dashboard Icon */}
        <svg width="32" height="32" fill="white" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8v-10h-8v10zm0-18v6h8V3h-8z"/></svg>
      </div>
      <div style={{ cursor: 'pointer' }} title="Patients" onClick={() => router.push('/doctor/patients')}>
        {/* Patients Icon */}
        <svg width="32" height="32" fill="white" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
      </div>
      <div style={{ cursor: 'pointer' }} title="Appointments" onClick={() => router.push('/doctor/appointments')}>
        {/* Calendar Icon */}
        <svg width="32" height="32" fill="white" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
      </div>
      <div style={{ cursor: 'pointer' }} title="Notifications">
        {/* Bell Icon */}
        <svg width="32" height="32" fill="white" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 00-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
      </div>
    </aside>
  );
};

// Topbar component
const Topbar: React.FC = () => {
  const [userName, setUserName] = React.useState('Loading...');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const router = useRouter();

  // On mount, try to get user from localStorage first
  React.useEffect(() => {
    const localName = localStorage.getItem('userName');
    if (localName) {
      setUserName(localName);
    }
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user');
        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();
        setUserName(data.name);
        localStorage.setItem('userName', data.name || 'Guest');
      } catch {
        setUserName('Guest');
        localStorage.setItem('userName', 'Guest');
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('userName'); // Clear userName on logout
      const res = await fetch('/api/logout', { method: 'POST' });
      if (res.ok) {
        // Route to sign-in page after logout
        router.replace('/auth/signin');
      } else {
        alert('Logout failed');
      }
    } catch {
      alert('Logout failed');
    }
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim() === '') {
      setSearchResults([]);
      return;
    }
    // Search patients and appointments
    try {
      const [patientsRes, appointmentsRes] = await Promise.all([
        fetch(`/api/patients?search=${encodeURIComponent(value)}`),
        fetch(`/api/appointments?search=${encodeURIComponent(value)}`),
      ]);
      const patients = patientsRes.ok ? await patientsRes.json() : [];
      const appointments = appointmentsRes.ok ? await appointmentsRes.json() : [];
      setSearchResults([
        ...patients.map((p: any) => ({ type: 'patient', ...p })),
        ...appointments.map((a: any) => ({ type: 'appointment', ...a })),
      ]);
    } catch {
      setSearchResults([]);
    }
  };

  return (
    <header style={{
      height: 64,
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      marginLeft: 72,
      borderBottom: '1px solid #e2e8f0',
      position: 'fixed',
      top: 0,
      left: 72,
      right: 0,
      zIndex: 10,
      gap: 16,
    }}>
      <div style={{ fontWeight: '600', fontSize: 18 }}>
        Hello, {userName}
      </div>
      <input
        type="search"
        placeholder="Search Here..."
        value={searchTerm}
        onChange={handleSearch}
        style={{
          flexGrow: 1,
          padding: 8,
          borderRadius: 8,
          border: '1px solid #cbd5e1',
          fontSize: 16,
        }}
      />
      {searchResults.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 56,
          left: 200,
          right: 24,
          background: 'white',
          border: '1px solid #cbd5e1',
          borderRadius: 8,
          zIndex: 100,
          maxHeight: 300,
          overflowY: 'auto',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 8 }}>
            {searchResults.map((result, idx) => (
              <li
                key={idx}
                style={{ padding: 8, borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                onClick={() => {
                  if (result.type === 'patient') {
                    router.push(`/doctor/patients?id=${result.id}`);
                  } else if (result.type === 'appointment') {
                    router.push(`/doctor/appointments?id=${result.id}`);
                  }
                  setSearchResults([]);
                  setSearchTerm('');
                }}
              >
                {result.type === 'patient' ? (
                  <span>Patient: <strong>{result.name}</strong> (Age: {result.age})</span>
                ) : (
                  <span>Appointment: <strong>{result.patient}</strong> on {result.date} at {result.time}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      <button title="Calendar" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        {/* Calendar Icon */}
        <svg width="24" height="24" fill="#64748b" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
      </button>
      <button title="Messages" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        {/* Message Icon */}
        <svg width="24" height="24" fill="#64748b" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v16l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
      </button>
      <button title="Notifications" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        {/* Bell Icon */}
        <svg width="24" height="24" fill="#64748b" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 00-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
      </button>
      <button
        onClick={handleLogout}
        style={{
          marginLeft: 'auto',
          padding: '8px 16px',
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontWeight: '600',
        }}
      >
        Logout
      </button>
    </header>
  );
};

// Card component for sections
const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 24,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      flex: 1,
      minWidth: 280,
      marginBottom: 24,
    }}>
      <h3 style={{ marginBottom: 16, fontWeight: '600' }}>{title}</h3>
      {children}
    </div>
  );
};

const DashboardNew: React.FC = () => {
  const router = useRouter();

  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [recentActivities, setRecentActivities] = useState<{ id: string; description: string; date: string }[]>([]);
  const [analytics, setAnalytics] = useState({ patientsCount: 0, upcomingAppointments: 0, prescriptionsThisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [newAppointment, setNewAppointment] = useState({ patient: '', date: '', time: '' });
  const [editAppointment, setEditAppointment] = useState({ patient: '', date: '', time: '' });
  const [popupMsg, setPopupMsg] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Helper to show popup
  const showPopup = (msg: string) => {
    setPopupMsg(msg);
    setTimeout(() => setPopupMsg(null), 2500);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all appointments
        const appointmentsRes = await fetch('/api/appointments');
        if (!appointmentsRes.ok) throw new Error('Failed to fetch appointments');
        let appointmentsData = await appointmentsRes.json();
        appointmentsData = appointmentsData.map((a: any) => ({ ...a, id: a._id?.toString?.() || a.id, _id: a._id?.toString?.() || a._id }));
        setAppointments(appointmentsData);

        // Fetch all patients
        const patientsRes = await fetch('/api/patients');
        if (!patientsRes.ok) throw new Error('Failed to fetch patients');
        const patientsData = await patientsRes.json();

        // Patient Management: merge patient details with last visit from appointments
        const patientMap = new Map();
        for (const patient of patientsData) {
          // Find all appointments for this patient
          const patientAppointments = appointmentsData.filter((a: any) => a.patient === patient.name);
          // Find the latest appointment date
          let lastVisit = '';
          if (patientAppointments.length > 0) {
            lastVisit = patientAppointments
              .map((a: any) => new Date(a.date + 'T' + a.time))
              .sort((a: Date, b: Date) => b.getTime() - a.getTime())[0]
              .toISOString()
              .slice(0, 10);
          }
          patientMap.set(patient.name, { ...patient, lastVisit });
        }
        // Only show patients who have appointments (or all patients if you want)
        setPatients(Array.from(patientMap.values()));

        // Analytics & Reports
        const patientsCount = patientsData.length;
        const today = new Date();
        const upcomingAppointments = appointmentsData.filter((a: any) => {
          const date = new Date(a.date + 'T' + a.time);
          return date >= today;
        }).length;
        const prescriptionsThisMonth = appointmentsData.filter((a: any) => {
          const d = new Date(a.date);
          return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        }).length;
        setAnalytics({ patientsCount, upcomingAppointments, prescriptionsThisMonth });

        // Recent Activity: last 5 appointments
        const sorted = [...appointmentsData].sort((a: any, b: any) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime());
        setRecentActivities(sorted.slice(0, 5).map((a: any) => ({ id: a._id, description: `Appointment for ${a.patient}`, date: a.date + ' ' + a.time })));

        setLoading(false);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Error loading data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Add appointment
  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppointment.patient || !newAppointment.date || !newAppointment.time) {
      showPopup('Please fill all fields');
      return;
    }
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment),
      });
      if (res.ok) {
        let created = await res.json();
        created = { ...created, id: created._id?.toString?.() || created.id };
        setAppointments([created, ...appointments]);
        setNewAppointment({ patient: '', date: '', time: '' });
        showPopup('Appointment added successfully.');
      } else {
        const err = await res.json();
        showPopup('Failed to add appointment: ' + (err?.error || res.status));
      }
    } catch (err) {
      console.error('Add appointment error:', err);
      showPopup('Failed to add appointment');
    }
  };

  // Delete appointment
  const handleDeleteAppointment = async (id: string) => {
    const appointment = appointments.find(a => a._id === id);
    const mongoId = (appointment as any)?._id || id;
    if (!window.confirm('Delete this appointment?')) return;
    try {
      const res = await fetch(`/api/appointments?id=${encodeURIComponent(mongoId)}`, { method: 'DELETE' });
      if (res.ok) {
        setAppointments(appointments.filter((a: Appointment & { _id?: string }) => a._id !== id));
        showPopup('Appointment deleted successfully.');
      } else {
        const err = await res.json();
        showPopup('Failed to delete appointment: ' + (err?.error || res.status));
      }
    } catch (err) {
      console.error('Delete appointment error:', err);
      showPopup('Failed to delete appointment. Please try again.');
    }
  };

  // Start editing
  const startEditAppointment = (app: Appointment & { _id?: string }) => {
    setEditingAppointmentId(app._id || app.id); // Always store MongoDB _id if available
    setEditAppointment({ patient: app.patient, date: app.date, time: app.time });
  };

  // Save edit
  const handleEditAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAppointment.patient || !editAppointment.date || !editAppointment.time) {
      showPopup('Please fill all fields');
      return;
    }
    // Validate date and time format (basic)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(editAppointment.date)) {
      showPopup('Invalid date format. Use YYYY-MM-DD.');
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(editAppointment.time)) {
      showPopup('Invalid time format. Use HH:MM.');
      return;
    }
    setEditLoading(true);
    const appointment = appointments.find(a => a._id === editingAppointmentId || a.id === editingAppointmentId);
    const mongoId = (appointment as any)?._id || editingAppointmentId;
    try {
      const res = await fetch(`/api/appointments?id=${encodeURIComponent(mongoId ?? '')}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editAppointment),
      });
      if (res.ok) {
        let updated = await res.json();
        updated = { ...updated, id: updated._id?.toString?.() || updated.id, _id: updated._id?.toString?.() || updated._id };
        setAppointments(appointments.map((a: Appointment & { _id?: string }) => (a._id === mongoId || a.id === mongoId) ? updated : a));
        setEditingAppointmentId(null);
        showPopup('Appointment updated successfully.');
      } else {
        const err = await res.json();
        showPopup('Failed to update appointment: ' + (err?.error || res.status));
      }
    } catch (err) {
      console.error('Update appointment error:', err);
      showPopup('Failed to update appointment. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 24, fontSize: 18 }}>Loading dashboard data...</div>;
  }

  if (error) {
    return <div style={{ padding: 24, fontSize: 18, color: 'red' }}>{error}</div>;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9', flexDirection: 'column' }}>
      {/* Main Flex Layout */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Sidebar />
        <div style={{ flex: 1, marginLeft: 72, paddingTop: 64, paddingLeft: 24, paddingRight: 24, overflowY: 'auto' }}>
          <Topbar />
          <div style={{ display: 'flex', gap: 24, marginTop: 24 }}>
            {/* Sidebar */}
            <div style={{ flex: 1, minWidth: 320, maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 24 }}>
              <Card title="Patient Management">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Age</th>
                      <th style={{ textAlign: 'left', padding: 8 }}>Last Visit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient: any) => (
                      <tr key={patient.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: 8 }}>{patient.name}</td>
                        <td style={{ padding: 8 }}>{patient.age}</td>
                        <td style={{ padding: 8 }}>{patient.lastVisit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
              <Card title="Analytics & Reports">
                <p>Number of patients: {analytics.patientsCount}</p>
                <p>Upcoming appointments: {analytics.upcomingAppointments}</p>
                <p>Prescriptions this month: {analytics.prescriptionsThisMonth}</p>
              </Card>
            </div>

            {/* Main Content */}
            <div style={{ flex: 2, minWidth: 400, display: 'flex', flexDirection: 'column', gap: 24 }}>
              <Card title="Appointment Scheduling">
                {/* Add Appointment Form */}
                <form onSubmit={handleAddAppointment} style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Patient Name"
                    value={newAppointment.patient}
                    onChange={e => setNewAppointment({ ...newAppointment, patient: e.target.value })}
                    style={{ flex: 2, minWidth: 120, padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }}
                    required
                  />
                  <input
                    type="date"
                    value={newAppointment.date}
                    onChange={e => setNewAppointment({ ...newAppointment, date: e.target.value })}
                    style={{ flex: 1, minWidth: 100, padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }}
                    required
                  />
                  <input
                    type="time"
                    value={newAppointment.time}
                    onChange={e => setNewAppointment({ ...newAppointment, time: e.target.value })}
                    style={{ flex: 1, minWidth: 80, padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }}
                    required
                  />
                  <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>Add</button>
                </form>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {appointments.map((app: any) => (
                    <li key={app.id} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {editingAppointmentId === app._id ? (
                        <form onSubmit={handleEditAppointment} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
                          <input
                            type="text"
                            value={editAppointment.patient}
                            onChange={e => setEditAppointment({ ...editAppointment, patient: e.target.value })}
                            style={{ flex: 2, minWidth: 120, padding: 6, borderRadius: 6, border: '1px solid #cbd5e1' }}
                            required
                          />
                          <input
                            type="date"
                            value={editAppointment.date}
                            onChange={e => setEditAppointment({ ...editAppointment, date: e.target.value })}
                            style={{ flex: 1, minWidth: 100, padding: 6, borderRadius: 6, border: '1px solid #cbd5e1' }}
                            required
                          />
                          <input
                            type="time"
                            value={editAppointment.time}
                            onChange={e => setEditAppointment({ ...editAppointment, time: e.target.value })}
                            style={{ flex: 1, minWidth: 80, padding: 6, borderRadius: 6, border: '1px solid #cbd5e1' }}
                            required
                          />
                          <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: editLoading ? 'not-allowed' : 'pointer', opacity: editLoading ? 0.7 : 1 }} disabled={editLoading}>Save</button>
                          <button type="button" onClick={() => setEditingAppointmentId(null)} style={{ background: '#6b7280', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        </form>
                      ) : (
                        <>
                          <span style={{ flex: 2 }}><strong>{app.patient}</strong> - {app.date} at {app.time}</span>
                          <button onClick={() => startEditAppointment(app)} style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => handleDeleteAppointment(app._id)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => router.push('/doctor/appointments')}
                  style={{
                    marginTop: 12,
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Schedule New Appointment
                </button>
              </Card>
              <Card title="Recent Activity">
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {recentActivities.map((act: any) => (
                    <li key={act.id} style={{ marginBottom: 8 }}>
                      {act.description} - <em>{act.date}</em>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card title="Prescription Management">
                <button
                  onClick={() => router.push('/doctor/prescription')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Go to Prescriptions
                </button>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardNew;
