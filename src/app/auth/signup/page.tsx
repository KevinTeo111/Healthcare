'use client';

import React from 'react';
import SignUpForm from '../components/SignUpForm';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();

  const handleSwitchToSignIn = () => {
    router.push('/auth/signin');
  };

  return <SignUpForm onSwitchToSignIn={handleSwitchToSignIn} />;
}
