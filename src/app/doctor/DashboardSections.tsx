import React from 'react';

export const PatientManagement: React.FC = () => {
  // Placeholder patient data
  const patients = [
    { id: '1', name: 'John Doe', age: 35, lastVisit: '2024-05-01' },
    { id: '2', name: 'Jane Smith', age: 28, lastVisit: '2024-04-20' },
    { id: '3', name: 'Michael Johnson', age: 42, lastVisit: '2024-04-15' },
  ];

  return (
    <section style={{ marginBottom: 32 }}>
      <h2>Patient Management</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Age</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Last Visit</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(patient => (
            <tr key={patient.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 8 }}>{patient.name}</td>
              <td style={{ padding: 8 }}>{patient.age}</td>
              <td style={{ padding: 8 }}>{patient.lastVisit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export const AppointmentScheduling: React.FC = () => {
  // Placeholder appointments data
  const appointments = [
    { id: 'a1', patient: 'John Doe', date: '2024-06-01', time: '10:00 AM' },
    { id: 'a2', patient: 'Jane Smith', date: '2024-06-02', time: '2:00 PM' },
    { id: 'a3', patient: 'Michael Johnson', date: '2024-06-03', time: '11:30 AM' },
  ];

  return (
    <section style={{ marginBottom: 32 }}>
      <h2>Appointment Scheduling</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {appointments.map(app => (
          <li key={app.id} style={{ marginBottom: 8 }}>
            <strong>{app.patient}</strong> - {app.date} at {app.time}
          </li>
        ))}
      </ul>
      <button style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
        Schedule New Appointment
      </button>
    </section>
  );
};

export const RecentActivity: React.FC = () => {
  // Placeholder recent activity data
  const activities = [
    { id: 'r1', description: 'Prescription created for John Doe', date: '2024-05-10' },
    { id: 'r2', description: 'Appointment scheduled with Jane Smith', date: '2024-05-09' },
    { id: 'r3', description: 'Patient Michael Johnson updated profile', date: '2024-05-08' },
  ];

  return (
    <section style={{ marginBottom: 32 }}>
      <h2>Recent Activity</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {activities.map(act => (
          <li key={act.id} style={{ marginBottom: 8 }}>
            {act.description} - <em>{act.date}</em>
          </li>
        ))}
      </ul>
    </section>
  );
};

export const AnalyticsReports: React.FC = () => {
  // Placeholder analytics summary
  return (
    <section style={{ marginBottom: 32 }}>
      <h2>Analytics & Reports</h2>
      <p>Number of patients: 120</p>
      <p>Upcoming appointments: 15</p>
      <p>Prescriptions this month: 45</p>
      {/* Future: Add charts and detailed reports */}
    </section>
  );
};

export const QuickAccess: React.FC = () => {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2>Quick Access</h2>
      <div style={{ display: 'flex', gap: 12 }}>
        <a href="/doctor/prescription" style={{ padding: '12px 24px', backgroundColor: '#22c55e', color: 'white', borderRadius: 8, textDecoration: 'none' }}>
          Create Prescription
        </a>
        <a href="/doctor/patients" style={{ padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', borderRadius: 8, textDecoration: 'none' }}>
          View Patients
        </a>
        <a href="/doctor/appointments" style={{ padding: '12px 24px', backgroundColor: '#f59e0b', color: 'white', borderRadius: 8, textDecoration: 'none' }}>
          Manage Appointments
        </a>
      </div>
    </section>
  );
};
