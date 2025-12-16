"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// TypeScript interfaces
export interface QuickActionCardProps {
  /** Icon component to display */
  icon: React.ElementType;
  /** Title text */
  title: string;
  /** Description text */
  description: string;
  /** Click handler */
  onClick: () => void;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Style variant */
  variant?: "primary" | "secondary" | "outline" | "ghost";
  /** Icon position */
  iconPosition?: "top" | "left";
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button is loading */
  loading?: boolean;
  /** Custom CSS class names */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Additional data attributes */
  "data-testid"?: string;
  /** Aria label for accessibility */
  "aria-label"?: string;
  /** Tab index for keyboard navigation */
  tabIndex?: number;
}

// Size configurations
const sizeConfig = {
  sm: {
    container: "p-4",
    icon: "w-8 h-8",
    iconContainer: "w-8 h-8 mb-3",
    title: "text-sm",
    description: "text-xs",
  },
  md: {
    container: "p-6",
    icon: "w-5 h-5",
    iconContainer: "w-10 h-10 mb-4",
    title: "text-lg",
    description: "text-sm",
  },
  lg: {
    container: "p-8",
    icon: "w-6 h-6",
    iconContainer: "w-12 h-12 mb-5",
    title: "text-xl",
    description: "text-base",
  },
};

// Variant configurations
const variantConfig = {
  primary: {
    container: "bg-card border-border hover:border-primary/50 hover:shadow-md",
    iconContainer: "bg-primary/10 group-hover:bg-primary/20",
    icon: "text-primary",
    title: "text-foreground",
    description: "text-muted-foreground",
    loading: "text-primary",
  },
  secondary: {
    container: "bg-secondary/50 border-secondary/50 hover:bg-secondary hover:shadow-md",
    iconContainer: "bg-secondary/70 group-hover:bg-secondary",
    icon: "text-secondary-foreground",
    title: "text-foreground",
    description: "text-muted-foreground",
    loading: "text-secondary-foreground",
  },
  outline: {
    container: "bg-transparent border-border hover:border-primary/50 hover:bg-accent/50",
    iconContainer: "bg-accent/50 group-hover:bg-accent",
    icon: "text-primary",
    title: "text-foreground",
    description: "text-muted-foreground",
    loading: "text-primary",
  },
  ghost: {
    container: "bg-transparent border-transparent hover:bg-accent/50 hover:shadow-sm",
    iconContainer: "bg-muted/50 group-hover:bg-muted",
    icon: "text-foreground",
    title: "text-foreground",
    description: "text-muted-foreground",
    loading: "text-foreground",
  },
};

const QuickActionCard = React.forwardRef<HTMLButtonElement, QuickActionCardProps>(
  (
    {
      icon: Icon,
      title,
      description,
      onClick,
      size = "md",
      variant = "primary",
      iconPosition = "top",
      disabled = false,
      loading = false,
      className,
      style,
      "data-testid": testId,
      "aria-label": ariaLabel,
      tabIndex,
      ...props
    },
    ref
  ) => {
    const sizeClasses = sizeConfig[size];
    const variantClasses = variantConfig[variant];
    const isDisabled = disabled || loading;

    // Handle keyboard interactions
    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (isDisabled) return;
      
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick();
      }
    };

    return (
      <motion.button
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={!isDisabled ? { y: -2 } : {}}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        onClick={isDisabled ? undefined : onClick}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        tabIndex={isDisabled ? -1 : tabIndex ?? 0}
        className={cn(
          // Base styles
          "group relative w-full rounded-xl border transition-all duration-200",
          "text-left font-medium",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Size and variant specific styles
          sizeClasses.container,
          variantClasses.container,
          // Layout
          iconPosition === "left" ? "flex flex-row items-center" : "flex flex-col",
          className
        )}
        style={style}
        data-testid={testId}
        aria-label={ariaLabel || title}
        aria-disabled={isDisabled}
        {...props}
      >
        {/* Icon Container */}
        {iconPosition === "top" ? (
          <motion.div
            initial={{ scale: 1 }}
            whileHover={!isDisabled ? { scale: 1.1 } : {}}
            className={cn(
              "flex items-center justify-center rounded-lg transition-colors",
              sizeClasses.iconContainer,
              variantClasses.iconContainer
            )}
          >
            {loading ? (
              <Loader2 
                className={cn(
                  "animate-spin",
                  sizeClasses.icon,
                  variantClasses.loading
                )} 
              />
            ) : (
              <Icon 
                className={cn(
                  sizeClasses.icon,
                  variantClasses.icon
                )} 
              />
            )}
          </motion.div>
        ) : (
          <div className="flex items-center space-x-3">
            <motion.div
              initial={{ scale: 1 }}
              whileHover={!isDisabled ? { scale: 1.1 } : {}}
              className={cn(
                "flex items-center justify-center rounded-lg transition-colors flex-shrink-0",
                sizeClasses.iconContainer,
                variantClasses.iconContainer
              )}
            >
              {loading ? (
                <Loader2 
                  className={cn(
                    "animate-spin",
                    sizeClasses.icon,
                    variantClasses.loading
                  )} 
                />
              ) : (
                <Icon 
                  className={cn(
                    sizeClasses.icon,
                    variantClasses.icon
                  )} 
                />
              )}
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <h3 className={cn("font-semibold leading-tight", sizeClasses.title)}>
                {title}
              </h3>
              <p className={cn("leading-relaxed", sizeClasses.description)}>
                {description}
              </p>
            </div>
          </div>
        )}

        {/* Text Content for top icon position */}
        {iconPosition === "top" && (
          <div className="flex-1">
            <h3 className={cn("font-semibold leading-tight", sizeClasses.title)}>
              {title}
            </h3>
            <p className={cn("leading-relaxed", sizeClasses.description)}>
              {description}
            </p>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Focus Indicator */}
        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/20 opacity-0 group-focus:opacity-100 transition-opacity pointer-events-none" />
      </motion.button>
    );
  }
);

QuickActionCard.displayName = "QuickActionCard";

// Named exports for different use cases
export { QuickActionCard };
export default QuickActionCard;

// Convenience components for common use cases
export const QuickActionCardSmall = (props: Omit<QuickActionCardProps, "size">) => (
  <QuickActionCard {...props} size="sm" />
);

export const QuickActionCardLarge = (props: Omit<QuickActionCardProps, "size">) => (
  <QuickActionCard {...props} size="lg" />
);

export const QuickActionCardWithLeftIcon = (props: Omit<QuickActionCardProps, "iconPosition">) => (
  <QuickActionCard {...props} iconPosition="left" />
);
