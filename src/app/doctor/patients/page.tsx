'use client';

import React, { useEffect, useState } from 'react';
import Footer from '../../components/Footer';

interface Patient {
  id: string;
  name: string;
  age: number;
  lastVisit: string;
}

interface Appointment {
  _id?: string;
  id?: string;
  patient: string;
  date: string;
  time: string;
}

interface Prescription {
  _id?: string;
  id?: string;
  patientName: string;
  disease?: string;
  notes?: string;
  medicines?: any[];
  createdAt?: string;
}

const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [patientsRes, prescriptionsRes, appointmentsRes] = await Promise.all([
          fetch('/api/patients', { cache: 'no-store' }),
          fetch('/api/prescriptions', { cache: 'no-store' }),
          fetch('/api/appointments', { cache: 'no-store' }),
        ]);
        if (!patientsRes.ok || !prescriptionsRes.ok || !appointmentsRes.ok) {
          throw new Error('Failed to fetch data');
        }
        const [patientsData, prescriptionsData, appointmentsData] = await Promise.all([
          patientsRes.json(),
          prescriptionsRes.json(),
          appointmentsRes.json(),
        ]);
        setPatients(patientsData);
        setPrescriptions(prescriptionsData);
        setAppointments(appointmentsData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    // Listen for tab visibility change to refresh data
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchAll();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  if (loading) {
    return <div style={{ padding: 24 }}>Loading patients...</div>;
  }

  if (error) {
    return <div style={{ padding: 24, color: 'red' }}>Error: {error}</div>;
  }

  // Helper: get prescription/appointment for a patient
  const getPatientPrescriptions = (name: string) =>
    prescriptions.filter(p => p.patientName === name);
  const getPatientAppointments = (name: string) =>
    appointments.filter(a => a.patient === name);

  return (
    <div style={{ padding: 24, fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: '100vh' }}>
      <h1>Patients (with Appointments or Prescriptions)</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 32 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Age</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Last Visit</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Appointments</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Prescriptions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(patient => {
            const patientAppointments = getPatientAppointments(patient.name);
            const patientPrescriptions = getPatientPrescriptions(patient.name);
            if (patientAppointments.length === 0 && patientPrescriptions.length === 0) return null;
            return (
              <tr key={patient.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{patient.name}</td>
                <td style={{ padding: 8 }}>{patient.age}</td>
                <td style={{ padding: 8 }}>{patient.lastVisit}</td>
                <td style={{ padding: 8 }}>
                  {patientAppointments.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {patientAppointments.map(a => (
                        <li key={a._id || a.id}>{a.date} {a.time}</li>
                      ))}
                    </ul>
                  ) : '—'}
                </td>
                <td style={{ padding: 8 }}>
                  {patientPrescriptions.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {patientPrescriptions.map(p => (
                        <li key={p._id || p.id}>{p.disease || '—'} ({p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''})</li>
                      ))}
                    </ul>
                  ) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Footer />
    </div>
  );
};

export default PatientsPage;
