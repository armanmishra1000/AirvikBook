'use client';

/**
 * Registration Page
 * 
 * BRAND COMPLIANCE: Uses brand tokens for all styling
 * COMPLETE USER FLOW: Main registration with benefits sidebar
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import RegistrationForm from '../../components/auth/RegistrationForm';
import { getVerifyEmailPath } from '../../lib/paths';

export default function RegisterPage() {
  const router = useRouter();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleRegistrationSuccess = (user: any, tokens: any) => {
    setUserEmail(user.email);
    setRegistrationSuccess(true);
    
    // Redirect to verification pending page after a brief delay for UX
    setTimeout(() => {
      router.push(getVerifyEmailPath(user.email));
    }, 1500);
  };

  const handleRegistrationError = (error: string) => {
    console.error('Registration error:', error);
    // Error handling is done in the form component
  };

  return (
    <div className="min-h-screen bg-airvik-white dark:bg-gray-900 flex items-center justify-center px-space-4 pb-6">
      <div className="max-w-md w-full">
        {registrationSuccess ? (
          <div className="bg-airvik-white dark:bg-gray-800 rounded-radius-lg shadow-lg p-space-8 card-auth text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-space-4 bg-success/10 rounded-radius-full">
              <svg className="w-8 h-8 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
              Account Created Successfully!
            </h2>
            <p className="text-gray-600 text-body dark:text-gray-400 mb-space-4">
              We've sent a verification email to <strong>{userEmail}</strong>
            </p>
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 animate-spin mr-space-2 border-airvik-blue border-t-transparent rounded-radius-full" />
              <span className="text-gray-600 text-body dark:text-gray-400">
                Redirecting to verification page...
              </span>
            </div>
          </div>
        ) : (
          <RegistrationForm
            onSuccess={handleRegistrationSuccess}
            onError={handleRegistrationError}
          />
        )}
      </div>
    </div>
  );
}