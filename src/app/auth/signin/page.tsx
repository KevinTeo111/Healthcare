'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import SignInForm from '../components/SignInForm';

const SignInPage: React.FC = () => {
  const router = useRouter();
  const handleSwitchToSignUp = () => {
    router.push('/auth/signup');
  };

  return (
    <div>
      <SignInForm onSwitchToSignUp={handleSwitchToSignUp} />
    </div>
  );
};

export default SignInPage;
