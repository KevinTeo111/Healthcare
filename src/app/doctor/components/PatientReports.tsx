import React, { useState, useEffect } from 'react';

interface PatientReportsProps {
  patientReports: any[];
  selectedPatient: any;
  setPatientReports: React.Dispatch<React.SetStateAction<any[]>>;
  patientSearch: string;
  patientResults: any[];
  setPatientSearch: React.Dispatch<React.SetStateAction<string>>; // Add setPatientSearch prop type
}

const PatientReports: React.FC<PatientReportsProps> = ({
  patientReports,
  selectedPatient,
  setPatientReports,
  patientSearch,
  patientResults,
  setPatientSearch, // Destructure setPatientSearch prop
}) => {
  const [selectedReportFile, setSelectedReportFile] = useState<File | null>(null);
  const [localPatientSearch, setLocalPatientSearch] = useState(patientSearch); // Local state for patient search

  const handleReportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedReportFile(file);
    }
  };

  const fetchReportsFromDatabase = async () => {
    if (!selectedPatient) {
      console.error('Error: No patient selected. Cannot fetch reports.');
      return;
    }

    try {
      console.log('Fetching reports for:', selectedPatient);
      const response = await fetch(
        `/api/reports?patientName=${encodeURIComponent(selectedPatient.name)}&age=${encodeURIComponent(
          selectedPatient.age || 'Unknown'
        )}&bloodGroup=${encodeURIComponent(selectedPatient.bloodGroup || 'Unknown')}`
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to fetch reports: ${errorMessage}`);
      }

      const reports = await response.json();
      setPatientReports(reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  useEffect(() => {
    if (!selectedPatient) {
      console.warn('No patient selected. Skipping fetchReportsFromDatabase call.');
      return;
    }

    const fetchReports = async () => {
      try {
        await fetchReportsFromDatabase();
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchReports();
  }, [selectedPatient]);

  useEffect(() => {
    setLocalPatientSearch(patientSearch); // Sync local state with parent state when it changes
  }, [patientSearch]);

  // Enhance patient validation and allow custom report upload for new patients
  const uploadReport = async () => {
    if (!selectedReportFile) {
      alert('Error: No report file selected. Please choose a file to upload.');
      return;
    }

    if (!patientSearch.trim()) {
      alert('Error: Patient name is missing. Please enter a patient name to search.');
      return;
    }

    const patient = patientResults.find(
      (p) =>
        p.name.toLowerCase() === patientSearch.toLowerCase() &&
        p.age === selectedPatient?.age &&
        p.bloodGroup === selectedPatient?.bloodGroup
    );

    const formData = new FormData();
    formData.append('fileName', selectedReportFile.name);
    formData.append('file', selectedReportFile);

    if (patient) {
      // Existing patient
      formData.append('patientName', patient.name);
      formData.append('age', patient.age);
      formData.append('bloodGroup', patient.bloodGroup);
    } else {
      // New patient
      formData.append('patientName', patientSearch);
      formData.append('age', 'Unknown');
      formData.append('bloodGroup', 'Unknown');
    }

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to upload report: ${errorMessage}`);
      }

      alert('Success: Report uploaded successfully!');
      fetchReportsFromDatabase();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error uploading report:', error);
      alert(`Error: Failed to upload report. ${errorMessage}`);
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <h3 style={{ color: '#2563eb', fontWeight: 700, marginBottom: 8 }}>Upload Patient Report</h3>
      <input
        type="text"
        placeholder="Enter patient name"
        value={localPatientSearch}
        onChange={(e) => setLocalPatientSearch(e.target.value)}
        onBlur={() => setPatientSearch(localPatientSearch)}
        style={{ marginBottom: 8, padding: '8px', width: '100%', borderRadius: 4, border: '1px solid #ccc' }}
      />
      {patientResults.length > 0 ? (
        <div style={{ marginBottom: 8 }}>
          <strong>Matching Patients:</strong>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {patientResults.map((p) => (
              <li key={p.id} style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>
                {p.name} (Age: {p.age}, Blood Group: {p.bloodGroup})
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div style={{ marginBottom: 8, color: '#64748b' }}>
          No matching patients found. You can upload a report for a new patient.
        </div>
      )}
      <input
        type="file"
        onChange={handleReportUpload}
        style={{ marginBottom: 8 }}
      />
      <button
        type="button"
        onClick={uploadReport}
        style={{
          padding: '10px 16px',
          background: '#10b981',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Upload Report
      </button>
      {selectedPatient?.reports?.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <strong>Reports:</strong>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {selectedPatient.reports.map((report: any, idx: number) => (
              <li
                key={idx}
                style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}
              >
                <strong>File Name:</strong> {report.fileName}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PatientReports;
