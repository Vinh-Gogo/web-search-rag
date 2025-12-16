"use client";

import { useState, useEffect } from "react";

type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

interface BreakpointValues {
  sm: 640;
  md: 768;
  lg: 1024;
  xl: 1280;
  "2xl": 1536;
}

const BREAKPOINTS: BreakpointValues = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

/**
 * Hook to detect if screen matches a media query
 * @param query - Media query string (e.g., "(max-width: 768px)")
 * @returns boolean - Whether query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    // Get initial value synchronously
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Create and attach listener for changes
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);
    
    // Cleanup
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

/**
 * Hook to detect current breakpoint
 * @returns - "mobile" | "tablet" | "desktop"
 */
export function useBreakpoint(): "mobile" | "tablet" | "desktop" {
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.md - 1}px)`);
  const isTablet = useMediaQuery(
    `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`
  );

  if (isMobile) return "mobile";
  if (isTablet) return "tablet";
  return "desktop";
}

/**
 * Hook to check if specific breakpoint is active
 * @param breakpoint - Breakpoint to check (e.g., "md", "lg")
 * @param direction - "up" (>=) or "down" (<)
 */
export function useBreakpointCheck(
  breakpoint: Breakpoint,
  direction: "up" | "down" = "up"
): boolean {
  const px = BREAKPOINTS[breakpoint];
  const query =
    direction === "up"
      ? `(min-width: ${px}px)`
      : `(max-width: ${px - 1}px)`;
  return useMediaQuery(query);
}

/**
 * Hook to get window size (useful for responsive calculations)
 */
export function useWindowSize() {
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}
