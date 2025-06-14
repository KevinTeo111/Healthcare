'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AppointmentDetails {
  _id: string;
  patientName: string;
  patientAge: string;
  patientGender: string;
  patientBloodGroup: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
  status: string;
  requestedBy: string;
  createdAt: string;
}

interface Medicine {
  name: string;
  quantity: string;
}

export default function AppointmentDetailsPage({ params }: { params: Promise<{ requestId: string }> }) {
  const router = useRouter();
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prescription, setPrescription] = useState({
    disease: '',
    medicines: [] as Medicine[],
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMedicine, setNewMedicine] = useState({ name: '', quantity: '' });
  const [requestId, setRequestId] = useState<string>('');

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        const { requestId: id } = await params;
        setRequestId(id);
        const response = await fetch(`/api/appointment-requests/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch appointment details');
        }
        const data = await response.json();
        setAppointment(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [params]);

  const handleAddMedicine = () => {
    if (newMedicine.name.trim() && newMedicine.quantity.trim()) {
      setPrescription(prev => ({
        ...prev,
        medicines: [...prev.medicines, { ...newMedicine }]
      }));
      setNewMedicine({ name: '', quantity: '' });
    }
  };

  const handleRemoveMedicine = (index: number) => {
    setPrescription(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const handlePrescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientName: appointment?.patientName,
          age: appointment?.patientAge,
          gender: appointment?.patientGender,
          bloodGroup: appointment?.patientBloodGroup,
          doctorName: localStorage.getItem('userName') || 'Dr. Smith',
          date: new Date().toISOString(),
          disease: prescription.disease,
          notes: prescription.notes,
          medicines: prescription.medicines,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save prescription');
      }

      await fetch(`/api/appointment-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' }),
      });

      router.push('/dashboard/doctor/appointments');
      // Reset prescription form fields after successful submission
      setPrescription({
        disease: '',
        medicines: [],
        notes: '',
      });
      setNewMedicine({ name: '', quantity: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save prescription');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        Loading appointment details...
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div style={{ padding: '32px', color: '#ef4444' }}>
        {error || 'Appointment not found'}
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
          Patient Appointment Details
        </h1>

        {/* Patient Information Card */}
        <div style={{ 
          background: 'white', 
          borderRadius: 12, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)', 
          padding: 24, 
          marginBottom: 24 
        }}>
          <h2 style={{ color: '#1e293b', marginBottom: 16 }}>Patient Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <p style={{ color: '#64748b', marginBottom: 4 }}>Name</p>
              <p style={{ fontWeight: 500 }}>{appointment.patientName}</p>
            </div>
            <div>
              <p style={{ color: '#64748b', marginBottom: 4 }}>Age</p>
              <p style={{ fontWeight: 500 }}>{appointment.patientAge}</p>
            </div>
            <div>
              <p style={{ color: '#64748b', marginBottom: 4 }}>Gender</p>
              <p style={{ fontWeight: 500 }}>{appointment.patientGender}</p>
            </div>
            <div>
              <p style={{ color: '#64748b', marginBottom: 4 }}>Blood Group</p>
              <p style={{ fontWeight: 500 }}>{appointment.patientBloodGroup}</p>
            </div>
          </div>
        </div>

        {/* Appointment Details Card */}
        <div style={{ 
          background: 'white', 
          borderRadius: 12, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)', 
          padding: 24, 
          marginBottom: 24 
        }}>
          <h2 style={{ color: '#1e293b', marginBottom: 16 }}>Appointment Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <p style={{ color: '#64748b', marginBottom: 4 }}>Date</p>
              <p style={{ fontWeight: 500 }}>{new Date(appointment.preferredDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p style={{ color: '#64748b', marginBottom: 4 }}>Time</p>
              <p style={{ fontWeight: 500 }}>{appointment.preferredTime}</p>
            </div>
            <div>
              <p style={{ color: '#64748b', marginBottom: 4 }}>Status</p>
              <p style={{ 
                fontWeight: 500,
                color: appointment.status === 'accepted' ? '#10b981' : 
                       appointment.status === 'rejected' ? '#ef4444' : 
                       '#f59e0b'
              }}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </p>
            </div>
            <div>
              <p style={{ color: '#64748b', marginBottom: 4 }}>Requested On</p>
              <p style={{ fontWeight: 500 }}>{new Date(appointment.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          {appointment.notes && (
            <div style={{ marginTop: 16 }}>
              <p style={{ color: '#64748b', marginBottom: 4 }}>Patient Notes</p>
              <p style={{ fontWeight: 500 }}>{appointment.notes}</p>
            </div>
          )}
        </div>

        {/* Prescription Form */}
        {appointment.status === 'accepted' && (
          <div style={{ 
            background: 'white', 
            borderRadius: 12, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)', 
            padding: 24 
          }}>
            <h2 style={{ color: '#1e293b', marginBottom: 16 }}>Add Prescription</h2>
            <form onSubmit={handlePrescriptionSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, color: '#1e293b' }}>
                  Disease/Condition
                </label>
                <input
                  type="text"
                  value={prescription.disease}
                  onChange={(e) => setPrescription(prev => ({ ...prev, disease: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, color: '#1e293b' }}>
                  Medicines
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={newMedicine.name}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Medicine name"
                    style={{
                      flex: 1,
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px'
                    }}
                  />
                  <input
                    type="text"
                    value={newMedicine.quantity}
                    onChange={(e) => setNewMedicine(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="Quantity"
                    style={{
                      width: '120px',
                      padding: '8px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    style={{
                      padding: '8px 16px',
                      background: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Add
                  </button>
                </div>
                {prescription.medicines.length > 0 && (
                  <div style={{ 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '4px', 
                    padding: '8px',
                    marginTop: '8px'
                  }}>
                    {prescription.medicines.map((medicine, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '4px 0',
                        borderBottom: index < prescription.medicines.length - 1 ? '1px solid #e2e8f0' : 'none'
                      }}>
                        <div>
                          <span style={{ fontWeight: 500 }}>{medicine.name}</span>
                          <span style={{ marginLeft: '8px', color: '#64748b' }}>{medicine.quantity}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(index)}
                          style={{
                            padding: '4px 8px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, color: '#1e293b' }}>
                  Additional Notes
                </label>
                <textarea
                  value={prescription.notes}
                  onChange={(e) => setPrescription(prev => ({ ...prev, notes: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    minHeight: '80px'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '10px 20px',
                  background: isSubmitting ? '#9ca3af' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                {isSubmitting ? 'Saving...' : 'Save Prescription'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
} 