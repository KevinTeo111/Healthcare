import React from 'react';


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
      </div>
    </section>
  );
};
