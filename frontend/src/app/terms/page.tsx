'use client';

import React from 'react';
import { AUTH_PATHS } from '../../lib/paths';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-airvik-white dark:bg-gray-900 py-space-12 px-space-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-space-8">
          <h1 className="text-display font-sf-pro font-bold text-airvik-black dark:text-airvik-white">
            Terms of Service
          </h1>
          <p className="mt-space-2 text-body text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="prose prose-lg max-w-none text-airvik-black dark:text-airvik-white">
          <h2 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white">
            1. Acceptance of Terms
          </h2>
          <p className="text-body text-gray-700 dark:text-gray-300">
            By accessing and using AirVikBook Hotel Management System, you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white">
            2. Use License
          </h2>
          <p className="text-body text-gray-700 dark:text-gray-300">
            Permission is granted to temporarily download one copy of the materials (information or software) on AirVikBook's website for personal, non-commercial transitory viewing only.
          </p>

          <h2 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white">
            3. Disclaimer
          </h2>
          <p className="text-body text-gray-700 dark:text-gray-300">
            The materials on AirVikBook's website are provided on an 'as is' basis. AirVikBook makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>

          <h2 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white">
            4. Limitations
          </h2>
          <p className="text-body text-gray-700 dark:text-gray-300">
            In no event shall AirVikBook or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on AirVikBook's website.
          </p>

          <h2 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white">
            5. Revisions and Errata
          </h2>
          <p className="text-body text-gray-700 dark:text-gray-300">
            The materials appearing on AirVikBook's website could include technical, typographical, or photographic errors. AirVikBook does not warrant that any of the materials on its website are accurate, complete or current.
          </p>

          <h2 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white">
            6. Links
          </h2>
          <p className="text-body text-gray-700 dark:text-gray-300">
            AirVikBook has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by AirVikBook of the site.
          </p>

          <h2 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white">
            7. Site Terms of Use Modifications
          </h2>
          <p className="text-body text-gray-700 dark:text-gray-300">
            AirVikBook may revise these terms of use for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these Terms and Conditions of Use.
          </p>

          <h2 className="text-h2 font-sf-pro text-airvik-black dark:text-airvik-white">
            8. Governing Law
          </h2>
          <p className="text-body text-gray-700 dark:text-gray-300">
            Any claim relating to AirVikBook's website shall be governed by the laws of the jurisdiction in which AirVikBook operates without regard to its conflict of law provisions.
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
