'use client';

import React, { useEffect, useState } from "react";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editUser, setEditUser] = useState<any>({});
  const [newUser, setNewUser] = useState<any>({ name: '', email: '', password: '' });
  const [addMode, setAddMode] = useState(false);

  const [patientId, setPatientId] = useState('');
  const [reports, setReports] = useState<any[]>([]);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUsers(data.map((user: any) => ({
          name: user.name || user.fullName || '',
          email: user.email || '',
          password: user.password || '',
        })));
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const fetchReports = async () => {
    setReportLoading(true);
    try {
      const res = await fetch(`/api/reports?patientId=${patientId}`);
      if (!res.ok) throw new Error('Failed to fetch reports');
      const data = await res.json();
      setReports(data);
    } catch {
      setReports([]);
    } finally {
      setReportLoading(false);
    }
  };

  const handleEdit = (user: any) => {
    setEditUser(user);
    setEditMode(true);
  };
  const handleCancel = () => {
    setEditUser(users);
    setEditMode(false);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditUser({ ...editUser, [e.target.name]: e.target.value });
  };
  const handleSave = async () => {
    setUsers(editUser);
    setEditMode(false);
    alert('User updated (not saved to backend)');
  };
  const handleDelete = async (user: any) => {
    setUsers(users.filter(u => u !== user));
    alert('User deleted (not deleted from backend)');
  };
  const handleAddNewUser = () => setAddMode(true);
  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };
  const handleSaveNewUser = async () => {
    setUsers([...users, newUser]);
    setAddMode(false);
    alert('New user added (not saved to backend)');
  };
  const handleCancelNewUser = () => {
    setNewUser({ name: '', email: '', password: '' });
    setAddMode(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f7faff', fontFamily: 'Segoe UI, Arial, sans-serif', padding: 32 }}>
      <h1 style={{ fontWeight: 700, fontSize: 28, color: '#2563eb', marginBottom: 24 }}>Admin Panel</h1>
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24, maxWidth: 700 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#1e293b' }}>Users List</h2>
        {loading ? (
          <div>Loading user details...</div>
        ) : users.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Name</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Email</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Password</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index}>
                  <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>{user.name}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>{user.email || <span style={{ color: '#64748b' }}>-</span>}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>{user.password || <span style={{ color: '#64748b' }}>-</span>}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>
                    <button onClick={() => handleEdit(user)} style={{ marginRight: 8, background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(user)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ color: '#ef4444' }}>No users are currently logged in.</div>
        )}

        {/* Add new user form */}
        <div style={{ marginTop: 32 }}>
          <button onClick={handleAddNewUser} style={{ marginBottom: 16, background: '#10b981', color: 'white', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>Add New User</button>
          {addMode && (
            <div style={{ marginBottom: 16, padding: 16, background: '#f1f5f9', borderRadius: 8 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Add New User</h3>
              <input name="name" placeholder="Name" value={newUser.name} onChange={handleNewUserChange} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
              <input name="email" placeholder="Email" value={newUser.email} onChange={handleNewUserChange} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
              <input name="password" placeholder="Password" value={newUser.password} onChange={handleNewUserChange} style={{ width: '100%', padding: 8 }} type="password" />
              <div style={{ marginTop: 8 }}>
                <button onClick={handleSaveNewUser} style={{ marginRight: 8, background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Save</button>
                <button onClick={handleCancelNewUser} style={{ background: '#64748b', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report section */}
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24, maxWidth: 700, marginTop: 48 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#1e293b' }}>Patient Reports</h2>
        <input
          type="text"
          placeholder="Enter Patient ID"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          style={{ width: '70%', padding: 8, marginRight: 8 }}
        />
        <button
          onClick={fetchReports}
          style={{ padding: '8px 16px', background: '#2563eb', color: 'white', borderRadius: 4, border: 'none', cursor: 'pointer' }}
        >
          Get Reports
        </button>
        {reportLoading ? (
          <p style={{ marginTop: 16 }}>Loading reports...</p>
        ) : reports.length > 0 ? (
          <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse', fontSize: 16 }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>Patient ID</th>
                <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>Name</th>
                <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>Age</th>
                <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>Blood Group</th>
                <th style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <tr key={index}>
                  <td style={{ padding: 8 }}>{report.patientId}</td>
                  <td style={{ padding: 8 }}>{report.patientName}</td>
                  <td style={{ padding: 8 }}>{report.age}</td>
                  <td style={{ padding: 8 }}>{report.bloodGroup}</td>
                  <td style={{ padding: 8 }}>{report.details || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ marginTop: 16 }}>No reports found.</p>
        )}
      </div>
    </div>
  );
}
