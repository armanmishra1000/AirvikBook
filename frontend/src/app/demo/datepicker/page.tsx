'use client';

import React, { useState } from 'react';
import { DatePickerNew } from '../../../components/common/DatePickerNew';

export default function DatePickerDemo() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isError, setIsError] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setIsError(false);
    setErrorMessage('');
    
    // Example validation: Show error if date is in the future
    if (date && date > new Date()) {
      setIsError(true);
      setErrorMessage('Date cannot be in the future');
    }
  };

  const toggleError = () => {
    setIsError(!isError);
    setErrorMessage(isError ? '' : 'This is a test error message');
  };

  const toggleDisabled = () => {
    setIsDisabled(!isDisabled);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-airvik-midnight">
      <div className="container mx-auto px-space-4 py-space-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-space-8">
            <h1 className="text-h2 lg:text-h1 text-airvik-black dark:text-airvik-white mb-space-4">
              New DatePicker Component Demo
            </h1>
            <p className="text-body-lg text-gray-600 dark:text-gray-400">
              A clean, HeroUI-style DatePicker with separate month and year buttons
            </p>
          </div>

          {/* Main DatePicker Demo */}
          <div className="bg-white dark:bg-gray-800 rounded-radius-lg border border-gray-200 dark:border-gray-700 p-space-8 shadow-shadow-sm">
            <div className="text-center mb-space-6">
              <h2 className="text-h3 text-airvik-black dark:text-airvik-white mb-space-2">
                Interactive DatePicker
              </h2>
              <p className="text-body text-gray-600 dark:text-gray-400">
                Try clicking the separate month and year buttons, selecting dates, and toggle states
              </p>
            </div>

            {/* DatePicker */}
            <div className="max-w-md mx-auto mb-space-6">
              <label className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
                Select Date
              </label>
              <DatePickerNew
                value={selectedDate}
                onChange={handleDateChange}
                placeholder="dd-mm-yyyy"
                error={isError ? errorMessage : undefined}
                disabled={isDisabled}
                className="w-full"
              />
            </div>

            {/* Selected Date Display */}
            {selectedDate && (
              <div className="max-w-md mx-auto mb-space-6 p-space-4 bg-gray-50 dark:bg-gray-700 rounded-radius-md">
                <p className="text-body text-airvik-black dark:text-airvik-white text-center">
                  <span className="font-medium">Selected:</span> {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-body-sm text-gray-600 dark:text-gray-400 text-center mt-space-1">
                  Formatted: {selectedDate.getDate().toString().padStart(2, '0')}-{(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-{selectedDate.getFullYear()}
                </p>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex flex-wrap justify-center gap-space-3">
              <button
                onClick={toggleError}
                className={`px-space-4 py-space-2 rounded-radius-md text-body font-medium transition-colors ${
                  isError 
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {isError ? 'Clear Error' : 'Show Error'}
              </button>
              
              <button
                onClick={toggleDisabled}
                className={`px-space-4 py-space-2 rounded-radius-md text-body font-medium transition-colors ${
                  isDisabled 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {isDisabled ? 'Enable' : 'Disable'}
              </button>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-space-8 bg-white dark:bg-gray-800 rounded-radius-lg border border-gray-200 dark:border-gray-700 p-space-8 shadow-shadow-sm">
            <h2 className="text-h3 text-airvik-black dark:text-airvik-white mb-space-6 text-center">
              Component Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-6">
              <div className="space-y-space-2">
                <h3 className="text-h5 text-airvik-black dark:text-airvik-white">🎨 HeroUI Style</h3>
                <p className="text-body-sm text-gray-600 dark:text-gray-400">
                  Clean design following HeroUI patterns with dd-mm-yyyy format
                </p>
              </div>
              <div className="space-y-space-2">
                <h3 className="text-h5 text-airvik-black dark:text-airvik-white">🌙 Dark Mode</h3>
                <p className="text-body-sm text-gray-600 dark:text-gray-400">
                  Full dark mode support with proper contrast and styling
                </p>
              </div>
              <div className="space-y-space-2">
                <h3 className="text-h5 text-airvik-black dark:text-airvik-white">♿ Accessible</h3>
                <p className="text-body-sm text-gray-600 dark:text-gray-400">
                  Keyboard navigation, ARIA labels, and screen reader support
                </p>
              </div>
              <div className="space-y-space-2">
                <h3 className="text-h5 text-airvik-black dark:text-airvik-white">📅 Separate Buttons</h3>
                <p className="text-body-sm text-gray-600 dark:text-gray-400">
                  Independent month and year buttons with individual dropdowns
                </p>
              </div>
              <div className="space-y-space-2">
                <h3 className="text-h5 text-airvik-black dark:text-airvik-white">⬅️ Back Navigation</h3>
                <p className="text-body-sm text-gray-600 dark:text-gray-400">
                  Back buttons in month/year dropdowns to return to calendar
                </p>
              </div>
              <div className="space-y-space-2">
                <h3 className="text-h5 text-airvik-black dark:text-airvik-white">✅ Done Button</h3>
                <p className="text-body-sm text-gray-600 dark:text-gray-400">
                  Clear confirmation with Done button to close the picker
                </p>
              </div>
            </div>
          </div>

          {/* Usage Examples */}
          <div className="mt-space-8 bg-gray-50 dark:bg-gray-900 rounded-radius-lg p-space-6">
            <h3 className="text-h4 text-airvik-black dark:text-airvik-white mb-space-4">
              Implementation Examples
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-radius-md p-space-4 overflow-x-auto">
              <pre className="text-body-sm text-gray-800 dark:text-gray-200">
{`// Basic usage
<DatePickerNew
  value={selectedDate}
  onChange={setSelectedDate}
  placeholder="dd-mm-yyyy"
/>

// Date of birth with age restriction
<DatePickerNew
  value={dateOfBirth}
  onChange={setDateOfBirth}
  maxDate={new Date(new Date().getFullYear() - 13, 11, 31)}
  placeholder="dd-mm-yyyy"
/>

// With error state
<DatePickerNew
  value={date}
  onChange={setDate}
  error={hasError ? "Error message" : undefined}
  placeholder="dd-mm-yyyy"
/>

// Disabled state
<DatePickerNew
  value={date}
  onChange={setDate}
  disabled={true}
  placeholder="dd-mm-yyyy"
/>

// Required field
<DatePickerNew
  value={date}
  onChange={setDate}
  required={true}
  placeholder="dd-mm-yyyy"
/>`}
              </pre>
            </div>
          </div>

          {/* Comparison Section */}
          <div className="mt-space-8 bg-white dark:bg-gray-800 rounded-radius-lg border border-gray-200 dark:border-gray-700 p-space-8 shadow-shadow-sm">
            <h2 className="text-h3 text-airvik-black dark:text-airvik-white mb-space-6 text-center">
              Key Improvements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-6">
              <div className="space-y-space-4">
                <h3 className="text-h5 text-airvik-black dark:text-airvik-white">✅ New Features</h3>
                <ul className="space-y-space-2 text-body-sm text-gray-600 dark:text-gray-400">
                  <li>• dd-mm-yyyy format for cleaner display</li>
                  <li>• Calendar icon on the right side</li>
                  <li>• Separate month and year buttons</li>
                  <li>• Individual dropdowns for month and year</li>
                  <li>• Back buttons in dropdowns</li>
                  <li>• Done button for clear confirmation</li>
                  <li>• HeroUI-style design patterns</li>
                  <li>• Improved user experience</li>
                  <li>• Better navigation flow</li>
                </ul>
              </div>
              <div className="space-y-space-4">
                <h3 className="text-h5 text-airvik-black dark:text-airvik-white">🔧 Technical Improvements</h3>
                <ul className="space-y-space-2 text-body-sm text-gray-600 dark:text-gray-400">
                  <li>• Proper TypeScript Date objects</li>
                  <li>• Cleaner state management with viewMode</li>
                  <li>• Better accessibility</li>
                  <li>• Consistent brand compliance</li>
                  <li>• Simplified prop interface</li>
                  <li>• Improved user experience</li>
                  <li>• Better navigation flow</li>
                </ul>
              </div>
            </div>
          </div>

          {/* User Flow Section */}
          <div className="mt-space-8 bg-white dark:bg-gray-800 rounded-radius-lg border border-gray-200 dark:border-gray-700 p-space-8 shadow-shadow-sm">
            <h2 className="text-h3 text-airvik-black dark:text-airvik-white mb-space-6 text-center">
              User Interaction Flow
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-6">
              <div className="text-center space-y-space-2">
                <div className="w-12 h-12 bg-airvik-blue text-airvik-white rounded-radius-full flex items-center justify-center mx-auto text-h5 font-bold">
                  1
                </div>
                <h4 className="text-h6 text-airvik-black dark:text-airvik-white">Click Calendar Icon</h4>
                <p className="text-body-sm text-gray-600 dark:text-gray-400">
                  Opens the date picker with calendar view
                </p>
              </div>
              <div className="text-center space-y-space-2">
                <div className="w-12 h-12 bg-airvik-blue text-airvik-white rounded-radius-full flex items-center justify-center mx-auto text-h5 font-bold">
                  2
                </div>
                <h4 className="text-h6 text-airvik-black dark:text-airvik-white">Select Month/Year</h4>
                <p className="text-body-sm text-gray-600 dark:text-gray-400">
                  Click month or year button to open respective dropdown
                </p>
              </div>
              <div className="text-center space-y-space-2">
                <div className="w-12 h-12 bg-airvik-blue text-airvik-white rounded-radius-full flex items-center justify-center mx-auto text-h5 font-bold">
                  3
                </div>
                <h4 className="text-h6 text-airvik-black dark:text-airvik-white">Choose Date</h4>
                <p className="text-body-sm text-gray-600 dark:text-gray-400">
                  Select your desired date from the calendar
                </p>
              </div>
              <div className="text-center space-y-space-2">
                <div className="w-12 h-12 bg-airvik-blue text-airvik-white rounded-radius-full flex items-center justify-center mx-auto text-h5 font-bold">
                  4
                </div>
                <h4 className="text-h6 text-airvik-black dark:text-airvik-white">Click Done</h4>
                <p className="text-body-sm text-gray-600 dark:text-gray-400">
                  Confirm selection and close the picker
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
