"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

interface MobileSidebarProps {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  className?: string;
}

export function MobileSidebar({
  children,
  trigger,
  className,
}: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger trigger - shows on mobile/tablet */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "p-2 rounded-lg bg-white shadow-lg border border-gray-200",
            "hover:bg-gray-50 transition-colors",
            "min-h-[48px] min-w-[48px] flex items-center justify-center"
          )}
          aria-label="Open navigation menu"
        >
          {trigger || <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 bg-white shadow-xl z-50 overflow-y-auto",
          "w-72 transition-transform duration-300 ease-in-out",
          "lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        {/* Close button */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className={cn(
              "p-2 rounded-lg hover:bg-gray-100 transition-colors",
              "min-h-[44px] min-w-[44px] flex items-center justify-center"
            )}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar content */}
        <div onClick={() => setIsOpen(false)}>
          {children}
        </div>
      </div>
    </>
  );
}

interface MobileSidebarItemProps {
  icon?: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}

export function MobileSidebarItem({
  icon,
  label,
  href,
  onClick,
  active = false,
  className,
}: MobileSidebarItemProps) {
  const baseStyles = cn(
    "w-full flex items-center gap-3 px-4 py-3 text-left font-medium",
    "transition-colors duration-200 min-h-[48px]",
    "hover:bg-gray-100 active:bg-gray-200",
    active && "bg-blue-50 text-blue-600 border-l-4 border-blue-600",
    !active && "text-gray-700 border-l-4 border-transparent",
    className
  );

  const content = (
    <>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={baseStyles}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={baseStyles}>
      {content}
    </button>
  );
}

interface MobileSidebarSectionProps {
  title?: string;
  children: React.ReactNode;
}

export function MobileSidebarSection({
  title,
  children,
}: MobileSidebarSectionProps) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      {title && (
        <div className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </div>
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}
