'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ContactSupportPage() {
  const [selectedCategory, setSelectedCategory] = useState('general');

  const faqData = {
    general: [
      {
        question: "How do I create an account?",
        answer: "You can create an account by visiting our registration page and providing your email address, full name, and creating a secure password. We'll send you a verification email to complete the process."
      },
      {
        question: "I didn't receive my verification email",
        answer: "Check your spam folder first. If you still don't see it, you can request a new verification email from the Check Your Email page. Make sure to wait a few minutes between requests."
      },
      {
        question: "How do I reset my password?",
        answer: "Click on the 'Forgot Password?' link on the login page. We'll send you an email with instructions to reset your password securely."
      }
    ],
    booking: [
      {
        question: "How do I book a hotel?",
        answer: "Search for hotels using our search form, select your dates and preferences, then choose from available options. Complete your booking by providing payment information."
      },
      {
        question: "Can I cancel my booking?",
        answer: "Cancellation policies vary by hotel. Check your booking confirmation email for specific cancellation terms and deadlines."
      },
      {
        question: "How do I modify my booking?",
        answer: "Log into your account and go to 'My Bookings' to view and modify your reservations. Some changes may be subject to hotel policies."
      }
    ],
    technical: [
      {
        question: "The website isn't loading properly",
        answer: "Try refreshing the page or clearing your browser cache. If the problem persists, try using a different browser or device."
      },
      {
        question: "I'm having trouble with the mobile app",
        answer: "Make sure you have the latest version of the app installed. If issues continue, try uninstalling and reinstalling the app."
      },
      {
        question: "How do I enable cookies?",
        answer: "Our website requires cookies to function properly. Check your browser settings and ensure cookies are enabled for our domain."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-airvik-white dark:bg-gray-900 py-space-12 px-space-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-space-8">
          <h1 className="text-display font-sf-pro font-bold text-airvik-black dark:text-airvik-white">
            Contact Support
          </h1>
          <p className="mt-space-2 text-body text-gray-600 dark:text-gray-400">
            We're here to help you with any questions or issues
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-2 gap-space-6 mb-space-12">
          {/* Email Support */}
          <div className="bg-white dark:bg-gray-800 rounded-radius-lg shadow-shadow-md p-space-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-space-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-space-3">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26c.3.16.65.16.95 0L20 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-h3 font-sf-pro font-semibold text-airvik-black dark:text-airvik-white">
                  Email Support
                </h3>
                <p className="text-body text-gray-600 dark:text-gray-400">
                  Get help via email
                </p>
              </div>
            </div>
            <p className="text-body text-gray-600 dark:text-gray-400 mb-space-4">
              Send us an email and we'll get back to you within 24 hours.
            </p>
            <a
              href="mailto:support@airvikbook.com"
              className="inline-flex items-center px-space-4 py-space-2 bg-airvik-blue text-airvik-white rounded-radius-md hover:bg-airvik-purple transition-colors duration-normal font-medium"
            >
              Send Email
            </a>
          </div>

          {/* Phone Support */}
          <div className="bg-white dark:bg-gray-800 rounded-radius-lg shadow-shadow-md p-space-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-space-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-space-3">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-h3 font-sf-pro font-semibold text-airvik-black dark:text-airvik-white">
                  Phone Support
                </h3>
                <p className="text-body text-gray-600 dark:text-gray-400">
                  Call us directly
                </p>
              </div>
            </div>
            <p className="text-body text-gray-600 dark:text-gray-400 mb-space-4">
              Speak with our support team Monday-Friday, 9 AM - 6 PM EST.
            </p>
            <a
              href="tel:+1-800-AIRVIK"
              className="inline-flex items-center px-space-4 py-space-2 bg-green-600 text-white rounded-radius-md hover:bg-green-700 transition-colors duration-normal font-medium"
            >
              Call +1-800-AIRVIK
            </a>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-gray-800 rounded-radius-lg shadow-shadow-md p-space-6 border border-gray-200 dark:border-gray-700 mb-space-8">
          <h2 className="text-h2 font-sf-pro font-bold text-airvik-black dark:text-airvik-white mb-space-6">
            Frequently Asked Questions
          </h2>

          {/* Category Tabs */}
          <div className="flex space-x-space-4 mb-space-6 border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'general', label: 'General' },
              { id: 'booking', label: 'Booking' },
              { id: 'technical', label: 'Technical' }
            ].map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`pb-space-2 px-space-1 font-medium transition-colors duration-normal ${
                  selectedCategory === category.id
                    ? 'text-airvik-blue border-b-2 border-airvik-blue'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-space-4">
            {faqData[selectedCategory as keyof typeof faqData].map((item, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-radius-md">
                <button
                  className="w-full text-left p-space-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-normal"
                  onClick={() => {
                    const content = document.getElementById(`faq-${selectedCategory}-${index}`);
                    if (content) {
                      content.classList.toggle('hidden');
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-body font-sf-pro font-medium text-airvik-black dark:text-airvik-white">
                      {item.question}
                    </h3>
                    <svg className="w-5 h-5 text-gray-400 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                <div id={`faq-${selectedCategory}-${index}`} className="hidden px-space-4 pb-space-4">
                  <p className="text-body text-gray-600 dark:text-gray-400">
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Help */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-radius-lg p-space-6">
          <h3 className="text-h3 font-sf-pro font-semibold text-blue-800 dark:text-blue-200 mb-space-3">
            Still Need Help?
          </h3>
          <p className="text-body text-blue-700 dark:text-blue-300 mb-space-4">
            If you couldn't find the answer you're looking for, our support team is ready to assist you.
          </p>
          <div className="flex flex-col sm:flex-row gap-space-3">
            <a
              href="mailto:support@airvikbook.com"
              className="inline-flex items-center justify-center px-space-4 py-space-2 bg-blue-600 text-white rounded-radius-md hover:bg-blue-700 transition-colors duration-normal font-medium"
            >
              Email Support
            </a>
            <a
              href="tel:+1-800-AIRVIK"
              className="inline-flex items-center justify-center px-space-4 py-space-2 border border-blue-600 text-blue-600 dark:text-blue-400 rounded-radius-md hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors duration-normal font-medium"
            >
              Call Support
            </a>
          </div>
        </div>

        {/* Back to Login */}
        <div className="mt-space-8 text-center">
          <Link 
            href="/auth/login" 
            className="text-airvik-blue hover:text-airvik-purple transition-colors duration-normal font-medium"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
