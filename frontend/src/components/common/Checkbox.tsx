"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";

// =====================================================
// BRAND-COMPLIANT CHECKBOX COMPONENT
// =====================================================
// Using ONLY brand tokens: airvik-*, space-*, text-*
// Proper focus state management with accessibility

interface CheckboxProps {
  id?: string;
  name?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  className?: string;
  labelClassName?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  name,
  checked,
  onChange,
  label,
  disabled = false,
  required = false,
  error = false,
  className = "",
  labelClassName = "",
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <label
      className={cn(
        "flex items-center gap-space-3 cursor-pointer select-none",
        disabled && "cursor-not-allowed opacity-60",
        className
      )}
    >
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          required={required}
          aria-invalid={error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            // Hide the actual input but keep it accessible
            "sr-only",
            // Focus management
            "focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
            // Remove all browser defaults
            "appearance-none"
          )}
        />
        
        {/* Custom checkbox visual */}
        <div
          className={cn(
            // Base styles
            "w-5 h-5 rounded-radius-sm",
            "border-2 transition-all duration-fast",
            "flex items-center justify-center",
            
            // Colors based on state
            checked
              ? "bg-airvik-blue border-airvik-blue"
              : "bg-airvik-white dark:bg-gray-900 border-gray-300 dark:border-gray-700",
            
            // Error state
            error && !checked && "border-error",
            
            // Hover states (only when not disabled)
            !disabled && !checked && "hover:border-airvik-blue dark:hover:border-airvik-cyan",
            
            // Focus states (using peer selector for proper focus management)
            "peer-focus-visible:ring-2 peer-focus-visible:ring-airvik-blue/20 peer-focus-visible:ring-offset-2",
            
            // Disabled state
            disabled && "opacity-50 cursor-not-allowed"
          )}
          role="checkbox"
          aria-checked={checked}
          aria-disabled={disabled}
        >
          {/* Check icon */}
          {checked && (
            <Check 
              className="w-3 h-3 text-airvik-white" 
              strokeWidth={3}
              aria-hidden="true"
            />
          )}
        </div>
      </div>
      
      {/* Label */}
      {label && (
        <span 
          className={cn(
            "text-body text-gray-700 dark:text-gray-300",
            labelClassName
          )}
        >
          {label}
          {required && <span className="text-error ml-space-1">*</span>}
        </span>
      )}
      
      {/* Error message */}
      {error && (
        <div id={`${id}-error`} className="sr-only" role="alert">
          This field is required
        </div>
      )}
    </label>
  );
};

export default Checkbox;
