'use client';

import React from 'react';
import DashboardNew from './DashboardNew';
import { RecentActivity, QuickAccess } from './DashboardSections';

const DoctorDashboardHome: React.FC = () => {
  return (
    <>
      <DashboardNew />
      {/* Optionally, you can render the remaining dashboard sections here if needed: */}
      {/* <RecentActivity />
      <QuickAccess /> */}
    </>
  );
};

export default DoctorDashboardHome;
