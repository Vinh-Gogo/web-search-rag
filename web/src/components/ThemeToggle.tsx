"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set mounted to true after hydration to avoid SSR mismatch
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="relative p-2 rounded-lg bg-background border border-border" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative p-2 rounded-lg bg-background border border-border hover:bg-accent transition-colors"
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`absolute top-0 left-0 w-5 h-5 transition-all duration-300 ${
            isDark ? "rotate-90 scale-0" : "rotate-0 scale-100"
          }`}
        />
        <Moon
          className={`absolute top-0 left-0 w-5 h-5 transition-all duration-300 ${
            isDark ? "rotate-0 scale-100" : "-rotate-90 scale-0"
          }`}
        />
      </div>
    </button>
  );
}
