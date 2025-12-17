// web\src\components\NavigationTracker.tsx
"use client";

import { useEffect } from "react";

// Client-side navigation tracker
export function NavigationTracker() {
  useEffect(() => {
    // Track navigation events
    const handleNavigation = (url: string) => {
      console.log(`[Navigation] Page changed to: ${url}`);
    };

    // Listen for Next.js router events
    if (typeof window !== "undefined") {
      // Track initial load
      handleNavigation(window.location.pathname);

      // Track browser back/forward buttons
      window.addEventListener("popstate", () => {
        handleNavigation(window.location.pathname);
      });

      // Track programmatic navigation
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;

      history.pushState = function (
        state: unknown,
        title: string,
        url?: string | null
      ) {
        originalPushState.call(this, state, title, url);
        if (url) {
          console.log(`[Navigation] pushState to: ${url}`);
        }
      };

      history.replaceState = function (
        state: unknown,
        title: string,
        url?: string | null
      ) {
        originalReplaceState.call(this, state, title, url);
        if (url) {
          console.log(`[Navigation] replaceState to: ${url}`);
        }
      };
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  return null;
}
