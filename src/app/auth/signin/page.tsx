'use client';

import React from 'react';
import SignInForm from '../components/SignInForm';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();

  const handleSwitchToSignUp = () => {
    router.push('/auth/signup');
  };

  return <SignInForm onSwitchToSignUp={handleSwitchToSignUp} />;
}
