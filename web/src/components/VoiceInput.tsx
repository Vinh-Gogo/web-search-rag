"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, StopCircle, Send, Volume2, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  playRecordingStartSound,
  playRecordingStopSound,
  playSuccessSound,
  playErrorSound,
  isAudioSupported,
} from "@/lib/audioFeedback";
import { useVoiceQueue } from "@/hooks/useVoiceQueue";

// Web Speech API interfaces
interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionResultItem;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  isFinal: boolean;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionErrorCode {
  error: string;
}

interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  language: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

// Extend Window interface for Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface VoiceInputProps {
  onSendMessage: (message: string, source: "voice" | "text") => Promise<void>;
  disabled?: boolean;
  className?: string;
}

/**
 * Voice Input Component with Web Speech API
 * Supports speech-to-text transcription
 */
export function VoiceInput({ onSendMessage, disabled, className }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [enableAudio, setEnableAudio] = useState(true);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const [language, setLanguage] = useState("en-US");
  const voiceQueue = useVoiceQueue();

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition: SpeechRecognitionConstructor | undefined =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      console.warn("Web Speech API not supported in this browser");
      return;
    }

    const recognition: ISpeechRecognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.language = language;

    // Handle recognition results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";

      for (let i = event.results.length - 1; i >= 0; i--) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          setTranscript((prev) => prev + transcript + " ");
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim);
      setError(null);
    };

    // Handle errors
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMsg = getErrorMessage(event.error);
      setError(errorMsg);
      console.error("Speech recognition error:", event.error);
    };

    // Handle end of recognition
    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language]);

  /**
   * Get user-friendly error message
   */
  const getErrorMessage = (error: string): string => {
    const errorMap: Record<string, string> = {
      "no-speech": "No speech detected. Please try again.",
      "audio-capture": "Microphone not available. Check your device settings.",
      "network": "Network error. Check your internet connection.",
      "not-allowed": "Microphone permission denied. Allow access in settings.",
      "service-not-allowed": "Speech recognition service not available.",
    };

    return errorMap[error] || `Error: ${error}`;
  };

  /**
   * Start listening for voice input
   */
  const handleStartListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;

    setError(null);
    setTranscript("");
    setInterimTranscript("");
    
    // Play start sound
    if (enableAudio && isAudioSupported()) {
      playRecordingStartSound();
    }
    
    recognitionRef.current.start();
    setIsListening(true);
  }, [isSupported, enableAudio]);

  /**
   * Stop listening
   */
  const handleStopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    // Play stop sound
    if (enableAudio && isAudioSupported()) {
      playRecordingStopSound();
    }

    recognitionRef.current.stop();
    setIsListening(false);
  }, [enableAudio]);

  /**
   * Send voice message
   */
  const handleSendVoice = useCallback(async () => {
    const fullTranscript = (transcript + interimTranscript).trim();

    if (!fullTranscript) {
      setError("No text to send");
      if (enableAudio && isAudioSupported()) {
        playErrorSound();
      }
      return;
    }

    setIsSending(true);
    handleStopListening();

    try {
      await onSendMessage(fullTranscript, "voice");
      setTranscript("");
      setInterimTranscript("");
      
      // Play success sound
      if (enableAudio && isAudioSupported()) {
        playSuccessSound();
      }
      
      toast.success("Message sent");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to send message";
      setError(errorMsg);
      
      // Play error sound
      if (enableAudio && isAudioSupported()) {
        playErrorSound();
      }
      
      // Queue message for offline retry
      try {
        await voiceQueue.addToQueue(fullTranscript, language);
        toast.error("Queued for offline send");
      } catch (queueErr) {
        toast.error(errorMsg);
      }
    } finally {
      setIsSending(false);
    }
  }, [transcript, interimTranscript, onSendMessage, handleStopListening, enableAudio, language, voiceQueue]);

  /**
   * Clear transcript
   */
  const handleClear = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);
    handleStopListening();
  }, [handleStopListening]);

  if (!isSupported) {
    return (
      <div className={cn("p-4 rounded-lg border border-yellow-200 bg-yellow-50", className)}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Voice input not supported</p>
            <p className="text-xs mt-1">
              Your browser doesnt support the Web Speech API. Please use text input instead.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hasTranscript = transcript || interimTranscript;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Voice Input Display */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 min-h-24">
        {hasTranscript ? (
          <div>
            {/* Final Transcript */}
            {transcript && (
              <div className="mb-2">
                <p className="text-sm text-gray-600 mb-1">Recognized:</p>
                <p className="text-base text-gray-900">{transcript}</p>
              </div>
            )}

            {/* Interim Transcript */}
            {interimTranscript && (
              <div>
                <p className="text-sm text-gray-500 italic">{interimTranscript}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-24 text-gray-500">
            {isListening ? (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1 h-4 bg-blue-500 rounded animate-pulse"></div>
                  <div className="w-1 h-6 bg-blue-500 rounded animate-pulse animation-delay-100"></div>
                  <div className="w-1 h-4 bg-blue-500 rounded animate-pulse animation-delay-200"></div>
                </div>
                <span className="text-sm">Listening...</span>
              </div>
            ) : (
              <span className="text-sm">Click to start speaking</span>
            )}
          </div>
        )}
      </div>

      {/* Language Selection */}
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <label htmlFor="language" className="text-sm font-medium text-gray-700">
            Language:
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isListening}
            className={cn(
              "px-3 py-2 border border-gray-300 rounded-lg text-sm",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
              isListening && "opacity-50 cursor-not-allowed"
            )}
          >
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="es-ES">Spanish</option>
            <option value="fr-FR">French</option>
            <option value="de-DE">German</option>
            <option value="it-IT">Italian</option>
            <option value="pt-BR">Portuguese (BR)</option>
            <option value="vi-VN">Vietnamese</option>
            <option value="zh-CN">Chinese (Simplified)</option>
            <option value="ja-JP">Japanese</option>
          </select>
        </div>

        {/* Audio Feedback Toggle */}
        {isAudioSupported() && (
          <button
            onClick={() => setEnableAudio(!enableAudio)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              enableAudio
                ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
            title={enableAudio ? "Disable audio feedback" : "Enable audio feedback"}
          >
            <Volume2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Mic Button */}
        <button
          onClick={isListening ? handleStopListening : handleStartListening}
          disabled={disabled || isSending}
          className={cn(
            "flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium min-h-[48px]",
            "transition-all duration-200",
            isListening
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-blue-600 text-white hover:bg-blue-700",
            (disabled || isSending) && "opacity-50 cursor-not-allowed"
          )}
        >
          {isListening ? (
            <>
              <StopCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Stop</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span className="hidden sm:inline">Listen</span>
            </>
          )}
        </button>

        {/* Send Button */}
        {hasTranscript && (
          <>
            <button
              onClick={handleSendVoice}
              disabled={disabled || isSending || !hasTranscript}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium min-h-[48px]",
                "bg-green-600 text-white hover:bg-green-700 transition-all duration-200",
                (disabled || isSending || !hasTranscript) && "opacity-50 cursor-not-allowed"
              )}
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">Send</span>
            </button>

            {/* Clear Button */}
            <button
              onClick={handleClear}
              disabled={disabled || isSending}
              className={cn(
                "px-4 py-3 rounded-lg font-medium min-h-[48px]",
                "bg-gray-200 text-gray-900 hover:bg-gray-300 transition-all duration-200",
                (disabled || isSending) && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className="hidden sm:inline">Clear</span>
              <span className="sm:hidden">C</span>
            </button>
          </>
        )}
      </div>

      {/* Info */}
      <p className="text-xs text-gray-500">
        💡 Tip: Click Listen, speak naturally, then click Send to send your message.
      </p>
    </div>
  );
}

/**
 * Hook for voice input management
 */
export function useVoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // Check support during render, not in effect
  const isSupported = typeof window !== "undefined" && 
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition: SpeechRecognitionConstructor | undefined =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition: ISpeechRecognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";

      for (let i = event.results.length - 1; i >= 0; i--) {
        const trans = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          setTranscript((prev) => prev + trans + " ");
        } else {
          interim += trans;
        }
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;

    setTranscript("");
    recognitionRef.current.start();
    setIsListening(true);
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    clearTranscript,
  };
}
