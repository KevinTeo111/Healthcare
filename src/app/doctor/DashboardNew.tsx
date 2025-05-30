'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// Sidebar component with icons
interface SidebarProps {
  open: boolean;
  onClose: () => void; // Ensure onClose is properly defined as a prop
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
        <div style={{ cursor: 'pointer', marginBottom: 32 }} title="Users" onClick={() => { router.push('/admin'); onClose(); }}>
          <svg width="32" height="32" fill="white" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          <span style={{ marginLeft: 16, fontSize: 18, verticalAlign: 'middle' }}>Users</span>
        </div>
        <div style={{ cursor: 'pointer', marginBottom: 32 }} title="Prescriptions" onClick={() => { router.push('/doctor/prescription'); onClose(); }}>
          <svg width="32" height="32" fill="white" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
          <span style={{ marginLeft: 16, fontSize: 18, verticalAlign: 'middle' }}>Prescriptions</span>
        </div>
        <div style={{ cursor: 'pointer', marginBottom: 32 }} title="Reports" onClick={() => { router.push('/doctor/reports'); onClose(); }}>
          <svg width="32" height="32" fill="white" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8v-10h-8v10zm0-18v6h8V3h-8z"/></svg>
          <span style={{ marginLeft: 16, fontSize: 18, verticalAlign: 'middle' }}>Reports</span>
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
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const router = useRouter();

  // On mount, try to get user from localStorage first
  React.useEffect(() => {
    const localName = localStorage.getItem('userName');
    const localEmail = localStorage.getItem('userEmail');
    if (localName) {
      setUserName(localName);
    }
    const fetchUser = async () => {
      try {
        let url = '/api/user';
        if (localEmail) url += `?email=${encodeURIComponent(localEmail)}`;
        const res = await fetch(url);
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // State for patient search and selection
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientResults, setPatientResults] = useState<any[]>([]);
  // State for profile form
  const [profile, setProfile] = useState({
    name: 'Dr. John Doe',
    specialties: 'Cardiology',
    hours: 'Mon-Fri 9am-5pm',
    contact: 'dr.john@example.com',
  });
  // State for notifications
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'appointment', message: 'New appointment scheduled with Jane Smith', time: '2 min ago' },
    { id: 2, type: 'lab', message: 'Lab results available for John Doe', time: '10 min ago' },
    { id: 3, type: 'message', message: 'Message from patient Alex Brown', time: '30 min ago' },
  ]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);

  // Fetch all prescriptions on mount
  useEffect(() => {
    setLoadingPrescriptions(true);
    fetch('/api/prescriptions')
      .then((res) => res.json())
      .then((data) => {
        setPrescriptions(Array.isArray(data) ? data : []);
        setLoadingPrescriptions(false);
      })
      .catch(() => setLoadingPrescriptions(false));
  }, []);

  const memoizedPrescriptions = useMemo(() => prescriptions, [prescriptions]);

  // Real-time notifications via polling (replace with WebSocket for production)
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const now = new Date();
            const prescriptionNotifications = memoizedPrescriptions.map((prescription, idx) => ({
              id: `prescription-${idx + 1}`,
              type: 'prescription',
              message: `Patient ${prescription.patientName} was prescribed for ${prescription.disease}.`,
              time: prescription.createdAt ? new Date(prescription.createdAt).toLocaleTimeString() : 'Just now',
              createdAt: prescription.createdAt || now.toISOString(),
            }));

            const filteredNotifications = [
              ...data.map((n, idx) => ({
                ...n,
                id: n.id || idx + 1,
                time: n.time || 'Just now',
                createdAt: n.createdAt || now.toISOString(),
              })),
              ...prescriptionNotifications,
            ].filter(notification => {
              const createdAt = new Date(notification.createdAt);
              return (now.getTime() - createdAt.getTime()) <= 24 * 60 * 60 * 1000; // Keep notifications within 1 day
            });

            setNotifications(filteredNotifications);
          }
        }
      } catch {
        console.error('Failed to fetch notifications');
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 300000); // Poll every 5 minutes
    return () => clearInterval(interval);
  }, [memoizedPrescriptions]);

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
      new Set(prescriptions.map((p: any) => `${p.patientName}|${p.age || '-'}|${p.gender || '-'}|${p.bloodGroup || '-'}`))
    ).map(key => {
      const [name, age, gender, bloodGroup] = key.split('|');
      // Find the latest prescription for this patient
      const latest = prescriptions.find((p: any) =>
        p.patientName === name &&
        String(p.age || '-') === age &&
        String(p.gender || '-') === gender &&
        String(p.bloodGroup || '-') === bloodGroup
      );
      return {
        id: key,
        name,
        age,
        gender,
        bloodGroup,
      };
    });
    setPatientResults(
      uniquePatients.filter(p => p.name.toLowerCase().includes(value.toLowerCase()))
    );
  };

  // Simulate selecting a patient
  const handleSelectPatient = (patient: any) => {
    // Filter all prescriptions for this patient (match all fields for uniqueness)
    const patientPrescriptions = prescriptions.filter((p: any) =>
      p.patientName === patient.name &&
      String(p.age || '-') === String(patient.age || '-') &&
      String(p.gender || '-') === String(patient.gender || '-') &&
      String(p.bloodGroup || '-') === String(patient.bloodGroup || '-')
    );
    setSelectedPatient({
      ...patient,
      diagnoses: Array.from(new Set(patientPrescriptions.map((p: any) => p.disease).filter(Boolean))),
      treatments: [], // Not available in prescription data
      allergies: [], // Not available in prescription data
      labs: [], // Not available in prescription data
      prescriptions: patientPrescriptions.map((pres: any) => ({
        date: pres.createdAt ? new Date(pres.createdAt).toLocaleDateString('en-GB') : '-',
        medicines: pres.medicines || [],
        notes: pres.notes || '',
        disease: pres.disease || '',
        age: pres.age || '-',
        gender: pres.gender || '-',
        bloodGroup: pres.bloodGroup || '-',
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

  // Fetch reports for the selected patient
  useEffect(() => {
    if (selectedPatient && selectedPatient.id) {
      const fetchReports = async () => {
        try {
          const res = await fetch(`/api/reports?patientId=${selectedPatient.id}`);
          if (res.ok) {
            const data = await res.json();
            console.log('Fetched reports:', data); // Log fetched reports
            setSelectedPatient((prev: typeof selectedPatient) => {
              if (prev?.id === selectedPatient.id) {
                return prev; // Avoid unnecessary state updates
              }
              console.log('Updating selectedPatient with reports:', data); // Log update
              return {
                ...prev,
                reports: Array.isArray(data) ? data : [],
              };
            });
          }
        } catch (error) {
          console.error('Error fetching patient reports:', error);
        }
      };

      fetchReports();
    }
  }, [selectedPatient?.id]);

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
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, background: '#f9fafb', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'absolute', zIndex: 10, width: '90%' }}>
                    {patientResults.map(p => (
                      <li key={p.id} style={{ padding: 8, borderBottom: '1px solid #e5e7eb', cursor: 'pointer' }} onClick={() => handleSelectPatient(p)}>
                        {p.name} (Age: {p.age})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {selectedPatient ? (
                <div>
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
                  {selectedPatient.labs && selectedPatient.labs.length > 0 && selectedPatient.labs.some((l: string) => l && l !== '-') && (
                    <div style={{ marginBottom: 8 }}><strong>Lab Results:</strong> {selectedPatient.labs.filter((l: string) => l && l !== '-').join('; ')}</div>
                  )}
                  {selectedPatient.reports && selectedPatient.reports.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <strong>Uploaded Reports:</strong>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                        {console.log('Rendering reports:', selectedPatient.reports)} {/* Log reports being rendered */}
                        {selectedPatient.reports.map((report: any, idx: number) => (
                          <li key={idx} style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>
                            <strong>File Name:</strong> {report.fileName}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div style={{ marginTop: 16 }}>
                    <strong>Prescription History:</strong>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                      {selectedPatient.prescriptions.map((pres: any, idx: number) => {
                        const hasDate = pres.date && pres.date !== '-';
                        const hasDisease = pres.disease && pres.disease !== '-';
                        const hasNotes = pres.notes && pres.notes !== '-';
                        const hasMeds = pres.medicines && pres.medicines.length > 0;
                        if (!hasDate && !hasDisease && !hasNotes && !hasMeds) return null;
                        return (
                          <li key={idx} style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>
                            {hasDate && (<div><strong>Date:</strong> {pres.date}</div>)}
                            {hasDisease && (<div><strong>Disease:</strong> {pres.disease}</div>)}
                            {hasNotes && (<div><strong>Notes:</strong> {pres.notes}</div>)}
                            {hasMeds && (
                              <div><strong>Medicines:</strong>
                                <ul style={{ margin: 0, paddingLeft: 16 }}>
                                  {pres.medicines.map((med: any, i: number) => (
                                    med.name && med.name !== '-' ? <li key={i}>{med.name} x{med.quantity}</li> : null
                                  ))}
                                </ul>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              ) : (
                <div style={{ color: '#64748b' }}>Search and select a patient to view their medical and prescription history.</div>
              )}
            </Card>

            {/* Notifications & Alerts */}
            <Card title="Notifications & Alerts">
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {notifications.length === 0 && (
                  <li style={{ color: '#64748b', padding: 8 }}>No notifications.</li>
                )}
                {notifications.map(n => (
                  <li key={n.id} style={{ padding: 8, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>
                      {n.type === 'appointment' && '📅'}
                      {n.type === 'lab' && '🧪'}
                      {n.type === 'message' && '💬'}
                    </span>
                    <span>{n.message}</span>
                    <span style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: 13 }}>{n.time}</span>
                  </li>
                ))}
              </ul>
              <div style={{ color: '#64748b', marginTop: 8 }}>
                {notifications.length === 0 ? 'No notifications yet.' : 'Real-time notifications enabled.'}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardNew;
