'use client';

/**
 * Registration Page
 * 
 * BRAND COMPLIANCE: Uses brand tokens for all styling
 * COMPLETE USER FLOW: Direct registration to verification page
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import RegistrationForm from '../../components/auth/RegistrationForm';
import { getVerifyEmailPath } from '../../lib/paths';

export default function RegisterPage() {
  const router = useRouter();

  const handleRegistrationSuccess = (user: any, tokens: any) => {
    // Immediately redirect to verification page without showing success message
    router.push(getVerifyEmailPath(user.email));
  };

  const handleRegistrationError = (error: string) => {
    console.error('Registration error:', error);
    // Error handling is done in the form component
  };

  return (
    <div className="flex items-center justify-center min-h-screen pb-6 bg-airvik-white dark:bg-gray-900 px-space-4">
      <div className="w-full max-w-md">
        <RegistrationForm
          onSuccess={handleRegistrationSuccess}
          onError={handleRegistrationError}
        />
      </div>
    </div>
  );
}