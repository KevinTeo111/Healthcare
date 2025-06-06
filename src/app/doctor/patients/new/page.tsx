'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddPatientPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    bloodGroup: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add patient');
      }

      setSuccess('Patient added successfully!');
      setFormData({ name: '', age: '', gender: '', bloodGroup: '' }); // Clear form
      // Optional: Redirect after a delay
      // setTimeout(() => router.push('/doctor/patients'), 2000); // Redirect to patient list if you have one

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add patient.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '32px',
      background: '#f7faff',
      minHeight: '100vh',
      fontFamily: 'Segoe UI, Arial, sans-serif'
    }}>
      <h1 style={{ fontWeight: 700, fontSize: 28, color: '#2563eb', marginBottom: 24 }}>Add New Patient</h1>
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24, maxWidth: 500 }}>
        {error && (
          <div style={{ color: '#ef4444', marginBottom: 16 }}>{error}</div>
        )}
        {success && (
          <div style={{ color: '#10b981', marginBottom: 16 }}>{success}</div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '8px', color: '#1e293b' }}>Name:</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
          <div>
            <label htmlFor="age" style={{ display: 'block', marginBottom: '8px', color: '#1e293b' }}>Age:</label>
            <input type="number" id="age" name="age" value={formData.age} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
          <div>
            <label htmlFor="gender" style={{ display: 'block', marginBottom: '8px', color: '#1e293b' }}>Gender:</label>
            <select id="gender" name="gender" value={formData.gender} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="bloodGroup" style={{ display: 'block', marginBottom: '8px', color: '#1e293b' }}>Blood Group:</label>
            <input type="text" id="bloodGroup" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
          <button type="submit" disabled={loading} style={{
            padding: '10px 20px',
            background: loading ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '600'
          }}>
            {loading ? 'Adding Patient...' : 'Add Patient'}
          </button>
        </form>
      </div>
    </div>
  );
} 