"use client";

import { useMemo } from "react";
import {
  Bot,
  User,
  FileText,
  Search,
  Copy,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: string[];
  tools?: string[];
  queryResults?: string[];
  documentsFound?: {
    count: number;
    similarity: number;
    snippets?: Array<{ title: string; content: string; score: number }>;
  };
  isThinking?: boolean;
}

interface VirtualizedMessageListProps {
  messages: Message[];
  onToggleSnippets: (messageId: string) => void;
  openSnippets: string | null;
  onCopyMessage: (content: string) => void;
}

/**
 * Optimized message list component
 * Uses React.memo and useMemo to prevent unnecessary re-renders
 * For 1000+ messages, consider implementing true virtualization with a simpler library
 */
export function VirtualizedMessageList({
  messages,
  onToggleSnippets,
  openSnippets,
  onCopyMessage,
}: VirtualizedMessageListProps) {
  const renderMessages = useMemo(() => {
    return messages.map((message) => {
      const isAssistant = message.type === "assistant";

      return (
        <div
          key={message.id}
          className={`px-4 py-3 ${isAssistant ? "bg-gray-50" : "bg-white"} border-b`}
        >
          <div
            className={cn(
              "flex gap-3",
              message.type === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.type === "assistant" && (
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-6 h-6 text-primary-foreground" />
              </div>
            )}

            <div
              className={cn(
                "max-w-3xl",
                message.type === "user" ? "order-2" : ""
              )}
            >
              <div
                className={cn(
                  "rounded-xl p-5 shadow-sm",
                  message.type === "user"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "card"
                )}
              >
                {/* Documents Found Badge */}
                {message.type === "assistant" && message.documentsFound && (
                  <div className="mb-4 bg-success/5 border border-success/20 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-success p-2.5 rounded-lg">
                        <FileText className="w-5 h-5 text-success-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-success-foreground">
                          Found {message.documentsFound.count} related documents
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex-1 bg-success/20 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-success h-full rounded-full transition-all"
                              style={{
                                width: `${message.documentsFound.similarity * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium text-success-foreground">
                            {(
                              message.documentsFound.similarity * 100
                            ).toFixed(0)}
                            %
                          </span>
                        </div>
                      </div>
                      {message.documentsFound.snippets &&
                        message.documentsFound.snippets.length > 0 && (
                          <button
                            onClick={() => onToggleSnippets(message.id)}
                            className={cn(
                              "text-xs font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-2 flex-shrink-0",
                              openSnippets === message.id
                                ? "text-success-foreground bg-success/20"
                                : "text-success bg-success/10"
                            )}
                          >
                            <Search className="w-3.5 h-3.5" />
                            {openSnippets === message.id ? "Hide" : "View"}
                          </button>
                        )}
                    </div>

                    {/* Snippets */}
                    {message.documentsFound.snippets &&
                      message.documentsFound.snippets.length > 0 &&
                      openSnippets === message.id && (
                        <div className="mt-3 bg-white border border-green-200 rounded-lg p-3 max-h-64 overflow-y-auto">
                          <div className="space-y-2">
                            {message.documentsFound.snippets.map((snippet, i) => (
                              <div
                                key={i}
                                className="p-2 bg-green-50 rounded border border-green-100 text-xs"
                              >
                                <div className="flex items-start gap-2 mb-1">
                                  <span className="font-semibold text-green-600">
                                    {i + 1}. {snippet.title}
                                  </span>
                                  <span className="text-green-600 font-bold">
                                    {(snippet.score * 100).toFixed(0)}%
                                  </span>
                                </div>
                                <p className="text-gray-700 line-clamp-2">
                                  {snippet.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* Content */}
                <p className="whitespace-pre-wrap text-base leading-relaxed">
                  {message.content}
                </p>

                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground font-medium mb-3">
                      Sources:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {message.sources.map((source, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-muted text-muted-foreground rounded-md text-sm font-medium"
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div
                className={cn(
                  "flex items-center gap-2 mt-2 text-xs text-gray-500",
                  message.type === "user" ? "justify-end" : "justify-start"
                )}
              >
                <span>{message.timestamp}</span>
                {message.type === "assistant" && (
                  <>
                    <button
                      onClick={() => onCopyMessage(message.content)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Copy"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Good"
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </button>
                    <button
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Bad"
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {message.type === "user" && (
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0 order-2">
                <User className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      );
    });
  }, [messages, onToggleSnippets, openSnippets, onCopyMessage]);

  return <div className="overflow-y-auto h-full">{renderMessages}</div>;
}
