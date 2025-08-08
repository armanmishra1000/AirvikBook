'use client';

/**
 * Registration Page
 * 
 * BRAND COMPLIANCE: Uses brand tokens for all styling
 * COMPLETE USER FLOW: Main registration with benefits sidebar
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import RegistrationForm from '../../../components/auth/RegistrationForm';

export default function RegisterPage() {
  const router = useRouter();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleRegistrationSuccess = (user: any, tokens: any) => {
    // Remove sensitive logging - don't log user data or tokens
    console.log('Registration successful for user:', user.email ? `${user.email.substring(0, 2)}***@${user.email.split('@')[1]}` : 'unknown');
    setUserEmail(user.email);
    setRegistrationSuccess(true);
    
    // Redirect to verification pending page after a brief delay for UX
    setTimeout(() => {
      router.push(`/auth/verify-email?email=${encodeURIComponent(user.email)}`);
    }, 1500);
  };

  const handleRegistrationError = (error: string) => {
    console.error('Registration error:', error);
    // Error handling is done in the form component
  };

  return (
    <div className="flex flex-col justify-center min-h-screen bg-airvik-white dark:bg-gray-900 bg-pattern-subtle py-space-12 sm:px-space-6 lg:px-space-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-space-8">
          <h1 className="font-bold text-display font-sf-pro text-airvik-black dark:text-airvik-white">
            AirVikBook
          </h1>
          <p className="text-gray-600 mt-space-2 text-body dark:text-gray-400 font-sf-pro">
            Hotel Management System
          </p>
        </div>

        {/* Registration Card */}
        <div className="card-auth py-space-8 px-space-6">
          {registrationSuccess ? (
            <div className="text-center">
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

        {/* Footer Links */}
        <div className="text-center mt-space-8">
          <div className="space-y-space-2">
            <p className="text-gray-600 text-body dark:text-gray-400 font-sf-pro">
              Already have an account?{' '}
              <a 
                href="/auth/login" 
                className="font-medium transition-colors text-airvik-blue hover:text-airvik-purple duration-normal"
              >
                Sign in here
              </a>
            </p>
            
            <p className="text-gray-500 text-caption dark:text-gray-500 font-sf-pro">
              By signing up, you agree to our{' '}
              <a 
                href="/terms" 
                className="transition-colors text-airvik-blue hover:text-airvik-purple duration-normal"
              >
                Terms of Service
              </a>
              {' '}and{' '}
              <a 
                href="/privacy" 
                className="transition-colors text-airvik-blue hover:text-airvik-purple duration-normal"
              >
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}