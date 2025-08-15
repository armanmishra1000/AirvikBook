'use client';

import React, { useState } from 'react';
import { DatePicker } from './DatePicker';

// =====================================================
// DATE PICKER USAGE EXAMPLE
// =====================================================

export const DatePickerExample: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    console.log('Selected date:', date);
  };

  return (
    <div className="p-space-6 space-y-space-4">
      <h2 className="text-h4 text-airvik-black dark:text-airvik-white">
        Date Picker Examples
      </h2>
      
      {/* Basic Date Picker */}
      <div>
        <label className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
          Select Date
        </label>
        <DatePicker
          value={selectedDate}
          onChange={handleDateChange}
          placeholder="Choose a date"
          className="w-full"
        />
      </div>

      {/* Date Picker with Custom Year Range */}
      <div>
        <label className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
          Date of Birth (13+ years only)
        </label>
        <DatePicker
          value={selectedDate}
          onChange={handleDateChange}
          placeholder="Select your date of birth"
          maxDate={new Date(new Date().getFullYear() - 13, 11, 31)}
          className="w-full"
        />
      </div>

      {/* Date Picker with Error State */}
      <div>
        <label className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
          Date with Error
        </label>
        <DatePicker
          value={selectedDate}
          onChange={handleDateChange}
          placeholder="Select date"
          error="This is an example error message"
          className="w-full"
        />
      </div>

      {/* Disabled Date Picker */}
      <div>
        <label className="block text-label font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
          Disabled Date Picker
        </label>
        <DatePicker
          value={selectedDate}
          onChange={handleDateChange}
          placeholder="Select date"
          disabled={true}
          className="w-full"
        />
      </div>

      {/* Selected Date Display */}
      {selectedDate && (
        <div className="mt-space-4 p-space-4 bg-gray-50 dark:bg-gray-800 rounded-radius-md">
          <p className="text-body text-airvik-black dark:text-airvik-white">
            Selected Date: {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      )}
    </div>
  );
};

export default DatePickerExample;
