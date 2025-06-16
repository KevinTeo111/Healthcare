'use client';

import React from 'react';
import { redirect } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Check if user is authenticated
  React.useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');

    if (!userRole || !userEmail) {
      redirect('/auth/signin');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {children}
    </div>
  );
}
