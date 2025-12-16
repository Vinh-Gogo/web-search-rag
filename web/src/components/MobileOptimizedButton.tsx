"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface MobileOptimizedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  loading?: boolean;
}

export const MobileOptimizedButton = forwardRef<
  HTMLButtonElement,
  MobileOptimizedButtonProps
>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      icon,
      loading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      // Base styles
      "inline-flex items-center justify-center gap-2 font-medium",
      // Touch-friendly minimum size (48px minimum on mobile)
      "min-h-[48px] md:min-h-[44px] px-4 rounded-lg",
      // Touch-optimized transitions
      "transition-all duration-200 active:scale-95",
      // Disable tap highlight on mobile
      "[webkit-tap-highlight-color:transparent]",
      // Focus states
      "focus:outline-none focus:ring-2 focus:ring-offset-0",
      // Disabled state
      disabled && "opacity-50 cursor-not-allowed",
      // Loading state
      loading && "opacity-75 cursor-wait"
    );

    const variantStyles = {
      primary: cn(
        "bg-blue-600 text-white hover:bg-blue-700",
        "focus:ring-blue-500"
      ),
      secondary: cn(
        "bg-gray-200 text-gray-900 hover:bg-gray-300",
        "focus:ring-gray-400"
      ),
      ghost: cn(
        "bg-transparent text-gray-700 hover:bg-gray-100",
        "focus:ring-gray-400"
      ),
      danger: cn(
        "bg-red-600 text-white hover:bg-red-700",
        "focus:ring-red-500"
      ),
    };

    const sizeStyles = {
      sm: "text-sm py-2 px-3 min-h-[40px] md:min-h-[36px]",
      md: "text-base py-3 px-4",
      lg: "text-lg py-4 px-6 min-h-[56px] md:min-h-[48px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading && (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {icon && <span>{icon}</span>}
        {children}
      </button>
    );
  }
);

MobileOptimizedButton.displayName = "MobileOptimizedButton";
