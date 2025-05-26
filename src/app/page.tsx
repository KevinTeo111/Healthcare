'use client';

import React, { useState } from 'react';
import SignUpForm from './auth/components/SignUpForm';
import SignInForm from './auth/components/SignInForm';
import './globals.css';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Segoe UI', Arial, sans-serif", background: '#f5f8ff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
      <div>
        {mode === 'signup' ? (
          <SignUpForm onSwitchToSignIn={() => setMode('signin')} />
        ) : (
          <SignInForm onSwitchToSignUp={() => setMode('signup')} />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
