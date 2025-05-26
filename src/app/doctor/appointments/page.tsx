'use client';

import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaUserMd, FaUserFriends, FaEnvelope, FaCreditCard, FaSignOutAlt, FaBell, FaSearch } from 'react-icons/fa';

interface Appointment {
  id: string;
  patient: string;
  date: string;
  time: string;
}

const mockTimeline = [
  { time: '10.00 am', title: 'Patient Checkup', patient: 'Naila Fernandez', end: '10.30 am - 11.00 am' },
  { time: '11.00 am', title: 'Root Cleaning', patient: 'Michel Jordan', end: '10.30 am - 11.30 am' },
  { time: '12.00 pm', title: 'Scaling', patient: 'Tom Holland', end: '10.30 am - 11.30 am' },
  { time: '1.00 pm', title: 'Patient Checkup', patient: 'July Khan', end: '1.00 pm - 2.00 pm' },
  { time: '2.00 pm', title: 'Patient Checkup', patient: 'July Khan', end: '2.00 pm - 3.00 pm' },
];

const mockRequests: any[] = [];

const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState(mockRequests);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Add Appointment Modal State
  const [showModal, setShowModal] = useState(false);
  const [booking, setBooking] = useState({ patient: '', date: '', time: '' });
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch('/api/appointments');
        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }
        const data = await response.json();
        setAppointments(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleAccept = (id: number) => {
    setRequests(prev => prev.filter(req => req.id !== id));
    setActionMessage('Appointment accepted!');
    setTimeout(() => setActionMessage(null), 2000);
  };

  const handleReject = (id: number) => {
    setRequests(prev => prev.filter(req => req.id !== id));
    setActionMessage('Appointment rejected.');
    setTimeout(() => setActionMessage(null), 2000);
  };

  const handleLogout = () => {
    fetch('/api/logout', { method: 'POST' })
      .then(() => window.location.href = '/auth/signin');
  };

  const handleUpgrade = () => {
    setActionMessage('Upgrade to Pro feature coming soon!');
    setTimeout(() => setActionMessage(null), 2000);
  };

  const openModal = () => {
    setBooking({ patient: '', date: '', time: '' });
    setBookingError(null);
    setBookingSuccess(null);
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBooking({ ...booking, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    setBookingSuccess(null);
    if (!booking.patient || !booking.date || !booking.time) {
      setBookingError('All fields are required.');
      return;
    }
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      });
      if (!res.ok) throw new Error('Failed to book appointment');
      const newReq = await res.json();
      setBookingSuccess('Appointment booked successfully!');
      setRequests(prev => [...prev, {
        id: newReq.id,
        name: booking.patient,
        gender: 'Unknown', // or add gender field to booking form if needed
        age: '', // or add age field to booking form if needed
        treatment: 'N/A', // or add treatment field to booking form if needed
        time: `${booking.date} ${booking.time}`,
        avatar: 'https://randomuser.me/api/portraits/lego/1.jpg', // placeholder
      }]);
      setTimeout(() => {
        setShowModal(false);
        setBookingSuccess(null);
      }, 1200);
    } catch (err) {
      setBookingError('Failed to book appointment.');
    }
  };

  if (loading) {
    return <div style={{ padding: 24 }}>Loading appointments...</div>;
  }

  if (error) {
    return <div style={{ padding: 24, color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7faff', display: 'flex', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: 250, background: '#fff', boxShadow: '2px 0 8px #e5e7eb', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 24 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 24, color: '#2563eb', marginBottom: 40 }}>Doc-Center</div>
          <nav>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', color: '#64748b', fontWeight: 500 }}>
              <FaUserMd style={{ fontSize: 18 }} /> Dashboard
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', color: '#2563eb', fontWeight: 600, background: '#e0e7ff', borderRadius: 8 }}>
              <FaCalendarAlt style={{ fontSize: 18 }} /> Appointments
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', color: '#64748b', fontWeight: 500 }}>
              <FaUserFriends style={{ fontSize: 18 }} /> Patient List
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', color: '#64748b', fontWeight: 500 }}>
              <FaEnvelope style={{ fontSize: 18 }} /> Massage
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', color: '#64748b', fontWeight: 500 }}>
              <FaCreditCard style={{ fontSize: 18 }} /> Payments
            </div>
          </nav>
          <div style={{ background: '#e0e7ff', borderRadius: 16, padding: 20, marginTop: 40, textAlign: 'center' }}>
            <div style={{ fontWeight: 700, color: '#2563eb', fontSize: 20 }}>Go Pro</div>
            <div style={{ color: '#64748b', fontSize: 14, margin: '12px 0' }}>Upgrade to pro to add unlimited patient and access other features</div>
            <button onClick={handleUpgrade} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>Upgrade</button>
          </div>
        </div>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', color: '#64748b', fontWeight: 600, fontSize: 16, cursor: 'pointer', marginTop: 32 }}>
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '32px 32px 32px 0', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 12, padding: '8px 20px', boxShadow: '0 1px 4px #e5e7eb', width: 400 }}>
            <FaSearch style={{ color: '#64748b', fontSize: 18, marginRight: 10 }} />
            <input placeholder="Search for Anything" style={{ border: 'none', outline: 'none', fontSize: 16, width: '100%', background: 'transparent' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <FaBell style={{ fontSize: 22, color: '#64748b', cursor: 'pointer' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src="https://randomuser.me/api/portraits/men/31.jpg" alt="Dr. Mark James" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e7ff' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Dr. Mark James</div>
                <div style={{ color: '#64748b', fontSize: 14 }}>Dentist</div>
              </div>
            </div>
          </div>
        </header>

        {/* Banner */}
        <section style={{ background: '#fff', borderRadius: 16, padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px #e5e7eb', marginBottom: 24 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 28, color: '#22223b', marginBottom: 8 }}>Add appointment in your schedule now</div>
            <button onClick={openModal} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>+ Add Appointment</button>
          </div>
          <img src="/file.svg" alt="Doctors" style={{ height: 80, marginLeft: 24 }} />
        </section>
        {/* Appointment Booking Modal */}
        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 340, boxShadow: '0 2px 16px #e0e7eb', position: 'relative' }}>
              <button onClick={closeModal} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#64748b', cursor: 'pointer' }}>&times;</button>
              <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: '#2563eb' }}>Book Appointment</div>
              <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input name="patient" value={booking.patient} onChange={handleBookingChange} placeholder="Patient Name" style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16 }} />
                <input name="date" value={booking.date} onChange={handleBookingChange} type="date" style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16 }} />
                <input name="time" value={booking.time} onChange={handleBookingChange} type="time" style={{ padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16 }} />
                {bookingError && <div style={{ color: '#f87171', fontWeight: 600 }}>{bookingError}</div>}
                {bookingSuccess && <div style={{ color: '#22c55e', fontWeight: 600 }}>{bookingSuccess}</div>}
                <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 600, fontSize: 16, cursor: 'pointer', marginTop: 8 }}>Book</button>
              </form>
            </div>
          </div>
        )}

        {/* Calendar & Timeline */}
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ flex: 2 }}>
            {/* Calendar */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: '0 1px 4px #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>Calender</div>
                <select style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '4px 12px', fontWeight: 600 }}>
                  <option>Jan</option>
                  <option>Feb</option>
                  <option>Mar</option>
                  <option>Apr</option>
                  <option>May</option>
                  <option>Jun</option>
                  <option>Jul</option>
                  <option>Aug</option>
                  <option>Sep</option>
                  <option>Oct</option>
                  <option>Nov</option>
                  <option>Dec</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', fontWeight: 600, color: '#64748b', marginBottom: 8 }}>
                {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(day => (
                  <div key={day} style={{ width: 36, textAlign: 'center' }}>{day}</div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                {[7,8,9,10,11,12,13,14,15,16,17,18,19].map(date => (
                  <div key={date} style={{ width: 36, height: 36, borderRadius: '50%', background: date===11?'#2563eb':'#f1f5f9', color: date===11?'#fff':'#22223b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>{date}</div>
                ))}
              </div>
            </div>
            {/* Timeline */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px #e5e7eb' }}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Timeline</div>
              {mockTimeline.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: idx!==mockTimeline.length-1?'1px solid #f1f5f9':'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ color: '#2563eb', fontWeight: 700 }}>{item.time}</div>
                    <div style={{ fontWeight: 600 }}>{item.title}</div>
                    <div style={{ color: '#64748b', fontSize: 14 }}>Patient Name - {item.patient}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ color: '#64748b', fontWeight: 600 }}>{item.end}</div>
                    <button style={{ background: 'none', color: '#2563eb', border: 'none', fontWeight: 600, cursor: 'pointer' }}>View Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Stats */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px #e5e7eb', marginBottom: 8 }}>
              <div style={{ color: '#64748b', fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Total appointment in This Month</div>
              <div style={{ fontWeight: 800, fontSize: 32, color: '#22223b', marginBottom: 16 }}>304</div>
              <div style={{ color: '#64748b', fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Pending appointment in This Month</div>
              <div style={{ fontWeight: 800, fontSize: 32, color: '#22223b', marginBottom: 16 }}>154</div>
              <div style={{ color: '#64748b', fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Complete appointment in This Month</div>
              <div style={{ fontWeight: 800, fontSize: 32, color: '#22223b' }}>150</div>
            </div>
            {/* Appointment Requests */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>Appointment Request's</div>
                <button style={{ background: 'none', color: '#2563eb', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}>View All</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {requests.map(req => (
                  <div key={req.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <img src={req.avatar} alt={req.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e7ff' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{req.name}</div>
                      <div style={{ color: '#64748b', fontSize: 14 }}>{req.gender}, {req.age}</div>
                      <div style={{ color: '#64748b', fontSize: 14 }}>Treatment - {req.treatment}</div>
                    </div>
                    <div style={{ color: '#64748b', fontWeight: 600, fontSize: 14, minWidth: 90 }}>{req.time}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleAccept(req.id)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}>Accept</button>
                      <button onClick={() => handleReject(req.id)} style={{ background: '#f87171', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}>Reject</button>
                    </div>
                  </div>
                ))}
                {requests.length === 0 && (
                  <div style={{ color: '#64748b', textAlign: 'center', padding: 16 }}>No appointment requests.</div>
                )}
              </div>
              {actionMessage && (
                <div style={{ marginTop: 16, color: '#2563eb', textAlign: 'center', fontWeight: 600 }}>{actionMessage}</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppointmentsPage;
