"use client";

import { useState, useCallback, useEffect } from "react";
import { MobileGenerationUI } from "@/components/MobileGenerationUI";
import { useMobileAPI } from "@/hooks/useMobileAPI";

/**
 * Mobile Voice & Generation Page Content
 * Optimized for mobile devices with voice input and AI generation
 */
export default function VoicePageContent() {
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const api = useMobileAPI();
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize mobile detection on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mobileQuery = window.matchMedia("(max-width: 768px)");
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

    setIsMobile(mobileQuery.matches);
    setIsDarkMode(darkQuery.matches);

    const handleMobileChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    const handleDarkChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);

    mobileQuery.addEventListener("change", handleMobileChange);
    darkQuery.addEventListener("change", handleDarkChange);

    return () => {
      mobileQuery.removeEventListener("change", handleMobileChange);
      darkQuery.removeEventListener("change", handleDarkChange);
    };
  }, []);

  /**
   * Handle generating response
   */
  const handleGenerateResponse = useCallback(
    async (message: string): Promise<string> => {
      setIsGenerating(true);

      try {
        // Call mobile chat endpoint
        const response = await api.post(
          "/chat",
          {
            message,
            conversationId: `mobile-${Date.now()}`,
            timestamp: new Date().toISOString(),
          },
          `chat-${Date.now()}`
        );

        // Type guard for response
        if (
          response &&
          typeof response === "object" &&
          "response" in response &&
          typeof (response as Record<string, unknown>).response === "string"
        ) {
          return (response as { response: string }).response;
        }

        throw new Error("Invalid response format");
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Failed to generate response";
        throw new Error(errorMsg);
      } finally {
        setIsGenerating(false);
      }
    },
    [api]
  );

  return (
    <div className="w-full h-screen bg-white dark:bg-gray-900 overflow-hidden">
      {/* Full-screen Generation UI */}
      <MobileGenerationUI
        onGenerateResponse={handleGenerateResponse}
        isDarkMode={isDarkMode}
        className="h-full"
      />

      {/* Desktop Info Banner */}
      {!isMobile && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-600 dark:text-blue-400 text-center">
            💡 Best viewed on mobile devices (&lt;768px width). This page is optimized for mobile
            screens.
          </p>
        </div>
      )}
    </div>
  );
}
