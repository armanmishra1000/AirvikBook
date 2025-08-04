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
    console.log('Registration successful:', { user, tokens });
    setUserEmail(user.email);
    setRegistrationSuccess(true);
    
    // Redirect to verification pending page
    router.push(`/auth/verify-email?email=${encodeURIComponent(user.email)}`);
  };

  const handleRegistrationError = (error: string) => {
    console.error('Registration error:', error);
    // Error handling is done in the form component
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex min-h-screen">
        {/* Registration Form Section */}
        <div className="flex-1 flex items-center justify-center py-space-12 px-space-4 sm:px-space-6 lg:px-space-8">
          <div className="w-full max-w-md">
            <RegistrationForm
              onSuccess={handleRegistrationSuccess}
              onError={handleRegistrationError}
            />
          </div>
        </div>

        {/* Benefits Sidebar */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-space-8 bg-blue-600 dark:bg-blue-800">
          <div className="max-w-md mx-auto text-white">
            {/* Header */}
            <div className="mb-space-8">
              <div className="text-4xl font-bold mb-space-2">🏨</div>
              <h2 className="text-3xl font-bold mb-space-4">
                Welcome to AirVikBook
              </h2>
              <p className="text-blue-100 text-lg">
                Your gateway to amazing hotel experiences worldwide
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-space-6">
              <div className="flex items-start space-x-space-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-space-1">
                    Exclusive Member Deals
                  </h3>
                  <p className="text-blue-100">
                    Access special rates and member-only discounts at thousands of hotels
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-space-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-space-1">
                    Easy Booking Management
                  </h3>
                  <p className="text-blue-100">
                    View, modify, and cancel bookings with just a few clicks
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-space-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-space-1">
                    24/7 Customer Support
                  </h3>
                  <p className="text-blue-100">
                    Get help whenever you need it with our dedicated support team
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-space-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-space-1">
                    Personalized Recommendations
                  </h3>
                  <p className="text-blue-100">
                    Discover hotels tailored to your preferences and travel history
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-space-8 pt-space-6 border-t border-blue-500">
              <p className="text-blue-100 text-sm mb-space-4">
                Trusted by over 1 million travelers worldwide
              </p>
              <div className="flex space-x-space-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">4.8★</div>
                  <div className="text-blue-100 text-xs">User Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">50k+</div>
                  <div className="text-blue-100 text-xs">Hotels</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-blue-100 text-xs">Secure</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}