'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  age?: string;
  gender?: string;
  bloodGroup?: string;
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

interface Medicine {
  name: string;
  quantity: string;
}

interface Prescription {
  _id: string;
  patientName: string;
  disease: string;
  medicines: Medicine[];
  notes: string;
  date: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [backupData, setBackupData] = useState<any>(null);
  const [showPatientHistoryModal, setShowPatientHistoryModal] = useState(false);
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState<User | null>(null);

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
      const appointmentsResponse = await fetch('/api/appointment-requests?role=admin');
      if (!appointmentsResponse.ok) {
        throw new Error('Failed to fetch appointments');
      }
      const appointmentsData = await appointmentsResponse.json();
      setAppointments(appointmentsData);

      // Fetch prescriptions
      const prescriptionsResponse = await fetch('/api/prescriptions');
      if (!prescriptionsResponse.ok) {
        throw new Error('Failed to fetch prescriptions');
      }
      const prescriptionsData = await prescriptionsResponse.json();
      setPrescriptions(prescriptionsData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Log initial page load
    logAuditAction('view', 'Admin dashboard accessed');
    fetchData(); // Initial data fetch
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

  // Data Management Functions
  const exportToCSV = () => {
    const csv = Papa.unparse(users);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    logAuditAction('export', 'CSV export of users');
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(users);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, `users_${new Date().toISOString().split('T')[0]}.xlsx`);
    logAuditAction('export', 'Excel export of users');
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const results = Papa.parse(text, { header: true });
        const importedUsers = results.data as any[];
        
        // Validate imported data and add users through API
        for (const user of importedUsers) {
          if (user.email && user.name) { // Basic validation
            await fetch('/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(user),
            });
          }
        }
        
        await fetchData(); // Refresh the users list
        logAuditAction('import', `Imported ${importedUsers.length} users`);
        alert(`Successfully imported ${importedUsers.length} users`);
      } catch (error) {
        alert('Error importing users: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    };
    reader.readAsText(file);
  };

  const createBackup = () => {
    const backup = {
      users,
      appointments,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    setBackupData(backup);
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    logAuditAction('backup', 'Created system backup');
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string);
        if (!backup.users || !Array.isArray(backup.users) || !backup.appointments || !Array.isArray(backup.appointments)) {
          throw new Error('Invalid backup file format');
        }

        // Simplified restore logic: In a real app, you'd likely delete existing data or merge carefully.
        // For now, we'll just add the backup users/appointments (potential duplicates)
        for (const user of backup.users) {
          await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
          });
        }
        for (const appointment of backup.appointments) {
          await fetch('/api/appointment-requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointment),
          });
        }

        await fetchData(); // Refresh data after restore
        logAuditAction('restore', 'Restored system from backup');
        alert('System restored successfully');
      } catch (error) {
        alert('Error restoring backup: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    };
    reader.readAsText(file);
  };

  const logAuditAction = (action: string, details: string) => {
    const log = {
      action,
      details,
      timestamp: new Date().toISOString(),
      user: 'admin' // Placeholder: In a real app, use actual logged-in admin's info
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const handleViewPatientHistory = async (patient: User) => {
    setLoading(true); // Indicate loading while fetching latest data
    try {
      const prescriptionsResponse = await fetch('/api/prescriptions');
      if (!prescriptionsResponse.ok) {
        throw new Error('Failed to fetch prescriptions for history');
      }
      const latestPrescriptions = await prescriptionsResponse.json();
      setPrescriptions(latestPrescriptions);
      setSelectedPatientForHistory(patient);
      setShowPatientHistoryModal(true);
      logAuditAction('view', `Viewed medical history for ${patient.name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching history.');
    } finally {
      setLoading(false);
    }
  };

  const handleClosePatientHistoryModal = () => {
    setShowPatientHistoryModal(false);
    setSelectedPatientForHistory(null);
  };

  const getPatientPrescriptions = (patientName: string) => {
    return prescriptions.filter(p => p.patientName === patientName);
  };

  const getPatientDiagnoses = (patientName: string) => {
    const patientPrescriptions = getPatientPrescriptions(patientName);
    const diagnoses = Array.from(new Set(patientPrescriptions.map(p => p.disease).filter(Boolean)));
    return diagnoses.join(', ');
  };

  const exportAllPatientMedicalHistory = () => {
    if (prescriptions.length === 0) {
      alert('No prescription history found to export.');
      logAuditAction('export', 'Attempted to export all patient history (no data)');
      return;
    }

    const dataToExport = prescriptions.map((prescription) => ({
      "Patient Name": prescription.patientName,
      "Disease": prescription.disease,
      "Medicines": prescription.medicines.map(med => med.name).join(', '),
      "Notes": prescription.notes,
      "Prescription Date": new Date(prescription.date || prescription.createdAt).toLocaleDateString(),
      "Created At": new Date(prescription.createdAt).toLocaleString(),
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'All Patient History');
    XLSX.writeFile(wb, `all_patient_medical_history_${new Date().toISOString().split('T')[0]}.xlsx`);
    logAuditAction('export', 'Excel export of all patient medical history');
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

        {/* Data Management Controls */}
        <div style={{ marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={exportToCSV} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>
            Export CSV
          </button>
          <button onClick={exportToExcel} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>
            Export Excel
          </button>
          <label style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>
            Import Users
            <input type="file" accept=".csv,.xlsx" onChange={handleFileImport} style={{ display: 'none' }} />
          </label>
          <button onClick={createBackup} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>
            Create Backup
          </button>
          <label style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>
            Restore Backup
            <input type="file" accept=".json" onChange={handleRestore} style={{ display: 'none' }} />
          </label>
          <button onClick={exportAllPatientMedicalHistory} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>
            Export All Patient History
          </button>
          <button onClick={() => setShowAuditLogs(!showAuditLogs)} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>
            {showAuditLogs ? 'Hide Audit Logs' : 'Show Audit Logs'}
          </button>
        </div>

        {/* Audit Logs Section */}
        {showAuditLogs && (
          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#1e293b' }}>Audit Logs</h2>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Timestamp</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Action</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log, index) => (
                    <tr key={index}>
                      <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>
                        {new Date(log.timestamp).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          timeZone: 'Asia/Kolkata'
                        })}
                      </td>
                      <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>
                        {log.action}
                      </td>
                      <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
                      {user.role === 'patient' && (
                         <button 
                           onClick={() => handleViewPatientHistory(user)}
                           style={{
                             marginLeft: '8px',
                             padding: '6px 12px',
                             background: '#10b981',
                             color: 'white',
                             border: 'none',
                             borderRadius: '4px',
                             cursor: 'pointer',
                             fontSize: '14px',
                             fontWeight: 500,
                           }}
                         >
                           History
                         </button>
                       )}
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

      {/* Patient History Modal */}
      {showPatientHistoryModal && selectedPatientForHistory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#2563eb' }}>Patient Medical History</h2>
              <button
                onClick={handleClosePatientHistoryModal}
                style={{
                  padding: '8px 16px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Close
              </button>
            </div>

            {/* Patient Info */}
            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
              <p style={{ marginBottom: '8px' }}><strong>Name:</strong> {selectedPatientForHistory.name}</p>
              <p style={{ marginBottom: '8px' }}><strong>Email:</strong> {selectedPatientForHistory.email}</p>
              <p style={{ marginBottom: '8px' }}><strong>Age:</strong> {selectedPatientForHistory.age || 'N/A'}</p>
              <p style={{ marginBottom: '8px' }}><strong>Gender:</strong> {selectedPatientForHistory.gender || 'N/A'}</p>
              <p style={{ marginBottom: '8px' }}><strong>Blood Group:</strong> {selectedPatientForHistory.bloodGroup || 'N/A'}</p>
            </div>

            {/* Prescriptions List */}
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>Prescriptions:</h3>
              {getPatientPrescriptions(selectedPatientForHistory.name).length === 0 ? (
                <p>No prescriptions found for this patient.</p>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {getPatientPrescriptions(selectedPatientForHistory.name).map((prescription) => (
                    <div key={prescription._id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#f8fafc' }}>
                      <p style={{ marginBottom: '4px' }}><strong>Date:</strong> {new Date(prescription.date || prescription.createdAt).toLocaleDateString()}</p>
                      <p style={{ marginBottom: '4px' }}><strong>Medicines:</strong> {prescription.medicines.map(med => `${med.name} x${med.quantity}`).join(', ' )}</p>
                      {prescription.notes && <p style={{ marginBottom: '4px' }}><strong>Notes:</strong> {prescription.notes}</p>}
                      {prescription.disease && <p><strong>Diagnosis:</strong> {prescription.disease}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 