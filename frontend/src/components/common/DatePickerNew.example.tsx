'use client';

import React, { useState } from 'react';
import { DatePickerNew } from './DatePickerNew';

// =====================================================
// NEW DATE PICKER USAGE EXAMPLE
// =====================================================

export const DatePickerNewExample: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [errorDate, setErrorDate] = useState<Date | null>(null);
  const [hasError, setHasError] = useState(false);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    console.log('Selected date:', date);
  };

  const handleDateOfBirthChange = (date: Date | null) => {
    setDateOfBirth(date);
    console.log('Date of birth:', date);
  };

  const handleErrorDateChange = (date: Date | null) => {
    setErrorDate(date);
    setHasError(false);
    
    // Example validation: Show error if date is in the future
    if (date && date > new Date()) {
      setHasError(true);
    }
  };

  return (
    <div className="p-space-6 space-y-space-4">
      <h2 className="text-h4 text-airvik-black dark:text-airvik-white">
        New DatePicker Examples
      </h2>
      
      {/* Basic Date Picker */}
      <div>
        <label className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
          Select Date
        </label>
        <DatePickerNew
          value={selectedDate}
          onChange={handleDateChange}
          placeholder="dd-mm-yyyy"
          className="w-full"
        />
      </div>

      {/* Date of Birth with Age Restriction */}
      <div>
        <label className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
          Date of Birth (13+ years only)
        </label>
        <DatePickerNew
          value={dateOfBirth}
          onChange={handleDateOfBirthChange}
          placeholder="dd-mm-yyyy"
          maxDate={new Date(new Date().getFullYear() - 13, 11, 31)}
          className="w-full"
        />
      </div>

      {/* Date Picker with Error State */}
      <div>
        <label className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
          Date with Validation
        </label>
        <DatePickerNew
          value={errorDate}
          onChange={handleErrorDateChange}
          placeholder="dd-mm-yyyy"
          error={hasError ? "Date cannot be in the future" : undefined}
          className="w-full"
        />
      </div>

      {/* Disabled Date Picker */}
      <div>
        <label className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
          Disabled Date Picker
        </label>
        <DatePickerNew
          value={null}
          onChange={() => {}}
          placeholder="dd-mm-yyyy"
          disabled={true}
          className="w-full"
        />
      </div>

      {/* Required Date Picker */}
      <div>
        <label className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
          Required Date Picker
        </label>
        <DatePickerNew
          value={selectedDate}
          onChange={handleDateChange}
          placeholder="dd-mm-yyyy"
          required={true}
          className="w-full"
        />
      </div>

      {/* Selected Date Display */}
      {selectedDate && (
        <div className="mt-space-4 p-space-4 bg-gray-50 dark:bg-gray-800 rounded-radius-md">
          <p className="text-body text-airvik-black dark:text-airvik-white">
            <span className="font-medium">Selected Date:</span> {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-space-1">
            Formatted: {selectedDate.getDate().toString().padStart(2, '0')}-{(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-{selectedDate.getFullYear()}
          </p>
        </div>
      )}

      {/* Date of Birth Display */}
      {dateOfBirth && (
        <div className="mt-space-4 p-space-4 bg-blue-50 dark:bg-blue-900/20 rounded-radius-md">
          <p className="text-body text-airvik-black dark:text-airvik-white">
            <span className="font-medium">Date of Birth:</span> {dateOfBirth.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-space-1">
            Age: {Math.floor((new Date().getTime() - dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years
          </p>
        </div>
      )}
    </div>
  );
};

export default DatePickerNewExample;
