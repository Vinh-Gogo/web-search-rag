"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Send, Loader2, Copy, Volume2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { VoiceInput, useVoiceInput } from "./VoiceInput";
import { toast } from "sonner";

interface GeneratedMessage {
  id: string;
  content: string;
  source: "voice" | "text";
  timestamp: number;
  isStreaming?: boolean;
}

interface MobileGenerationUIProps {
  onGenerateResponse: (message: string) => Promise<string>;
  isDarkMode?: boolean;
  className?: string;
}

/**
 * Mobile-optimized generation UI with voice input
 * Shows generated content with easy copy and audio playback
 */
export function MobileGenerationUI({
  onGenerateResponse,
  isDarkMode = false,
  className,
}: MobileGenerationUIProps) {
  const [messages, setMessages] = useState<GeneratedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const voiceRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Handle sending message (voice or text)
   */
  const handleSendMessage = useCallback(
    async (content: string, source: "voice" | "text") => {
      const userMessage: GeneratedMessage = {
        id: `msg-${Date.now()}`,
        content,
        source,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // Add streaming message placeholder
        const responseId = `msg-${Date.now() + 1}`;
        setMessages((prev) => [
          ...prev,
          {
            id: responseId,
            content: "",
            source: "text",
            timestamp: Date.now(),
            isStreaming: true,
          },
        ]);

        // Get response from backend
        const response = await onGenerateResponse(content);

        // Update message with response
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === responseId
              ? { ...msg, content: response, isStreaming: false }
              : msg
          )
        );

        toast.success("Response generated");
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Generation failed";
        toast.error(errorMsg);

        // Remove the placeholder message on error
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsLoading(false);
      }
    },
    [onGenerateResponse]
  );

  /**
   * Copy message to clipboard
   */
  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  }, []);

  /**
   * Speak message using Web Speech API
   */
  const handleSpeakMessage = useCallback((content: string) => {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(content);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        setIsSpeaking(false);
        toast.error("Speech synthesis error");
      };

      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Speech synthesis not supported");
    }
  }, []);

  /**
   * Delete a message
   */
  const handleDeleteMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  /**
   * Clear all messages
   */
  const handleClearAll = useCallback(() => {
    if (confirm("Clear all messages?")) {
      setMessages([]);
      setIsLoading(false);
    }
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col h-full max-h-screen",
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900",
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "px-4 py-4 border-b flex items-center justify-between sticky top-0 z-10",
          isDarkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
        )}
      >
        <h2 className="font-bold text-lg">Voice & Text Generation</h2>
        {messages.length > 0 && (
          <button
            onClick={handleClearAll}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDarkMode
                ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
            )}
            title="Clear all"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        className={cn(
          "flex-1 overflow-y-auto p-4 space-y-4",
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        )}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p
                className={cn(
                  "text-lg font-medium mb-2",
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                )}
              >
                No messages yet
              </p>
              <p
                className={cn(
                  "text-sm",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}
              >
                Start by speaking or typing below
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 items-start",
                message.source === "voice" ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                  message.source === "voice"
                    ? isDarkMode
                      ? "bg-blue-600"
                      : "bg-blue-500"
                    : isDarkMode
                    ? "bg-purple-600"
                    : "bg-purple-500",
                  "text-white"
                )}
              >
                {message.source === "voice" ? "🎤" : "🤖"}
              </div>

              {/* Message Bubble */}
              <div className="flex-1 max-w-xs">
                <div
                  className={cn(
                    "px-4 py-3 rounded-lg rounded-tl-none",
                    message.source === "voice"
                      ? isDarkMode
                        ? "bg-blue-900"
                        : "bg-blue-100"
                      : isDarkMode
                      ? "bg-purple-900"
                      : "bg-purple-100",
                    message.source === "voice"
                      ? isDarkMode
                        ? "text-blue-100"
                        : "text-blue-900"
                      : isDarkMode
                      ? "text-purple-100"
                      : "text-purple-900"
                  )}
                >
                  {message.isStreaming ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating...</span>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                      {message.content}
                    </p>
                  )}
                </div>

                {/* Message Time */}
                <p
                  className={cn(
                    "text-xs mt-1 text-right",
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  )}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>

                {/* Message Actions */}
                {!message.isStreaming && (
                  <div className="flex gap-2 mt-2 justify-end">
                    <button
                      onClick={() => handleCopyMessage(message.content)}
                      className={cn(
                        "p-2 rounded transition-colors",
                        isDarkMode
                          ? "hover:bg-gray-700"
                          : "hover:bg-gray-200"
                      )}
                      title="Copy"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleSpeakMessage(message.content)}
                      className={cn(
                        "p-2 rounded transition-colors",
                        isDarkMode
                          ? "hover:bg-gray-700"
                          : "hover:bg-gray-200",
                        isSpeaking && (isDarkMode ? "bg-gray-700" : "bg-gray-200")
                      )}
                      title={isSpeaking ? "Stop" : "Speak"}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      className={cn(
                        "p-2 rounded transition-colors text-red-500",
                        isDarkMode
                          ? "hover:bg-gray-700"
                          : "hover:bg-gray-200"
                      )}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Input */}
      <div
        className={cn(
          "border-t p-4",
          isDarkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
        )}
      >
        <VoiceInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          className={isDarkMode ? "dark" : ""}
        />
      </div>
    </div>
  );
}

/**
 * Text-based input component for mobile
 */
export function MobileTextInput({
  onSendMessage,
  disabled = false,
  isDarkMode = false,
}: {
  onSendMessage: (message: string) => Promise<void>;
  disabled?: boolean;
  isDarkMode?: boolean;
}) {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) return;

    setIsLoading(true);
    try {
      await onSendMessage(text);
      setText("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your message..."
        disabled={disabled || isLoading}
        className={cn(
          "flex-1 px-4 py-3 rounded-lg border min-h-[48px]",
          "focus:outline-none focus:ring-2",
          isDarkMode
            ? "bg-gray-800 border-gray-600 text-white focus:ring-blue-500"
            : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
        )}
      />
      <button
        type="submit"
        disabled={disabled || isLoading || !text.trim()}
        className={cn(
          "px-4 py-3 rounded-lg min-h-[48px] font-medium flex items-center gap-2",
          "transition-colors",
          isDarkMode
            ? "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            : "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        )}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>Send</span>
          </>
        )}
      </button>
    </form>
  );
}
