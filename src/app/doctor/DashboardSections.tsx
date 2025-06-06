import React from 'react';

interface DashboardSectionsProps {
  selectedPatient: any;
  patientSearch: string;
  setPatientSearch: React.Dispatch<React.SetStateAction<string>>;
  patientResults: any[];
}

const DashboardSections: React.FC<DashboardSectionsProps> = ({
  selectedPatient,
  patientSearch,
  setPatientSearch,
  patientResults,
}) => {
  return (
    <div>
      <div style={{ marginTop: 32 }}>
        <h3 style={{ color: '#2563eb', fontWeight: 700, marginBottom: 8 }}>Patient Medical History</h3>
        {selectedPatient ? (
          <div>
            <div style={{ marginBottom: 8 }}><strong>Name:</strong> {selectedPatient.name}</div>
            {selectedPatient.age && (<div style={{ marginBottom: 8 }}><strong>Age:</strong> {selectedPatient.age}</div>)}
            {selectedPatient.gender && (<div style={{ marginBottom: 8 }}><strong>Gender:</strong> {selectedPatient.gender}</div>)}
            {selectedPatient.bloodGroup && (<div style={{ marginBottom: 8 }}><strong>Blood Group:</strong> {selectedPatient.bloodGroup}</div>)}
            {selectedPatient.diagnoses && selectedPatient.diagnoses.length > 0 && (
              <div style={{ marginBottom: 8 }}><strong>Diagnoses:</strong> {selectedPatient.diagnoses.join(', ')}</div>
            )}
            {selectedPatient.prescriptions && selectedPatient.prescriptions.length > 0 && (
              <div style={{ marginBottom: 8 }}><strong>Prescriptions:</strong>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {selectedPatient.prescriptions.map((pres: any, idx: number) => (
                    <li key={idx} style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>
                      <div><strong>Date:</strong> {pres.date} | <strong>Disease:</strong> {pres.disease}</div>
                      {pres.medicines && pres.medicines.length > 0 && (
                        <div style={{ marginTop: 4 }}>
                          <strong>Medicines:</strong>
                          <ul style={{ margin: 0, paddingLeft: 16 }}>
                            {pres.medicines.map((med: any, mIdx: number) => (
                              <li key={mIdx}>{med.name} x{med.quantity}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {pres.notes && (
                        <div style={{ marginTop: 4 }}><strong>Notes:</strong> {pres.notes}</div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: '#64748b' }}>No patient selected.</div>
        )}
      </div>
    </div>
  );
};

export default DashboardSections;
