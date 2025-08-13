'use client';

/**
 * Registration Success Page
 * 
 * BRAND COMPLIANCE: Uses brand tokens and celebrates user success
 * COMPLETE USER FLOW: Welcome new users with next steps
 */

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AUTH_PATHS } from '../../lib/paths';
import UserRegistrationService from '../../services/userRegistration.service';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Get user data from localStorage or URL params
    const currentUser = UserRegistrationService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      // If no user data, redirect to login
      router.push(AUTH_PATHS.LOGIN);
    }
  }, [router]);

  // Auto-redirect countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      router.push('/dashboard');
    }
  }, [countdown, router]);

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleExplorePlaces = () => {
    router.push('/places');
  };

  return (
    <div className="min-h-screen bg-airvik-white dark:bg-gray-900 bg-pattern-subtle flex items-center justify-center py-space-12 px-space-4 sm:px-space-6 lg:px-space-8">
      <div className="max-w-2xl w-full text-center">
        {/* Success Animation */}
        <div className="mb-space-8">
          <div className="mx-auto w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-space-6 animate-bounce">
            <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          {/* Confetti Effect */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl animate-pulse">🎉</div>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-space-8 mb-space-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-space-4">
            Welcome to AirVikBook!
          </h1>
          
          {user && (
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-space-6">
              Hello <span className="font-semibold text-blue-600 dark:text-blue-400">{user.fullName}</span>! 
              Your account has been successfully created and verified.
            </p>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-space-6 mb-space-6">
            <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-space-3">
              🚀 You're all set to start your journey!
            </h2>
            <div className="text-blue-700 dark:text-blue-300 space-y-space-2">
              <p>✅ Account created and verified</p>
              <p>✅ Welcome email sent to your inbox</p>
              <p>✅ Ready to book amazing hotels</p>
            </div>
          </div>

          {/* What's Next Section */}
          <div className="text-left mb-space-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-space-4">
              What you can do now:
            </h3>
            <div className="grid md:grid-cols-2 gap-space-4">
              <div className="p-space-4 border border-gray-200 dark:border-gray-700 rounded-md">
                <div className="flex items-center mb-space-2">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-space-3">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.84L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.84l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Explore Hotels
                  </h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Browse thousands of verified hotels worldwide
                </p>
              </div>

              <div className="p-space-4 border border-gray-200 dark:border-gray-700 rounded-md">
                <div className="flex items-center mb-space-2">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-space-3">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Make Your First Booking
                  </h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Get exclusive member rates on your first stay
                </p>
              </div>

              <div className="p-space-4 border border-gray-200 dark:border-gray-700 rounded-md">
                <div className="flex items-center mb-space-2">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-space-3">
                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Complete Your Profile
                  </h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Add preferences for personalized recommendations
                </p>
              </div>

              <div className="p-space-4 border border-gray-200 dark:border-gray-700 rounded-md">
                <div className="flex items-center mb-space-2">
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mr-space-3">
                    <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Earn Rewards
                  </h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Start earning points with every booking
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-space-4 justify-center">
            <button
              onClick={handleGoToDashboard}
              className="px-space-6 py-space-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Dashboard
            </button>
            <button
              onClick={handleExplorePlaces}
              className="px-space-6 py-space-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Explore Hotels
            </button>
          </div>

          {/* Auto-redirect Notice */}
          <div className="mt-space-6 pt-space-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You'll be automatically redirected to your dashboard in{' '}
              <span className="font-mono font-semibold">{countdown}</span> seconds
            </p>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="grid md:grid-cols-3 gap-space-4 text-sm">
          <a
            href="/help"
            className="block p-space-4 bg-white dark:bg-gray-800 rounded-md shadow hover:shadow-md transition-shadow duration-200"
          >
            <div className="text-blue-600 dark:text-blue-400 font-medium mb-space-1">📚 Getting Started Guide</div>
            <div className="text-gray-600 dark:text-gray-300">Learn how to make the most of AirVikBook</div>
          </a>
          
          <a
            href="/mobile-app"
            className="block p-space-4 bg-white dark:bg-gray-800 rounded-md shadow hover:shadow-md transition-shadow duration-200"
          >
            <div className="text-blue-600 dark:text-blue-400 font-medium mb-space-1">📱 Download Our App</div>
            <div className="text-gray-600 dark:text-gray-300">Book on the go with our mobile app</div>
          </a>
          
          <a
            href="/support"
            className="block p-space-4 bg-white dark:bg-gray-800 rounded-md shadow hover:shadow-md transition-shadow duration-200"
          >
            <div className="text-blue-600 dark:text-blue-400 font-medium mb-space-1">💬 24/7 Support</div>
            <div className="text-gray-600 dark:text-gray-300">Need help? We're here for you</div>
          </a>
        </div>
      </div>
    </div>
  );
}