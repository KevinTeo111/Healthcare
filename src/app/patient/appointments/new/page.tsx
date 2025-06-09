'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BookAppointmentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    patientGender: '',
    patientBloodGroup: '',
    preferredDate: '',
    preferredTime: '',
    notes: '',
    // You might want to add a field here to select a doctor if you have multiple
    // doctorId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!formData.patientName || !formData.preferredDate || !formData.preferredTime) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      // Assuming a new API endpoint for appointment requests
      const res = await fetch('/api/appointment-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, requestedBy: localStorage.getItem('userEmail') }), // Include patient's email
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to request appointment');
      }

      setSuccess('Appointment request submitted successfully! You will be notified once it is reviewed by the doctor.');
      setFormData({ // Clear form
        patientName: '',
        patientAge: '',
        patientGender: '',
        patientBloodGroup: '',
        preferredDate: '',
        preferredTime: '',
        notes: '',
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit appointment request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#f7faff',
      minHeight: '100vh',
      fontFamily: 'Segoe UI, Arial, sans-serif',
    }}>
      {/* This div acts as the main content wrapper, handling max-width, centering, and padding */}
      <div style={{
        margin: '0 300px', // Center the content block horizontally
        padding: '50px', // Consistent padding around the content block
      }}>
        <h1 style={{
          fontWeight: 700,
          fontSize: 28,
          color: '#2563eb',
          marginBottom: 24,
          textAlign: 'center',
          width: '100%', // Title stretches to fill the content wrapper
        }}>Book New Appointment</h1>

        <div style={{
          background: 'white',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          padding: 24, // Internal padding for form fields
          width: '100%', // Form stretches to fill the content wrapper
        }}>
          {error && (
            <div style={{ color: '#ef4444', marginBottom: 16 }}>{error}</div>
          )}
          {success && (
            <div style={{ color: '#10b981', marginBottom: 16 }}>{success}</div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3>Patient Details</h3>
            <div>
              <label htmlFor="patientName" style={{ display: 'block', marginBottom: '8px', color: '#1e293b' }}>Patient Name:</label>
              <input type="text" id="patientName" name="patientName" value={formData.patientName} onChange={handleChange} required style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            </div>
             <div>
              <label htmlFor="patientAge" style={{ display: 'block', marginBottom: '8px', color: '#1e293b' }}>Age:</label>
              <input type="number" id="patientAge" name="patientAge" value={formData.patientAge} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            </div>
            <div>
              <label htmlFor="patientGender" style={{ display: 'block', marginBottom: '8px', color: '#1e293b' }}>Gender:</label>
              <select id="patientGender" name="patientGender" value={formData.patientGender} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="patientBloodGroup" style={{ display: 'block', marginBottom: '8px', color: '#1e293b' }}>Blood Group:</label>
              <input type="text" id="patientBloodGroup" name="patientBloodGroup" value={formData.patientBloodGroup} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            </div>

            <h3 style={{ marginTop: '24px' }}>Appointment Details</h3>
            <div>
              <label htmlFor="preferredDate" style={{ display: 'block', marginBottom: '8px', color: '#1e293b' }}>Preferred Date:</label>
              <input type="date" id="preferredDate" name="preferredDate" value={formData.preferredDate} onChange={handleChange} required style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            </div>
            <div>
              <label htmlFor="preferredTime" style={{ display: 'block', marginBottom: '8px', color: '#1e293b' }}>Preferred Time:</label>
              <input type="time" id="preferredTime" name="preferredTime" value={formData.preferredTime} onChange={handleChange} required style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            </div>
             <div>
              <label htmlFor="notes" style={{ display: 'block', marginBottom: '8px', color: '#1e293b' }}>Notes (Optional):</label>
              <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', minHeight: '80px' }} />
            </div>

            <button type="submit" disabled={loading} style={{
              padding: '10px 20px',
              background: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              marginTop: '24px'
            }}>
              {loading ? 'Submitting Request...' : 'Submit Appointment Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 