'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Calendar, X, ChevronUp, ChevronDown } from 'lucide-react';


// =====================================================
// PROFESSIONAL DATE PICKER COMPONENT - BRAND COMPLIANT
// =====================================================

// --- Constants for Month/Year Picker ---
const ITEM_HEIGHT = 40; // Corresponds to h-9 in Tailwind
const VISIBLE_ITEMS = 7;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PADDING = (PICKER_HEIGHT - ITEM_HEIGHT) / 2;

const MONTHS = Array.from({ length: 12 }, (_, i) => 
  new Date(0, i).toLocaleString('en-US', { month: 'long' })
);

interface DatePickerProps {
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

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = "Select a date",
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
  const [viewMode, setViewMode] = useState<'calendar' | 'monthYear'>('calendar');
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const monthScrollRef = useRef<HTMLDivElement>(null);
  const yearScrollRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const years = useMemo(() => {
    const endYear = new Date().getFullYear() + 100;
    const startYear = 1900;
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setViewMode('calendar');
        setFocusedDate(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent dropdown from closing when clicking inside
  const handleDropdownClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setViewMode('calendar');
        setFocusedDate(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Update current date when value changes
  useEffect(() => {
    if (value) {
      setCurrentDate(value);
      setSelectedDate(value);
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  // Effect to set initial scroll position of month/year picker
  useEffect(() => {
    if (viewMode === 'monthYear' && isOpen) {
      const monthEl = monthScrollRef.current;
      const yearEl = yearScrollRef.current;
      
      if (monthEl) {
        const monthIndex = Math.max(0, Math.min(currentDate.getMonth(), 11));
        monthEl.scrollTop = monthIndex * ITEM_HEIGHT;
      }
      if (yearEl) {
        const yearIndex = years.indexOf(currentDate.getFullYear());
        if (yearIndex !== -1) {
          const validYearIndex = Math.max(0, Math.min(yearIndex, years.length - 1));
          yearEl.scrollTop = validYearIndex * ITEM_HEIGHT;
        }
      }
    }
  }, [viewMode, isOpen, currentDate, years]);
  
  // Effect to handle scroll-and-snap behavior for the picker
  useEffect(() => {
    const handleScroll = (element: HTMLDivElement, type: 'month' | 'year') => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      
      scrollTimeoutRef.current = setTimeout(() => {
        const { scrollTop } = element;
        const selectedIndex = Math.round(scrollTop / ITEM_HEIGHT);
        
        // Ensure the index is within valid bounds
        let validIndex = selectedIndex;
        if (type === 'month') {
          validIndex = Math.max(0, Math.min(selectedIndex, 11)); // 0-11 for months
        } else {
          validIndex = Math.max(0, Math.min(selectedIndex, years.length - 1)); // 0 to years.length-1
        }
        
        element.scrollTo({ top: validIndex * ITEM_HEIGHT, behavior: 'smooth' });
        
        const newDate = new Date(currentDate);
        if (type === 'month') {
          newDate.setMonth(validIndex);
        } else {
          const newYear = years[validIndex];
          if (newYear) newDate.setFullYear(newYear);
        }
        setCurrentDate(newDate);
      }, 150);
    };

    // Real-time scroll handler for immediate header updates
    const handleRealTimeScroll = (element: HTMLDivElement, type: 'month' | 'year') => {
      const { scrollTop } = element;
      const selectedIndex = Math.round(scrollTop / ITEM_HEIGHT);
      
      // Ensure the index is within valid bounds
      let validIndex = selectedIndex;
      if (type === 'month') {
        validIndex = Math.max(0, Math.min(selectedIndex, 11)); // 0-11 for months
      } else {
        validIndex = Math.max(0, Math.min(selectedIndex, years.length - 1)); // 0 to years.length-1
      }
      
      const newDate = new Date(currentDate);
      if (type === 'month') {
        newDate.setMonth(validIndex);
      } else {
        const newYear = years[validIndex];
        if (newYear) newDate.setFullYear(newYear);
      }
      setCurrentDate(newDate);
    };

    const monthEl = monthScrollRef.current;
    const yearEl = yearScrollRef.current;
    if (viewMode !== 'monthYear' || !isOpen) return;

    const monthScrollListener = () => handleScroll(monthEl!, 'month');
    const yearScrollListener = () => handleScroll(yearEl!, 'year');
    
    const monthRealTimeListener = () => handleRealTimeScroll(monthEl!, 'month');
    const yearRealTimeListener = () => handleRealTimeScroll(yearEl!, 'year');

    monthEl?.addEventListener('scroll', monthScrollListener);
    yearEl?.addEventListener('scroll', yearScrollListener);
    
    // Add real-time listeners for immediate updates
    monthEl?.addEventListener('scroll', monthRealTimeListener);
    yearEl?.addEventListener('scroll', yearRealTimeListener);

    return () => {
      monthEl?.removeEventListener('scroll', monthScrollListener);
      yearEl?.removeEventListener('scroll', yearScrollListener);
      monthEl?.removeEventListener('scroll', monthRealTimeListener);
      yearEl?.removeEventListener('scroll', yearRealTimeListener);
    };
  }, [viewMode, isOpen, currentDate, years]);

  const formatDate = useCallback((date: Date): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const day = days[date.getDay()];
    const dateNum = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day}, ${dateNum}${getOrdinalSuffix(dateNum)} ${month} ${year}`;
  }, []);

  const getOrdinalSuffix = (num: number): string => {
    if (num > 3 && num < 21) return 'th';
    switch (num % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const getDaysInMonth = (date: Date): number => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date): number => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const isToday = (date: Date): boolean => date.toDateString() === new Date().toDateString();
  const isSelected = (date: Date): boolean => selectedDate ? date.toDateString() === selectedDate.toDateString() : false;
  const isFocused = (date: Date): boolean => focusedDate ? date.toDateString() === focusedDate.toDateString() : false;

  const isDisabled = useCallback((date: Date): boolean => {
    if (disabled) return true;
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (minDate) {
        const min = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
        if (day < min) return true;
    }
    if (maxDate) {
        const max = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
        if (day > max) return true;
    }
    return false;
  }, [disabled, minDate, maxDate]);

  const handleDateSelect = useCallback((date: Date) => {
    if (isDisabled(date)) return;
    
    setSelectedDate(date);
    setCurrentDate(date);
    onChange?.(date);
    setIsOpen(false);
    setViewMode('calendar');
    setFocusedDate(null);
  }, [isDisabled, onChange]);

  const handleMonthChange = useCallback((direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(1); // Avoids issues with month-end dates
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  }, [currentDate]);
  
  const generateCalendarDays = useCallback(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i), isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i), isCurrentMonth: true });
    }
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i), isCurrentMonth: false });
    }
    return days;
  }, [currentDate]);

  const clearDate = useCallback(() => {
    setSelectedDate(null);
    onChange?.(null);
  }, [onChange]);
  
  const toggleViewMode = useCallback(() => setViewMode(prev => prev === 'calendar' ? 'monthYear' : 'calendar'), []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent, date: Date) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleDateSelect(date);
    }
  }, [handleDateSelect]);

  const handleInputKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    }
  }, [disabled, isOpen]);

  const sizeClasses = {
    sm: 'px-space-3 py-space-2 text-body-sm',
    md: 'px-space-4 py-space-4 text-body',
    lg: 'px-space-5 py-space-4 text-body-lg'
  };

  return (
    <div className={cn("space-y-space-1", className)}>
      {label && (
        <label className={cn(
          "text-label text-gray-700 dark:text-gray-300",
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
            onKeyDown={handleInputKeyDown}
            aria-label={label || "Date picker"}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            className={cn(
              // Base
              "w-full cursor-pointer",
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
                : "border-gray-300 dark:border-gray-700 focus:border-airvik-black dark:focus:border-airvik-cyan",
              
              // Focus
              "focus:outline-none focus:ring-2",
              error
                ? "focus:ring-error/20"
                : "focus:ring-airvik-black/20 dark:focus:ring-airvik-cyan/20",
              
              // Disabled
              "disabled:bg-gray-100 dark:disabled:bg-gray-800",
              "disabled:cursor-not-allowed disabled:opacity-60"
            )}
          />
          
          {/* Calendar Icon */}
          <Calendar 
            className={cn(
              "absolute right-space-3 top-1/2 -translate-y-1/2",
              "text-gray-400 pointer-events-none",
              "transition-colors duration-fast",
              size === 'sm' && "size-4",
              size === 'md' && "size-5",
              size === 'lg' && "size-6"
            )}
          />
          
          {/* Clear Button */}
          {selectedDate && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearDate();
              }}
              className={cn(
                "absolute right-space-10 top-1/2 -translate-y-1/2",
                "p-space-1 rounded-radius-sm",
                "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
                "transition-colors duration-fast",
                "focus:outline-none focus:ring-2 focus:ring-airvik-black/20",
                "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              title="Clear date"
              aria-label="Clear selected date"
            >
              <X size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />
            </button>
          )}
        </div>
        
        {/* Calendar Dropdown */}
        {isOpen && (
          <div 
            ref={dropdownRef}
            onClick={handleDropdownClick}
            className={cn(
              "absolute z-50 mt-space-1",
              size === 'sm' && "w-64",
              size === 'md' && "w-72",
              size === 'lg' && "w-80",
              "bg-airvik-white dark:bg-gray-900",
              "rounded-radius-lg shadow-xl border border-gray-200 dark:border-gray-700",
              "overflow-hidden",
              "animate-in fade-in-0 zoom-in-95 duration-200"
            )}
            role="dialog"
            aria-label="Date picker"
          >
            {viewMode === 'monthYear' ? (
              // --- MONTH/YEAR PICKER VIEW ---
              <>
                <div className="flex items-center justify-center border-b border-gray-200 p-space-3 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={toggleViewMode}
                    className={cn(
                      "flex items-center justify-center w-full gap-space-1 p-space-2",
                      "font-medium transition-colors rounded-radius-md",
                      "text-body text-airvik-black dark:text-airvik-white",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      "focus:outline-none focus:ring-2 focus:ring-airvik-black/20",
                      "duration-fast",
                      "whitespace-nowrap"
                    )}
                  >
                    <span className="flex items-center gap-space-1">
                      {currentDate.toLocaleDateString('en-US', { month: 'long' })}
                      {currentDate.getFullYear()}
                    </span>
                    <ChevronUp size={16} />
                  </button>
                </div>
                <div className="relative flex" style={{ height: `${PICKER_HEIGHT}px` }}>
                  <div className="absolute w-full -translate-y-1/2  pointer-events-none rounded-radius-md top-1/2 h-9 dark:bg-gray-800" />
                  
                  {/* Month Scroller */}
                  <div 
                    ref={monthScrollRef} 
                    className="flex-1 overflow-y-auto scrollbar-hide" 
                    style={{ 
                      paddingTop: `${PADDING}px`, 
                      paddingBottom: `${PADDING}px`,
                      height: `${PICKER_HEIGHT}px`
                    }}
                    onClick={handleDropdownClick}
                  >
                    {MONTHS.map((month, index) => (
                      <button
                        key={month}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newDate = new Date(currentDate);
                          newDate.setMonth(index);
                          setCurrentDate(newDate);
                          
                          // Smooth scroll to the selected month
                          setTimeout(() => {
                            if (monthScrollRef.current) {
                              monthScrollRef.current.scrollTo({
                                top: index * ITEM_HEIGHT,
                                behavior: 'smooth'
                              });
                            }
                          }, 100);
                        }}
                                                 className={cn(
                           "w-full flex items-center justify-center text-sm h-9",
                           "transition-colors duration-fast",
                           "focus:outline-none",
                           index === currentDate.getMonth()
                             ? "text-airvik-blue dark:text-airvik-cyan font-medium "
                             : "text-gray-500 dark:text-gray-400"
                         )}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                  
                  {/* Year Scroller */}
                  <div 
                    ref={yearScrollRef} 
                    className="flex-1 overflow-y-auto scrollbar-hide" 
                    style={{ 
                      paddingTop: `${PADDING}px`, 
                      paddingBottom: `${PADDING}px`,
                      height: `${PICKER_HEIGHT}px`
                    }}
                    onClick={handleDropdownClick}
                  >
                    {years.map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newDate = new Date(currentDate);
                          newDate.setFullYear(year);
                          setCurrentDate(newDate);
                          
                          // Smooth scroll to the selected year
                          setTimeout(() => {
                            if (yearScrollRef.current) {
                              const yearIndex = years.indexOf(year);
                              yearScrollRef.current.scrollTo({
                                top: yearIndex * ITEM_HEIGHT,
                                behavior: 'smooth'
                              });
                            }
                          }, 100);
                        }}
                                                 className={cn(
                           "w-full flex items-center justify-center text-sm h-9",
                           "transition-colors duration-fast",
                           "focus:outline-none",
                           year === currentDate.getFullYear()
                             ? "text-airvik-blue dark:text-airvik-cyan font-medium"
                             : "text-gray-500 dark:text-gray-400"
                         )}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              // --- DEFAULT CALENDAR VIEW ---
              <>
                <div className="flex items-center justify-between border-b border-gray-200 p-space-3 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => handleMonthChange('prev')}
                    className={cn(
                      "p-space-2 text-gray-500 rounded-radius-md",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      "transition-colors duration-fast",
                      "focus:outline-none focus:ring-2 focus:ring-airvik-black/20"
                    )}
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  <button
                    type="button"
                    onClick={toggleViewMode}
                    className={cn(
                      "flex items-center gap-space-1 p-space-2",
                      "font-medium transition-colors rounded-radius-md",
                      "text-body text-airvik-black dark:text-airvik-white",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      "focus:outline-none focus:ring-2 focus:ring-airvik-black/20",
                      "duration-fast"
                    )}
                  >
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    <ChevronDown size={16} />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleMonthChange('next')}
                    className={cn(
                      "p-space-2 text-gray-500 rounded-radius-md",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      "transition-colors duration-fast",
                      "focus:outline-none focus:ring-2 focus:ring-airvik-black/20"
                    )}
                    aria-label="Next month"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                
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
                  
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-space-1">
                    {generateCalendarDays().map(({ date, isCurrentMonth }, index) => {
                      const isSelectedDay = isSelected(date);
                      const isDisabledDay = isDisabled(date);
                      const isFocusedDay = isFocused(date);
                      const isTodayDay = isToday(date);
                      
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleDateSelect(date)}
                          onKeyDown={(e) => handleKeyDown(e, date)}
                          disabled={isDisabledDay}
                          onMouseEnter={() => setFocusedDate(date)}
                          onMouseLeave={() => setFocusedDate(null)}
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
                            
                            // Focused styling
                            isFocusedDay && !isSelectedDay && !isDisabledDay && "bg-gray-50 dark:bg-gray-800",
                            
                            // Hover styling
                            !isDisabledDay && !isSelectedDay && !isFocusedDay && "hover:bg-gray-100 dark:hover:bg-gray-800",
                            
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
