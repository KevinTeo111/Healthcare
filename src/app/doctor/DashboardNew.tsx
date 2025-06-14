'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface Patient {
  id: string;
  _id?: string;
  name: string;
  age: string;
  gender: string;
  bloodGroup: string;
  caseNumber?: string;
  diagnoses?: string[];
  treatments?: string[];
  allergies?: string[];
  prescriptions?: Prescription[];
}

interface Appointment {
  id: string;
  patient: string;
  date: string;
  time: string;
  status?: string;
}

interface SearchResult {
  id: string;
  type: 'patient' | 'appointment';
  name?: string;
  age?: string;
  patient?: string;
  date?: string;
  time?: string;
}

interface Profile {
  name: string;
  specialties: string;
  hours: string;
  contact: string;
}

interface Notification {
  _id: string;
  id?: string;
  type: string;
  message: string;
  createdAt: string;
  time?: string;
  requestId?: string;
  appointmentId?: string;
}

interface AppointmentRequest {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface Prescription {
  _id: string;
  patientName: string;
  medicines: string[];
  diagnosis: string;
  createdAt: string;
  age?: string;
  gender?: string;
  bloodGroup?: string;
  caseNumber?: string;
  disease?: string;
  notes?: string;
  date?: string;
  doctorName?: string;
}

// Sidebar component with icons
interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close sidebar when clicking outside or on menu bars
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  return (
    <aside
      ref={sidebarRef}
      style={{
        width: 220,
        backgroundColor: '#1e293b',
        color: 'white',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 1000,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
        boxShadow: open ? '2px 0 12px rgba(0,0,0,0.08)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '32px 0 0 0',
      }}
      aria-hidden={!open}
    >
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          fontSize: 28,
          alignSelf: 'flex-end',
          margin: '0 16px 24px 0',
          cursor: 'pointer',
        }}
        aria-label="Close menu"
      >
        &times;
      </button>
      <div style={{ width: '100%', paddingLeft: 32 }}>
        <div style={{ cursor: 'pointer', marginBottom: 32 }} title="Dashboard" onClick={() => { router.push('/doctor'); onClose(); }}>
          <svg width="32" height="32" fill="white" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8v-10h-8v10zm0-18v6h8V3h-8z"/></svg>
          <span style={{ marginLeft: 16, fontSize: 18, verticalAlign: 'middle' }}>Dashboard</span>
        </div>
        <div style={{ cursor: 'pointer', marginBottom: 32 }} title="Users" onClick={() => { router.push('/dashboard/admin'); onClose(); }}>
          <svg width="32" height="32" fill="white" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          <span style={{ marginLeft: 16, fontSize: 18, verticalAlign: 'middle' }}>Users</span>
        </div>
        <div style={{ cursor: 'pointer', marginBottom: 32 }} title="Prescriptions" onClick={() => { router.push('/doctor/prescription'); onClose(); }}>
          <svg width="32" height="32" fill="white" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
          <span style={{ marginLeft: 16, fontSize: 18, verticalAlign: 'middle' }}>Prescriptions</span>
        </div>
        <div style={{ cursor: 'pointer', marginBottom: 32 }} title="Logout" onClick={() => { router.push('/auth/signup'); onClose(); }}>
          <svg width="32" height="32" fill="white" viewBox="0 0 24 24"><path d="M10 9V5l-7 7 7 7v-4h8V9z"/></svg>
          <span style={{ marginLeft: 16, fontSize: 18, verticalAlign: 'middle' }}>Logout</span>
        </div>
      </div>
    </aside>
  );
};

// Topbar component
const Topbar: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const [userName, setUserName] = React.useState('Loading...');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const router = useRouter();

  // On mount, try to get user from localStorage first
  React.useEffect(() => {
    const localName = localStorage.getItem('userName');
    const localEmail = localStorage.getItem('userEmail');
    if (localName) {
      setUserName(localName.split(' ')[0]); // Split and take the first name
    }
    const fetchUser = async () => {
      try {
        let url = '/api/user';
        if (localEmail) url += `?email=${encodeURIComponent(localEmail)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();
        setUserName(data.firstName || data.name.split(' ')[0]);
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
      // Clear all user-related data from localStorage
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      const res = await fetch('/api/logout', { method: 'POST' });
      if (res.ok) {
        // Route to home page after logout
        router.replace('/');
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
        ...patients.map((p: Patient) => ({ type: 'patient' as const, ...p })),
        ...appointments.map((a: Appointment) => ({ type: 'appointment' as const, ...a })),
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
      borderBottom: '1px solid #e2e8f0',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1100,
      gap: 16,
    }}>
      <button
        onClick={onMenuClick}
        style={{
          background: 'none',
          border: 'none',
          fontSize: 28,
          marginRight: 16,
          cursor: 'pointer',
          color: '#2563eb',
        }}
        aria-label="Open menu"
      >
        &#9776;
      </button>
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
            {searchResults.map((result) => (
              <li
                key={result.id}
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [profile, setProfile] = useState<Profile>({
    name: 'Dr. John Doe',
    specialties: 'Cardiology',
    hours: 'Mon-Fri 9am-5pm',
    contact: 'dr.john@example.com',
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [appointmentRequests, setAppointmentRequests] = useState<AppointmentRequest[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);

  // Real-time notifications & Appointment Requests via polling
  useEffect(() => {
    const fetchNotificationsAndRequests = async () => {
      try {
        // Fetch general notifications
        const notificationsRes = await fetch('/api/notifications', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (!notificationsRes.ok) {
          console.error('Failed to fetch notifications:', notificationsRes.status, notificationsRes.statusText);
          throw new Error(`Notifications fetch failed: ${notificationsRes.statusText}`);
        }
        const generalNotifications = await notificationsRes.json();

        // Fetch pending appointments
        const appointmentsRes = await fetch('/api/appointments?status=pending', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (!appointmentsRes.ok) {
          console.error('Failed to fetch appointments:', appointmentsRes.status, appointmentsRes.statusText);
          throw new Error(`Appointments fetch failed: ${appointmentsRes.statusText}`);
        }
        const pendingAppointments = await appointmentsRes.json();

        // Fetch prescriptions
        const prescriptionsRes = await fetch('/api/prescriptions', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (!prescriptionsRes.ok) {
          console.error('Failed to fetch prescriptions:', prescriptionsRes.status, prescriptionsRes.statusText);
          throw new Error(`Prescriptions fetch failed: ${prescriptionsRes.statusText}`);
        }
        const fetchedPrescriptions = await prescriptionsRes.json();
        setPrescriptions(Array.isArray(fetchedPrescriptions) ? fetchedPrescriptions : []);

        const now = new Date();

        // Format appointments as notifications
        const appointmentNotifications = pendingAppointments.map((appointment: any) => ({
          id: appointment._id,
          type: 'appointment',
          message: `New appointment request from ${appointment.patientName} for ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}.`,
          time: appointment.createdAt ? new Date(appointment.createdAt).toLocaleTimeString() : 'Just now',
          createdAt: appointment.createdAt || now.toISOString(),
          appointmentId: appointment._id,
        }));

        // Format prescription notifications
        const prescriptionNotifications = fetchedPrescriptions.map((prescription: any) => ({
          id: `prescription-${prescription._id}`,
          type: 'prescription',
          message: `Patient ${prescription.patientName} was prescribed for ${prescription.disease}.`,
          time: prescription.createdAt ? new Date(prescription.createdAt).toLocaleTimeString() : 'Just now',
          createdAt: prescription.createdAt || now.toISOString(),
        }));

        // Combine all notifications and sort by creation date
        const allNotifications = [
          ...generalNotifications.map((n: any) => ({ ...n, type: n.type || 'general', time: n.time || 'Just now', createdAt: n.createdAt || now.toISOString() })),
          ...appointmentNotifications,
          ...prescriptionNotifications,
        ].filter(notification => {
           const createdAt = new Date(notification.createdAt);
           return (now.getTime() - createdAt.getTime()) <= 7 * 24 * 60 * 60 * 1000;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setNotifications(allNotifications);

      } catch (err) {
        console.error('Failed to fetch notifications and appointments:', err);
      }
    };

    setLoadingPrescriptions(true); // Indicate loading before initial fetch
    fetchNotificationsAndRequests();
    const interval = setInterval(fetchNotificationsAndRequests, 30000); 
    return () => clearInterval(interval);
  }, []);

  // Handle accepting or rejecting appointments from notifications
  const handleRequestAction = async (appointmentId: string | undefined, status: 'accepted' | 'rejected') => {
    if (!appointmentId) return;
    
    // Optimistically update UI: remove the appointment notification from the list
    setNotifications((prevNotifications: Notification[]) => 
      prevNotifications.filter((n: Notification) => !(n.type === 'appointment' && n.appointmentId === appointmentId))
    );

    try {
      // Call the backend API to update the appointment status
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        console.error(`Failed to update appointment ${appointmentId} status to ${status}`);
        // Consider adding the notification back or showing an error message here
      }
    } catch (err) {
      console.error(`Error updating appointment ${appointmentId} status:`, err);
      // Consider adding the notification back or showing an error message here
    }
  };

  // Simulate patient search (replace with API integration)
  const handlePatientSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPatientSearch(value);
    if (!value.trim()) {
      setPatientResults([]);
      return;
    }
    // Search patients from prescriptions
    const uniquePatients = Array.from(
      new Set(prescriptions.map((p: Prescription) => `${p.patientName}|${p.age || '-'}|${p.gender || '-'}|${p.bloodGroup || '-'}|${p.caseNumber || '-'}`))
    ).map(key => {
      const [name, age, gender, bloodGroup, caseNumber] = key.split('|');
      return {
        id: key,
        name,
        age,
        gender,
        bloodGroup,
        caseNumber,
      };
    });
    setPatientResults(
      uniquePatients.filter(p => 
        p.name.toLowerCase().includes(value.toLowerCase()) ||
        p.caseNumber.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  // Simulate selecting a patient
  const handleSelectPatient = (patient: Patient) => {
    // Filter all prescriptions for this patient (match only by patientName and caseNumber)
    const patientPrescriptions = prescriptions.filter((p: Prescription) =>
      p.patientName === patient.name && p.caseNumber === patient.caseNumber
    );
    setSelectedPatient({
      ...patient,
      diagnoses: Array.from(new Set(patientPrescriptions.map((p: Prescription) => p.disease || '').filter(Boolean))),
      treatments: [], // Not available in prescription data
      allergies: [], // Not available in prescription data
      prescriptions: patientPrescriptions.map((pres: Prescription) => ({
        _id: pres._id,
        patientName: pres.patientName,
        medicines: pres.medicines,
        diagnosis: pres.diagnosis,
        createdAt: pres.createdAt,
        date: pres.date || (pres.createdAt ? new Date(pres.createdAt).toLocaleDateString('en-GB') : '-'),
        notes: pres.notes || '',
        disease: pres.disease || '',
        age: pres.age || '-',
        gender: pres.gender || '-',
        bloodGroup: pres.bloodGroup || '-',
        doctorName: pres.doctorName || '',
        caseNumber: pres.caseNumber || '',
      })),
    });
    setPatientSearch('');
    setPatientResults([]);
  };

  // Simulate profile update (no backend yet)
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for save logic
    alert('Profile updated! (not yet saved to backend)');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9', flexDirection: 'column' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, paddingTop: 64, paddingLeft: 24, paddingRight: 24, overflowY: 'auto' }}>
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <div style={{ display: 'flex', gap: 24, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* Patient Medical History & Prescription History */}
            <Card title="Patient Medical History & Prescriptions">
              <div style={{ marginBottom: 16 }}>
                <input
                  type="search"
                  placeholder="Search patient by name..."
                  value={patientSearch}
                  onChange={handlePatientSearch}
                  style={{ padding: 8, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 16, width: '100%' }}
                />
                {patientResults.length > 0 && (
                  <div style={{ maxHeight: 400, overflowY: 'auto', marginTop: 8 }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {patientResults.map(p => (
                        <li
                          key={p.id}
                          style={{
                            padding: 8,
                            borderBottom: '1px solid #e5e7eb',
                            cursor: 'pointer',
                            background: '#f9fafb',
                            transition: 'background 0.2s',
                          }}
                          onMouseOver={e => (e.currentTarget.style.background = '#e0e7ff')}
                          onMouseOut={e => (e.currentTarget.style.background = '#f9fafb')}
                          onClick={() => handleSelectPatient(p)}
                        >
                          {p.caseNumber ? `[Case #${p.caseNumber}] ` : ''}{p.name} (Age: {p.age})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {selectedPatient ? (
                <div>
                  <button
                    onClick={() => setSelectedPatient(null)}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      padding: '6px 12px',
                      cursor: 'pointer',
                      marginBottom: 12,
                      fontWeight: '600',
                    }}
                    aria-label="Close patient medical history"
                  >
                    Close
                  </button>
                  <div style={{ marginBottom: 8 }}><strong>Case Number:</strong> {selectedPatient.caseNumber || 'Not Assigned'}</div>
                  <div style={{ marginBottom: 8 }}><strong>Name:</strong> {selectedPatient.name}</div>
                  {selectedPatient.age && selectedPatient.age !== '-' && (
                    <div style={{ marginBottom: 8 }}><strong>Age:</strong> {selectedPatient.age}</div>
                  )}
                  {selectedPatient.gender && selectedPatient.gender !== '-' && (
                    <div style={{ marginBottom: 8 }}><strong>Gender:</strong> {selectedPatient.gender}</div>
                  )}
                  {selectedPatient.bloodGroup && selectedPatient.bloodGroup !== '-' && (
                    <div style={{ marginBottom: 8 }}><strong>Blood Group:</strong> {selectedPatient.bloodGroup}</div>
                  )}
                  {selectedPatient.diagnoses && selectedPatient.diagnoses.length > 0 && selectedPatient.diagnoses.some((d: string) => d && d !== '-') && (
                    <div style={{ marginBottom: 8 }}><strong>Diagnoses:</strong> {selectedPatient.diagnoses.filter((d: string) => d && d !== '-').join(', ')}</div>
                  )}
                  {selectedPatient.treatments && selectedPatient.treatments.length > 0 && selectedPatient.treatments.some((t: string) => t && t !== '-') && (
                    <div style={{ marginBottom: 8 }}><strong>Treatments:</strong> {selectedPatient.treatments.filter((t: string) => t && t !== '-').join(', ')}</div>
                  )}
                  {selectedPatient.allergies && selectedPatient.allergies.length > 0 && selectedPatient.allergies.some((a: string) => a && a !== '-') && (
                    <div style={{ marginBottom: 8 }}><strong>Allergies:</strong> {selectedPatient.allergies.filter((a: string) => a && a !== '-').join(', ')}</div>
                  )}
                  {/* Show prescription details */}
                  {selectedPatient.prescriptions && selectedPatient.prescriptions.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <strong>Prescriptions:</strong>
                      <div style={{ maxHeight: 400, overflowY: 'auto', marginTop: 8 }}>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          {selectedPatient.prescriptions.map((pres: any, idx: number) => (
                            <li key={`prescription-${pres._id || idx}`} style={{ marginBottom: 12, padding: 12, background: '#f9fafb', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div><strong>Date:</strong> {pres.date || '-'}</div>
                                <div><strong>Case #:</strong> {pres.caseNumber ? pres.caseNumber : "Not Assigned"}</div>
                              </div>
                              <div><strong>Medicines:</strong> {Array.isArray(pres.medicines) && pres.medicines.length > 0 ? (
                                pres.medicines.map((med: any, i: number) => (
                                  <span key={`medicine-${pres._id || idx}-${i}`}>
                                    {med.name ? med.name : typeof med === 'string' ? med : ''}{med.quantity ? ` x${med.quantity}` : ''}{i < pres.medicines.length - 1 ? ', ' : ''}
                                  </span>
                                ))
                              ) : '-'}</div>
                              {pres.disease && <div style={{ marginBottom: '4px' }}><strong>Diagnosis:</strong> {pres.disease}</div>}
                              <div><strong>Notes:</strong> {pres.notes ? pres.notes : '-'}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: '#64748b' }}>No patient selected.</div>
              )}
            </Card>

            {/* Notifications & Alerts */}
            <Card title="Notifications & Alerts">
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {notifications.length === 0 && (
                  <li style={{ color: '#64748b', padding: 8 }}>No notifications.</li>
                )}
                {notifications.map(n => (
                  <li key={`${n.type}-${n.id}`} style={{ padding: 8, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>
                      {n.type === 'appointment' && '📅'}
                      {n.type === 'lab' && '🧪'}
                      {n.type === 'message' && '💬'}
                      {n.type === 'prescription' && '💊'}
                      {n.type === 'appointment_request' && '📝'}
                    </span>
                    <span>{n.message}</span>
                    <span style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: 13 }}>{n.time}</span>
                     {/* Add Accept/Reject buttons next to appointment request notifications */}
                     {n.type === 'appointment_request' && n.appointmentId && (
                        <div style={{display: 'flex', gap: '8px'}}>
                           <button
                            onClick={() => handleRequestAction(n.appointmentId!, 'accepted')}
                            style={{
                              padding: '4px 8px',
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '12px'
                            }}
                          >
                            Accept
                          </button>
                          <button
                             onClick={() => handleRequestAction(n.appointmentId!, 'rejected')}
                             style={{
                               padding: '4px 8px',
                               background: '#ef4444',
                               color: 'white',
                               border: 'none',
                               borderRadius: '4px',
                               cursor: 'pointer',
                               fontWeight: '600',
                               fontSize: '12px'
                             }}
                          >
                             Reject
                          </button>
                        </div>
                     )}
                  </li>
                ))}
              </ul>
              <div style={{ color: '#64748b', marginTop: 8 }}>
                {notifications.length === 0 ? 'No notifications yet.' : 'Notifications updated periodically.'}
              </div>
            </Card>
          </div>
        </div>
      </div>
      <style jsx global>{`
        ul::-webkit-scrollbar {
          width: 8px;
        }
        ul::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        ul::-webkit-scrollbar-track {
          background: #f9fafb;
        }
      `}</style>
    </div>
  );
};

export default DashboardNew;
