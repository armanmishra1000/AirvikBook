'use client';

import React from 'react';
import { AUTH_PATHS } from '../../lib/paths';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-airvik-white dark:bg-gray-900 py-space-12 px-space-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-space-8">
          <h1 className="text-display font-sf-pro font-bold text-airvik-black dark:text-airvik-white">
            Privacy Policy
          </h1>
          <p className="mt-space-2 text-body text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="prose prose-lg max-w-none text-airvik-black dark:text-airvik-white">
          <h2 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white">
            1. Information We Collect
          </h2>
          <p className="text-body text-gray-700 dark:text-gray-300">
            We collect information you provide directly to us, such as when you create an account, make a booking, or contact us for support. This may include your name, email address, phone number, and other contact information.
          </p>

          <h2 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white">
            2. How We Use Your Information
          </h2>
          <p className="text-body text-gray-700 dark:text-gray-300">
            We use the information we collect to provide, maintain, and improve our services, process your bookings, communicate with you, and ensure the security of our platform.
          </p>

          <h2 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white">
            3. Information Sharing
          </h2>
          <p className="text-body text-gray-700 dark:text-gray-300">
            We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this privacy policy or as required by law.
          </p>

          <h2 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white">
            4. Data Security
          </h2>
          <p className="text-body text-gray-700 dark:text-gray-300">
            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>

          <h2 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white">
            5. Cookies and Tracking
          </h2>
          <p className="text-body text-gray-700 dark:text-gray-300">
            We use cookies and similar tracking technologies to enhance your experience on our website, analyze usage patterns, and provide personalized content.
          </p>

          <h2 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white">
            6. Your Rights
          </h2>
          <p className="text-body text-gray-700 dark:text-gray-300">
            You have the right to access, update, or delete your personal information. You may also opt out of certain communications or request a copy of your data.
          </p>

          <h2 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white">
            7. Children's Privacy
          </h2>
          <p className="text-body text-gray-700 dark:text-gray-300">
            Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.
          </p>

          <h2 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white">
            8. Changes to This Policy
          </h2>
          <p className="text-body text-gray-700 dark:text-gray-300">
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
          </p>

          <h2 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white">
            9. Contact Us
          </h2>
          <p className="text-body text-gray-700 dark:text-gray-300">
            If you have any questions about this privacy policy, please contact us at privacy@airvikbook.com.
          </p>
        </div>

        <div className="mt-space-8 text-center">
          <a
            href={AUTH_PATHS.LOGIN}
            className="text-airvik-blue hover:text-airvik-purple transition-colors duration-normal font-medium"
          >
            ← Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
