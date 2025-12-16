"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface MobileOptimizedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: React.ReactNode;
}

export const MobileOptimizedInput = forwardRef<
  HTMLInputElement,
  MobileOptimizedInputProps
>(
  (
    {
      className,
      label,
      error,
      helpText,
      icon,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            disabled={disabled}
            className={cn(
              // Base styles
              "w-full px-4 py-3 text-base",
              // Font sizes optimized for mobile readability
              "text-lg md:text-base",
              // Touch-friendly spacing
              "min-h-[48px] md:min-h-[44px]",
              // Border and background
              "rounded-lg border border-gray-300 bg-white",
              // Touch-optimized focus states
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500",
              // Touch callout prevention
              "touch-callout-none",
              // Disable zoom on input focus on iOS
              "[font-size:16px] md:[font-size:inherit]",
              // Icon spacing when present
              icon && "pl-10",
              // Error state
              error && "border-red-500 focus:ring-red-500 focus:border-red-500",
              // Disabled state
              disabled && "bg-gray-100 text-gray-500 cursor-not-allowed",
              // Custom className
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 mt-1 font-medium">{error}</p>
        )}
        {helpText && !error && (
          <p className="text-sm text-gray-500 mt-1">{helpText}</p>
        )}
      </div>
    );
  }
);

MobileOptimizedInput.displayName = "MobileOptimizedInput";
