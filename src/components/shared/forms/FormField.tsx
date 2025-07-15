'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label?: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'password' | 'number' | 'textarea' | 'select' | 'date' | 'time' | 'datetime-local';
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  fieldClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  helperText?: string;
  helperClassName?: string;
  options?: Array<{ value: string | number; label: string; disabled?: boolean }>;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  autoComplete?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const FormField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  FormFieldProps
>(({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  className,
  fieldClassName,
  labelClassName,
  errorClassName,
  helperText,
  helperClassName,
  options = [],
  rows = 3,
  min,
  max,
  step,
  autoComplete,
  autoFocus = false,
  readOnly = false,
  icon,
  rightIcon,
}, ref) => {
  const baseFieldClasses = cn(
    "w-full px-3 py-2 border rounded-md shadow-sm text-sm transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
    "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
    "read-only:bg-gray-50 read-only:text-gray-500",
    error 
      ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
      : "border-gray-300",
    (icon || rightIcon) ? "pl-10" : "",
    rightIcon ? "pr-10" : "",
    fieldClassName
  );

  const renderField = () => {
    const commonProps = {
      id: name,
      name,
      placeholder,
      value,
      defaultValue,
      onChange,
      onBlur,
      required,
      disabled,
      autoComplete,
      autoFocus,
      readOnly,
      className: baseFieldClasses,
    };

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={rows}
            ref={ref as React.Ref<HTMLTextAreaElement>}
          />
        );

      case 'select':
        return (
          <select
            {...commonProps}
            ref={ref as React.Ref<HTMLSelectElement>}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            {...commonProps}
            type={type}
            min={min}
            max={max}
            step={step}
            ref={ref as React.Ref<HTMLInputElement>}
          />
        );
    }
  };

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <label 
          htmlFor={name}
          className={cn(
            "block text-sm font-medium text-gray-700",
            required && "after:content-['*'] after:text-red-500 after:ml-1",
            labelClassName
          )}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 text-sm">
              {icon}
            </span>
          </div>
        )}
        
        {renderField()}
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400 text-sm">
              {rightIcon}
            </span>
          </div>
        )}
      </div>

      {helperText && !error && (
        <p className={cn("text-xs text-gray-500", helperClassName)}>
          {helperText}
        </p>
      )}

      {error && (
        <p className={cn("text-xs text-red-600", errorClassName)}>
          {error}
        </p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField'; 