'use client';

import React, { useEffect, useState } from "react";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

interface User {
  name: string;
  fullName?: string;
  email: string;
  password: string;
}

interface AuditLog {
  action: string;
  details: string;
  timestamp: string;
  user: string;
}

interface BackupData {
  users: User[];
  timestamp: string;
  version: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editUser, setEditUser] = useState<User>({ name: '', email: '', password: '' });
  const [newUser, setNewUser] = useState<User>({ name: '', email: '', password: '' });
  const [addMode, setAddMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [backupData, setBackupData] = useState<BackupData | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.map((user: User) => ({
        name: user.name || user.fullName || '',
        email: user.email || '',
        password: user.password || '',
      })));
    } catch (err) {
      setError('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: User) => {
    setEditUser({ ...user });
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditUser({ name: '', email: '', password: '' });
    setEditMode(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditUser({ ...editUser, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUser),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update user');
      }

      // Update local state
      setUsers(users.map(u => u.email === editUser.email ? editUser : u));
      setEditMode(false);
      setEditUser({ name: '', email: '', password: '' });
      alert('User updated successfully!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update user');
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete user ${user.name}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users?email=${encodeURIComponent(user.email)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      // Update local state
      setUsers(users.filter(u => u.email !== user.email));
      alert('User deleted successfully!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete user');
    }
  };

  const handleAddNewUser = () => setAddMode(true);

  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleSaveNewUser = async () => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add new user');
      }

      // Refresh the users list
      await fetchUsers();
      setAddMode(false);
      setNewUser({ name: '', email: '', password: '' });
      alert('New user added successfully!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add new user');
    }
  };

  const handleCancelNewUser = () => {
    setNewUser({ name: '', email: '', password: '' });
    setAddMode(false);
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
        const importedUsers = results.data as User[];
        
        // Validate imported data
        const validUsers = importedUsers.filter(user => user.email && user.name);
        
        // Add users through API
        for (const user of validUsers) {
          await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
          });
        }
        
        await fetchUsers();
        logAuditAction('import', `Imported ${validUsers.length} users`);
        alert(`Successfully imported ${validUsers.length} users`);
      } catch (error) {
        alert('Error importing users: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    };
    reader.readAsText(file);
  };

  const createBackup = () => {
    const backup: BackupData = {
      users,
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
        const backup = JSON.parse(e.target?.result as string) as BackupData;
        if (!backup.users || !Array.isArray(backup.users)) {
          throw new Error('Invalid backup file format');
        }

        // Restore users
        for (const user of backup.users) {
          await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
          });
        }

        await fetchUsers();
        logAuditAction('restore', 'Restored system from backup');
        alert('System restored successfully');
      } catch (err) {
        alert('Error restoring backup: ' + (err instanceof Error ? err.message : 'Unknown error'));
      }
    };
    reader.readAsText(file);
  };

  const logAuditAction = (action: string, details: string) => {
    const log: AuditLog = {
      action,
      details,
      timestamp: new Date().toISOString(),
      user: 'admin' // In a real app, this would be the logged-in admin's info
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  // Add this before the return statement
  useEffect(() => {
    // Log initial page load
    logAuditAction('view', 'Admin page accessed');
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f7faff', fontFamily: 'Segoe UI, Arial, sans-serif', padding: 32 }}>
      <h1 style={{ fontWeight: 700, fontSize: 28, color: '#2563eb', marginBottom: 24 }}>Admin Panel</h1>
      
      {/* Data Management Controls */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
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
                      {new Date(log.timestamp).toLocaleString()}
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

      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24, maxWidth: 700 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#1e293b' }}>Users List</h2>
        {error && (
          <div style={{ color: '#ef4444', marginBottom: 16 }}>{error}</div>
        )}
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
                  <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>
                    {editMode && editUser.email === user.email ? (
                      <input
                        name="name"
                        value={editUser.name}
                        onChange={handleChange}
                        style={{ width: '100%', padding: 4 }}
                      />
                    ) : (
                      user.name
                    )}
                  </td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>
                    {editMode && editUser.email === user.email ? (
                      <input
                        name="email"
                        value={editUser.email}
                        onChange={handleChange}
                        style={{ width: '100%', padding: 4 }}
                      />
                    ) : (
                      user.email || <span style={{ color: '#64748b' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>
                    {editMode && editUser.email === user.email ? (
                      <input
                        name="password"
                        type="password"
                        value={editUser.password}
                        onChange={handleChange}
                        style={{ width: '100%', padding: 4 }}
                      />
                    ) : (
                      user.password || <span style={{ color: '#64748b' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>
                    {editMode && editUser.email === user.email ? (
                      <>
                        <button onClick={handleSave} style={{ marginRight: 8, background: '#10b981', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Save</button>
                        <button onClick={handleCancel} style={{ background: '#64748b', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(user)} style={{ marginRight: 8, background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => handleDelete(user)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ color: '#ef4444' }}>No users found.</div>
        )}
        <div style={{ marginTop: 32 }}>
          <button onClick={handleAddNewUser} style={{ marginBottom: 16, background: '#10b981', color: 'white', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>Add New User</button>
          {addMode && (
            <div style={{ marginBottom: 16, padding: 16, background: '#f1f5f9', borderRadius: 8 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Add New User</h3>
              <div style={{ marginBottom: 8 }}>
                <input name="name" placeholder="Name" value={newUser.name} onChange={handleNewUserChange} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
                <input name="email" placeholder="Email" value={newUser.email} onChange={handleNewUserChange} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
                <input name="password" placeholder="Password" value={newUser.password} onChange={handleNewUserChange} style={{ width: '100%', padding: 8 }} type="password" />
              </div>
              <button onClick={handleSaveNewUser} style={{ marginRight: 8, background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Save</button>
              <button onClick={handleCancelNewUser} style={{ background: '#64748b', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}