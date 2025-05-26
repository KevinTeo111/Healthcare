'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Medicine {
  id: string;
  name: string;
  price: string;
  manufacturer_name: string;
  pack_size_label: string;
  short_composition1: string;
  short_composition2: string;
}

interface PrescriptionMedicine {
  medicine: Medicine;
  quantity: number;
}

const bloodGroups = [
  '', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

const PrescriptionPage: React.FC = () => {
  const [patientName, setPatientName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [prescriptionMedicines, setPrescriptionMedicines] = useState<PrescriptionMedicine[]>([]);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [doctorName, setDoctorName] = useState('Ketan Patel');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [bloodGroup, setBloodGroup] = useState('');
  const [disease, setDisease] = useState('');

  useEffect(() => {
    fetch('/filtered_medicines.json')
      .then(res => res.json())
      .then((meds: Medicine[]) => setMedicines(meds));
  }, []);

  useEffect(() => {
    if (searchTerm.length < 1) {
      setSearchResults([]);
      return;
    }
    // Show all medicines if any character is typed
    setSearchResults(
      medicines.filter(med => med.name && med.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, medicines]);

  const addMedicine = (medicine: Medicine) => {
    if (prescriptionMedicines.find(pm => pm.medicine.id === medicine.id)) {
      return; // already added
    }
    setPrescriptionMedicines([...prescriptionMedicines, { medicine, quantity: 1 }]);
    setSearchTerm('');
    setSearchResults([]);
  };

  // Allow selecting multiple medicines from the suggestion list
  const handleMedicineSelect = (medicine: Medicine) => {
    const idx = prescriptionMedicines.findIndex(pm => pm.medicine.name === medicine.name);
    if (idx !== -1) {
      // Increment quantity
      const updated = [...prescriptionMedicines];
      updated[idx].quantity += 1;
      setPrescriptionMedicines(updated);
    } else {
      setPrescriptionMedicines([...prescriptionMedicines, { medicine, quantity: 1 }]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  const removeMedicine = (idOrName: string) => {
    setPrescriptionMedicines(prev => {
      const idx = prev.findIndex(pm => (pm.medicine.id || pm.medicine.name) === idOrName);
      if (idx === -1) return prev;
      // Only decrease by 1 if quantity > 1, else remove
      if (prev[idx].quantity > 1) {
        // Create a new array and only update the quantity for the matched item
        return prev.map((pm, i) =>
          i === idx ? { ...pm, quantity: pm.quantity - 1 } : pm
        );
      } else {
        return prev.filter(pm => (pm.medicine.id || pm.medicine.name) !== idOrName);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate all required fields
    if (!patientName.trim() || !age.trim() || !gender.trim() || !doctorName.trim() || !date.trim()) {
      alert('Please fill all required fields.');
      return;
    }
    if (prescriptionMedicines.length === 0) {
      alert('Please add at least one medicine.');
      return;
    }
    const prescriptionData = {
      patientName,
      disease,
      notes,
      medicines: prescriptionMedicines.map(pm => ({
        id: pm.medicine.id,
        name: pm.medicine.name,
        quantity: pm.quantity
      })),
      createdAt: new Date(),
    };
    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prescriptionData),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        alert('Failed to save prescription');
      }
    } catch {
      alert('Failed to save prescription');
    }
  };

  const savePrescription = async () => {
    if (!patientName.trim() || !age.trim() || !gender.trim() || !doctorName.trim() || !date.trim()) {
      alert('Please fill all required fields.');
      return false;
    }
    if (prescriptionMedicines.length === 0) {
      alert('Please add at least one medicine.');
      return false;
    }
    const prescriptionData = {
      patientName,
      disease,
      notes,
      medicines: prescriptionMedicines.map(pm => ({
        id: pm.medicine.id,
        name: pm.medicine.name,
        quantity: pm.quantity
      })),
      createdAt: new Date(),
    };
    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prescriptionData),
      });
      if (!res.ok) {
        alert('Failed to save prescription');
        return false;
      }
      return true;
    } catch {
      alert('Failed to save prescription');
      return false;
    }
  };

  const downloadPrescription = async () => {
    const saved = await savePrescription();
    if (!saved) return;
    const element = document.createElement('a');
    const content = `
Prescription
Patient Name: ${patientName}
Disease: ${disease}
Medicines:
${prescriptionMedicines.map(pm => `- ${pm.medicine.name} x${pm.quantity}`).join('\n')}
Notes: ${notes}
    `;
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'prescription.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // ...existing code...
const printPrescription = async () => {
    const saved = await savePrescription();
    if (!saved) return;
    const printContent = `
      <html><head><title>Prescription</title>
      <style>
        body { font-family: 'Montserrat', Arial, sans-serif; font-size: 22px; color: #22223b; padding: 32px; }
        h1 { font-size: 2 em; color:rgb(18, 29, 53); margin-bottom: 0.5em; }
        p, ul { font-size: 1.25em; margin-bottom: 1em; }
        ul { padding-left: 1.5em; }
        li { font-size: 1.15em; margin-bottom: 0.5em; }
        strong { color: #2563eb; }
        .section-label { font-weight: bold; color: #22223b; }
        .details-table { width: 100%; border-collapse: collapse; margin-bottom: 1.5em; }
        .details-table td { padding: 6px 12px; font-size: 1.1em; }
        .details-table tr:nth-child(even) { background: #f3f6fa; }
        .med-table { width: 100%; border-collapse: collapse; margin-bottom: 1.5em; }
        .med-table th, .med-table td { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 1.1em; }
        .med-table th { background: #e0e7ff; color: #22223b; font-weight: bold; }
        @media print {
          @page { margin: 0; }
          body { margin: 0; box-shadow: none; }
          header, footer { display: none !important; }
        }
      </style>
      </head><body>
      <h1>Prescription</h1>
      <table class="details-table">
        <tr><td class="section-label">Patient Name:</td><td>${patientName}</td></tr>
        <tr><td class="section-label">Disease:</td><td>${disease || '-'}</td></tr>
        <tr><td class="section-label">Age:</td><td>${age}</td></tr>
        <tr><td class="section-label">Gender:</td><td>${gender}</td></tr>
        <tr><td class="section-label">Doctor Name:</td><td>${doctorName}</td></tr>
        <tr><td class="section-label">Date:</td><td>${date}</td></tr>
      </table>
      <div class="section-label" style="margin-bottom: 0.5em;">Medicines:</div>
      <table class="med-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Quantity</th>
            <th>Manufacturer</th>
            <th>Pack Size</th>
          </tr>
        </thead>
        <tbody>
          ${prescriptionMedicines.map(pm => `
            <tr>
              <td>${pm.medicine.name}</td>
              <td>${pm.quantity}</td>
              <td>${pm.medicine.manufacturer_name || '-'}</td>
              <td>${pm.medicine.pack_size_label || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="section-label" style="margin-bottom: 0.5em;">Notes:</div>
      <ul style="font-size: 1.15em; margin-bottom: 2em;">
        ${
          notes
            ? notes
                .split('\n')
                .filter(line => line.trim() !== '')
                .map(line => `<li>${line}</li>`)
                .join('')
            : '<li>-</li>'
        }
      </ul>
      </body></html>
    `;
    const newWindow = window.open('', '', 'width=800,height=800');
    if (newWindow) {
      newWindow.document.write(printContent);
      newWindow.document.close();
      newWindow.focus();
      newWindow.print();
      newWindow.close();
    }
  };
// ...existing code...

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: '#f7faff',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
      backgroundAttachment: 'fixed',
      backgroundSize: 'cover',
      imageRendering: 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Montserrat, Arial, sans-serif',
      zIndex: 1000,
      overflowY: 'scroll', // Enable both up and down scrolling
      height: '100vh'
    }}>
      <div className="login-container" style={{
        background: 'rgba(255,255,255,0.92)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
        borderRadius: 28,
        padding: '48px 40px 32px 40px',
        width: 520,
        maxWidth: '98vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        border: '1.5px solid #e0e7ff',
        backdropFilter: 'blur(6px)'
      }}>
        <div className="logo" style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12}}>
          <div className="logo-icon" style={{width: 36, height: 36, background: '#2563eb', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <span style={{color: '#fff', fontSize: 24, fontWeight: 'bold', fontFamily: 'Arial, sans-serif'}}>✚</span>
          </div>
          <span className="logo-text" style={{color: '#2563eb', fontSize: 24, fontWeight: 700, letterSpacing: 1}}>MediCare Rx</span>
        </div>
        <div className="login-title" style={{color: '#22223b', fontSize: '2.1rem', fontWeight: 700, marginBottom: 18, textAlign: 'center', letterSpacing: 0.5}}>Create Prescription</div>
        {submitted ? (
          <div>
            <h2>Prescription Submitted</h2>
            <p><strong>Patient Name:</strong> {patientName}</p>
            <p><strong>Medicines:</strong></p>
            <ul>
              {prescriptionMedicines.map((pm, idx) => (
                <li key={pm.medicine.id || pm.medicine.name || idx}>
                  {pm.medicine.name} x{pm.quantity}
                </li>
              ))}
            </ul>
            <p><strong>Notes:</strong> {notes}</p>
            <button onClick={() => {
              setSubmitted(false);
              setPatientName('');
              setNotes('');
              setPrescriptionMedicines([]);
            }} style={{ marginTop: 16, padding: '8px 16px' }}>
              Create New Prescription
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{width: '100%'}}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 2 }}>
                <label style={{ display: 'block', marginBottom: 4 }}>Patient Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  required
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 4 }}>Age</label>
                <input
                  type="number"
                  min="0"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  required
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 4 }}>Gender</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  required
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc' }}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 4, whiteSpace: 'nowrap' }}>Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={e => setBloodGroup(e.target.value)}
                  required
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc' }}
                >
                  {bloodGroups.map(bg => (
                    <option key={bg} value={bg}>{bg || 'Select'}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>Disease</label>
              <input
                type="text"
                value={disease}
                onChange={e => setDisease(e.target.value)}
                placeholder="Enter disease or diagnosis"
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 4 }}>Doctor Name</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={e => setDoctorName(e.target.value)}
                  required
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 4 }}>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc' }}
                />
              </div>
            </div>
            <div style={{ marginBottom: 16, position: 'relative' }}>
              <label style={{ display: 'block', marginBottom: 4 }}>Search Medicine</label>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Type medicine name"
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc' }}
              />
              {searchResults.length > 0 && (
                <ul style={{
                  position: 'absolute',
                  zIndex: 10,
                  backgroundColor: 'white',
                  border: '1px solid #cbd5e1',
                  width: '100%',
                  maxHeight: 150,
                  overflowY: 'auto',
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                  borderRadius: 6,
                  boxShadow: '0 2px 8px #e0e7eb'
                }}>
                  {searchResults.map(med => (
                    <li
                      key={med.name}
                      onClick={() => handleMedicineSelect(med)}
                      style={{ padding: 8, cursor: 'pointer', borderBottom: '1px solid #eee', fontWeight: 500 }}
                    >
                      {med.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {prescriptionMedicines.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ color: '#2563eb', fontWeight: 700, marginBottom: 8 }}>Medicines</h3>
                {prescriptionMedicines.map(pm => (
                  <div key={pm.medicine.id || pm.medicine.name} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: 6, padding: 8 }}>
                    <div style={{ flexGrow: 1, fontWeight: 600 }}>{pm.medicine.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button type="button" onClick={() => removeMedicine(pm.medicine.id || pm.medicine.name)} style={{ padding: '4px 10px', background: '#f87171', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}>-</button>
                      <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 600 }}>{pm.quantity}</span>
                      <button type="button" onClick={() => handleMedicineSelect(pm.medicine)} style={{ padding: '4px 10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}>+</button>
                      <button type="button" onClick={() => setPrescriptionMedicines(prescriptionMedicines.filter(m => (m.medicine.id || m.medicine.name) !== (pm.medicine.id || pm.medicine.name)))} style={{ marginLeft: 8, padding: '4px 10px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>Notes</label>
              <textarea
                value={notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                rows={4}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <button
                type="submit"
                style={{
                  padding: 12,
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 16,
                  cursor: 'pointer',
                  flexGrow: 1,
                  fontWeight: 700,
                  letterSpacing: 0.5
                }}
              >
                Submit Prescription
              </button>
              <button
                type="button"
                onClick={downloadPrescription}
                style={{
                  padding: 12,
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 16,
                  cursor: 'pointer',
                  flexGrow: 1,
                  fontWeight: 700,
                  letterSpacing: 0.5
                }}
              >
                Download
              </button>
              <button
                type="button"
                onClick={printPrescription}
                style={{
                  padding: 12,
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 16,
                  cursor: 'pointer',
                  flexGrow: 1,
                  fontWeight: 700,
                  letterSpacing: 0.5
                }}
              >
                Print
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
    
  );
};

export default PrescriptionPage;
