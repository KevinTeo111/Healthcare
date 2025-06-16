'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import DashboardNew with no SSR
const DashboardNew = dynamic(() => import('../../../app/doctor/DashboardNew'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ),
});

const DoctorDashboardHome: React.FC = () => {
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Check authentication
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');

    if (!userRole || !userEmail) {
      setError('Please sign in to access this page');
      return;
    }

    if (userRole !== 'doctor') {
      setError('Unauthorized access');
      return;
    }
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <DashboardNew />
    </Suspense>
  );
};

export default DoctorDashboardHome;
