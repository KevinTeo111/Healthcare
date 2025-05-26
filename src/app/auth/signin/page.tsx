'use client';

import React from 'react';
import SignInForm from '../components/SignInForm';

const SignInPage: React.FC = () => {
  const handleSwitchToSignUp = () => {
    // Implement switch to sign-up page if needed
  };

  return (
    <div>
      <SignInForm onSwitchToSignUp={handleSwitchToSignUp} />
    </div>
  );
};

export default SignInPage;
