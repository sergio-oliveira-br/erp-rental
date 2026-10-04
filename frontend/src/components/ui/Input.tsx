// frontend/src/components/ui/Input.tsx

import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 transition-colors',
            error
              ? 'border-red-500 focus:ring-red-200 text-red-900'
              : 'border-gray-300 focus:border-primary focus:ring-primary/20 text-gray-900',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-600 mt-0.5">{error}</span>}
        {!error && helperText && <span className="text-xs text-gray-500 mt-0.5">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';