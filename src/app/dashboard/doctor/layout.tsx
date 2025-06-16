'use client';

import React from 'react';
import { redirect } from 'next/navigation';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  // Check if user is a doctor
  React.useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'doctor') {
      redirect('/auth/signin');
    }
  }, []);

  return (
    <div className="w-full">
      {children}
    </div>
  );
}
