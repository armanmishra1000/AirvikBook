'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Calendar, ChevronDown, ArrowLeft } from 'lucide-react';

// =====================================================
// NEW DATE PICKER COMPONENT - HEROUI STYLE
// =====================================================

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface DatePickerNewProps {
  label?: string;
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const DatePickerNew: React.FC<DatePickerNewProps> = ({
  label,
  value,
  onChange,
  placeholder = "dd-mm-yyyy",
  error,
  required = false,
  disabled = false,
  minDate,
  maxDate,
  className,
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(value || new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value || null);
  const [viewMode, setViewMode] = useState<'calendar' | 'month' | 'year'>('calendar');
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(value || null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate years array (1900 to current year + 10)
  const years = Array.from(
    { length: new Date().getFullYear() + 10 - 1900 + 1 },
    (_, i) => 1900 + i
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setViewMode('calendar');
        // Reset temp selection if user cancels
        setTempSelectedDate(selectedDate);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedDate]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setViewMode('calendar');
        setTempSelectedDate(selectedDate);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, selectedDate]);

  // Update current date when value changes
  useEffect(() => {
    if (value) {
      setCurrentDate(value);
      setSelectedDate(value);
      setTempSelectedDate(value);
    } else {
      setSelectedDate(null);
      setTempSelectedDate(null);
    }
  }, [value]);

  // Format date as dd-mm-yyyy
  const formatDate = useCallback((date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }, []);

  // Check if date is disabled
  const isDateDisabled = useCallback((date: Date): boolean => {
    if (disabled) return true;
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  }, [disabled, minDate, maxDate]);

  // Check if date is today
  const isToday = useCallback((date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }, []);

  // Check if date is selected
  const isSelected = useCallback((date: Date): boolean => {
    return tempSelectedDate ? date.toDateString() === tempSelectedDate.toDateString() : false;
  }, [tempSelectedDate]);

  // Handle date selection
  const handleDateSelect = useCallback((date: Date) => {
    if (isDateDisabled(date)) return;
    setTempSelectedDate(date);
  }, [isDateDisabled]);

  // Handle month change
  const handleMonthChange = useCallback((direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  }, [currentDate]);

  // Handle month selection
  const handleMonthSelect = useCallback((monthIndex: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    setCurrentDate(newDate);
    setViewMode('calendar');
  }, [currentDate]);

  // Handle year selection
  const handleYearSelect = useCallback((year: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
    setViewMode('calendar');
  }, [currentDate]);

  // Handle Done button
  const handleDone = useCallback(() => {
    setSelectedDate(tempSelectedDate);
    onChange?.(tempSelectedDate);
    setIsOpen(false);
    setViewMode('calendar');
  }, [tempSelectedDate, onChange]);

  // Handle Back button
  const handleBack = useCallback(() => {
    setViewMode('calendar');
  }, []);

  // Generate calendar days
  const generateCalendarDays = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  }, [currentDate]);

  // Size classes
  const sizeClasses = {
    sm: 'px-space-3 py-space-2 text-body-sm',
    md: 'px-space-4 py-space-4 text-body',
    lg: 'px-space-5 py-space-4 text-body-lg'
  };

  return (
    <div className={cn("space-y-space-1", className)}>
      {label && (
        <label className={cn(
          "text-label text-airvik-black dark:text-airvik-white",
          "flex items-center gap-space-1",
          "font-medium"
        )}>
          {label}
          {required && <span className="text-error">*</span>}
        </label>
      )}
      
      <div className="relative" ref={containerRef}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            readOnly
            value={selectedDate ? formatDate(selectedDate) : ''}
            placeholder={placeholder}
            disabled={disabled}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            aria-label={label || "Date picker"}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            className={cn(
              // Base
              "w-full cursor-pointer pr-space-12",
              "rounded-radius-lg",
              "transition-all duration-normal",
              "border-1",
              
              // Size
              sizeClasses[size],
              
              // Colors
              "bg-airvik-white dark:bg-gray-900",
              selectedDate 
                ? "text-airvik-black dark:text-airvik-white" 
                : "text-gray-400 dark:text-gray-600",
              "placeholder:text-gray-400 dark:placeholder:text-gray-600",
              
              // Border
              error 
                ? "border-error focus:border-error" 
                : "border-gray-300 dark:border-gray-700 focus:border-airvik-blue dark:focus:border-airvik-cyan",
              
              // Focus
              "focus:outline-none focus:ring-2",
              error
                ? "focus:ring-error/20"
                : "focus:ring-airvik-blue/20 dark:focus:ring-airvik-cyan/20",
              
              // Disabled
              "disabled:bg-gray-100 dark:disabled:bg-gray-800",
              "disabled:cursor-not-allowed disabled:opacity-60"
            )}
          />
          
          {/* Calendar Icon */}
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              "absolute right-space-3 top-1/2 -translate-y-1/2",
              "p-space-1 rounded-radius-sm",
              "text-gray-400 hover:text-airvik-blue dark:hover:text-airvik-cyan",
              "transition-colors duration-fast",
              "focus:outline-none focus:ring-2 focus:ring-airvik-blue/20",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              "disabled:cursor-not-allowed disabled:opacity-60"
            )}
            aria-label="Open date picker"
          >
            <Calendar 
              className={cn(
                size === 'sm' && "size-4",
                size === 'md' && "size-5",
                size === 'lg' && "size-6"
              )}
            />
          </button>
        </div>
        
        {/* Calendar Dropdown */}
        {isOpen && (
          <div 
            ref={dropdownRef}
            className={cn(
              "absolute z-50 mt-space-1",
              "w-80",
              "bg-airvik-white dark:bg-gray-900",
              "rounded-radius-lg shadow-xl border border-gray-200 dark:border-gray-700",
              "overflow-hidden",
              "animate-in fade-in-0 zoom-in-95 duration-200"
            )}
            role="dialog"
            aria-label="Date picker"
          >
            {viewMode === 'month' ? (
              // Month Picker
              <div className="p-space-4">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-space-3 mb-space-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className={cn(
                      "flex items-center gap-space-1 p-space-2",
                      "font-medium text-airvik-blue dark:text-airvik-cyan",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      "rounded-radius-md transition-colors duration-fast",
                      "focus:outline-none focus:ring-2 focus:ring-airvik-blue/20"
                    )}
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                  <h3 className="text-label text-airvik-black dark:text-airvik-white font-medium">
                    Select Month
                  </h3>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-3 gap-space-2">
                    {MONTHS.map((month, index) => (
                      <button
                        key={month}
                        type="button"
                        onClick={() => handleMonthSelect(index)}
                        className={cn(
                          "px-space-3 py-space-2 rounded-radius-md text-center",
                          "transition-colors duration-fast",
                          "focus:outline-none focus:ring-2 focus:ring-airvik-blue/20",
                          "text-body-sm font-medium",
                          index === currentDate.getMonth()
                            ? "bg-airvik-blue text-airvik-white dark:bg-airvik-cyan dark:text-airvik-black"
                            : "text-airvik-black dark:text-airvik-white hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : viewMode === 'year' ? (
              // Year Picker
              <div className="p-space-4">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-space-3 mb-space-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className={cn(
                      "flex items-center gap-space-1 p-space-2",
                      "font-medium text-airvik-blue dark:text-airvik-cyan",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      "rounded-radius-md transition-colors duration-fast",
                      "focus:outline-none focus:ring-2 focus:ring-airvik-blue/20"
                    )}
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                  <h3 className="text-label text-airvik-black dark:text-airvik-white font-medium">
                    Select Year
                  </h3>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-3 gap-space-2">
                    {years.map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => handleYearSelect(year)}
                        className={cn(
                          "px-space-3 py-space-2 rounded-radius-md text-center",
                          "transition-colors duration-fast",
                          "focus:outline-none focus:ring-2 focus:ring-airvik-blue/20",
                          "text-body-sm font-medium",
                          year === currentDate.getFullYear()
                            ? "bg-airvik-blue text-airvik-white dark:bg-airvik-cyan dark:text-airvik-black"
                            : "text-airvik-black dark:text-airvik-white hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Calendar View
              <>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-space-3">
                  <button
                    type="button"
                    onClick={() => handleMonthChange('prev')}
                    className={cn(
                      "p-space-2 text-gray-500 rounded-radius-md",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      "transition-colors duration-fast",
                      "focus:outline-none focus:ring-2 focus:ring-airvik-blue/20"
                    )}
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  <div className="flex items-center gap-space-2">
                    <button
                      type="button"
                      onClick={() => setViewMode('month')}
                      className={cn(
                        "flex items-center gap-space-1 p-space-2",
                        "font-medium text-airvik-blue dark:text-airvik-cyan",
                        "hover:bg-gray-100 dark:hover:bg-gray-800",
                        "rounded-radius-md transition-colors duration-fast",
                        "focus:outline-none focus:ring-2 focus:ring-airvik-blue/20"
                      )}
                    >
                      {currentDate.toLocaleDateString('en-US', { month: 'short' })}
                      <ChevronDown size={16} />
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setViewMode('year')}
                      className={cn(
                        "flex items-center gap-space-1 p-space-2",
                        "font-medium text-airvik-blue dark:text-airvik-cyan",
                        "hover:bg-gray-100 dark:hover:bg-gray-800",
                        "rounded-radius-md transition-colors duration-fast",
                        "focus:outline-none focus:ring-2 focus:ring-airvik-blue/20"
                      )}
                    >
                      {currentDate.getFullYear()}
                      <ChevronDown size={16} />
                    </button>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => handleMonthChange('next')}
                    className={cn(
                      "p-space-2 text-gray-500 rounded-radius-md",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      "transition-colors duration-fast",
                      "focus:outline-none focus:ring-2 focus:ring-airvik-blue/20"
                    )}
                    aria-label="Next month"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                
                {/* Calendar Grid */}
                <div className="p-space-3">
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-space-1 mb-space-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                      <div
                        key={day}
                        className={cn(
                          "flex items-center justify-center font-medium text-center",
                          "text-gray-500 text-caption dark:text-gray-400",
                          "w-9 h-9"
                        )}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-space-1">
                    {generateCalendarDays().map((date, index) => {
                      const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                      const isSelectedDay = isSelected(date);
                      const isDisabledDay = isDateDisabled(date);
                      const isTodayDay = isToday(date);
                      
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleDateSelect(date)}
                          disabled={isDisabledDay}
                          className={cn(
                            "w-9 h-9 rounded-radius-md text-caption font-medium",
                            "transition-all duration-fast flex items-center justify-center",
                            "focus:outline-none focus:ring-2 focus:ring-offset-1",
                            "focus:ring-airvik-blue/50 dark:focus:ring-offset-gray-900",
                            
                            // Current month styling
                            isCurrentMonth
                              ? "text-airvik-black dark:text-airvik-white"
                              : "text-gray-300 dark:text-gray-600",
                            
                            // Today styling
                            isTodayDay && !isSelectedDay && "bg-gray-100 dark:bg-gray-800 text-airvik-blue dark:text-airvik-cyan",
                            
                            // Selected styling
                            isSelectedDay && "bg-airvik-blue text-airvik-white dark:bg-airvik-cyan dark:text-airvik-black",
                            
                            // Hover styling
                            !isDisabledDay && !isSelectedDay && "hover:bg-gray-100 dark:hover:bg-gray-800",
                            
                            // Disabled styling
                            isDisabledDay && "opacity-40 cursor-not-allowed"
                          )}
                          aria-label={`${date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}${isSelectedDay ? ' (selected)' : ''}${isDisabledDay ? ' (disabled)' : ''}`}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Done Button */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-space-3">
                  <button
                    type="button"
                    onClick={handleDone}
                    className={cn(
                      "w-full py-space-2 px-space-4",
                      "bg-airvik-blue text-airvik-white dark:bg-airvik-cyan dark:text-airvik-black",
                      "rounded-radius-md font-medium",
                      "hover:bg-airvik-purple dark:hover:bg-airvik-violet",
                      "transition-colors duration-fast",
                      "focus:outline-none focus:ring-2 focus:ring-airvik-blue/20"
                    )}
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <p className="flex items-center text-caption text-error gap-space-1">
          <span>⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};
