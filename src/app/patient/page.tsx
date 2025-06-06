'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Sidebar component with icons
interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  return (
    <aside
      ref={sidebarRef}
      style={{
        width: 220,
        backgroundColor: '#1e293b',
        color: 'white',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 1000,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
        boxShadow: open ? '2px 0 12px rgba(0,0,0,0.08)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '32px 0 0 0',
      }}
      aria-hidden={!open}
    >
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          fontSize: 28,
          alignSelf: 'flex-end',
          margin: '0 16px 24px 0',
          cursor: 'pointer',
        }}
        aria-label="Close menu"
      >
        &times;
      </button>
      <div style={{ width: '100%', paddingLeft: 32 }}>
        <div style={{ cursor: 'pointer', marginBottom: 32 }} title="Dashboard" onClick={() => { router.push('/dashboard/patient'); onClose(); }}>
          <svg width="32" height="32" fill="white" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8v-10h-8v10zm0-18v6h8V3h-8z"/></svg>
          <span style={{ marginLeft: 16, fontSize: 18, verticalAlign: 'middle' }}>Dashboard</span>
        </div>
        <div style={{ cursor: 'pointer', marginBottom: 32 }} title="Appointments" onClick={() => { router.push('/patient/appointments'); onClose(); }}>
          <svg width="32" height="32" fill="white" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
          <span style={{ marginLeft: 16, fontSize: 18, verticalAlign: 'middle' }}>Appointments</span>
        </div>
        <div style={{ cursor: 'pointer', marginBottom: 32 }} title="Logout" onClick={() => { router.push('/auth/signup'); onClose(); }}>
          <svg width="32" height="32" fill="white" viewBox="0 0 24 24"><path d="M10 9V5l-7 7 7 7v-4h8V9z"/></svg>
          <span style={{ marginLeft: 16, fontSize: 18, verticalAlign: 'middle' }}>Logout</span>
        </div>
      </div>
    </aside>
  );
};

// Topbar component
const Topbar: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const [userName, setUserName] = React.useState('Loading...');
  const router = useRouter();

  React.useEffect(() => {
    const localName = localStorage.getItem('userName');
    if (localName) {
      setUserName(localName);
    }
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
      const res = await fetch('/api/logout', { method: 'POST' });
      if (res.ok) {
        router.replace('/');
      } else {
        alert('Logout failed');
      }
    } catch {
      alert('Logout failed');
    }
  };

  return (
    <header style={{
      height: 64,
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      borderBottom: '1px solid #e2e8f0',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1100,
      gap: 16,
    }}>
      <button
        onClick={onMenuClick}
        style={{
          background: 'none',
          border: 'none',
          fontSize: 28,
          marginRight: 16,
          cursor: 'pointer',
          color: '#2563eb',
        }}
        aria-label="Open menu"
      >
        &#9776;
      </button>
      <div style={{ fontWeight: '600', fontSize: 18 }}>
        Hello, {userName}
      </div>
      <button
        onClick={handleLogout}
        style={{
          marginLeft: 'auto',
          padding: '8px 16px',
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontWeight: '600',
        }}
      >
        Logout
      </button>
    </header>
  );
};

// Card component for sections
const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 24,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      flex: 1,
      minWidth: 280,
      marginBottom: 24,
    }}>
      <h3 style={{ marginBottom: 16, fontWeight: '600' }}>{title}</h3>
      {children}
    </div>
  );
};

const PatientDashboard: React.FC = () => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9', flexDirection: 'column' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, paddingTop: 64, paddingLeft: 24, paddingRight: 24, overflowY: 'auto' }}>
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <div style={{ display: 'flex', gap: 24, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* Upcoming Appointments - This card can be updated to show a summary or link */}
            <Card title="Upcoming Appointments">
              {/* Replaced loading/appointments display with a message and link */}
              <p>View your appointment requests and their statuses on the appointments page.</p>
              <button
                onClick={() => router.push('/patient/appointments')}
                style={{
                  marginTop: '16px',
                  padding: '8px 16px',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Go to Appointments
              </button>
            </Card>

            {/* Add other cards/sections for the patient dashboard here as needed */}

          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard; 