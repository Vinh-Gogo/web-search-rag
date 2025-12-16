"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Paperclip,
  Bot,
  User,
  Copy,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  Search,
  FileText,
  Eye,
  EyeOff,
  Database,
  MessageCircle,
  Bug,
  Wrench,
  Zap,
  Settings,
  Mic,
  Moon,
  Sun,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  Loader2,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { AsyncStatusIndicator } from "@/components/AsyncStatusIndicator";
import { useBreakpoint } from "@/hooks/useMediaQuery";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

type Theme = "light" | "dark";
type TabType = "chat" | "debug" | "tools";
type MessageType = "thinking" | "completed" | "error";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: string[];
  tools?: string[];
  queryResults?: string[]; // RAG/Database search results
  documentsFound?: {
    count: number;
    similarity: number;
    snippets?: Array<{
      id: string;
      title: string;
      content: string;
      score: number;
      url?: string;
      date?: string;
    }>;
  }; // Document search stats
  isThinking?: boolean;
  messageType?: MessageType;
  reaction?: "like" | "dislike" | null;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "available" | "active" | "error";
  category: "search" | "analysis" | "processing" | "utility";
}

// Tools sidebar component (enhanced with modern Qwen/ChatGPT style)
interface ToolsSidebarProps {
  availableTools: Tool[];
  theme: Theme;
  onToolSelect?: (toolId: string) => void;
}

const ToolsSidebar: React.FC<ToolsSidebarProps> = ({
  availableTools,
  theme,
  onToolSelect,
}) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
    className={cn(
      "w-80 border-l transition-colors",
      theme === "dark"
        ? "bg-gray-900 border-gray-800"
        : "bg-white border-gray-200"
    )}
  >
    {/* Tools Header */}
    <div
      className={cn(
        "p-4 border-b transition-colors",
        theme === "dark" ? "border-gray-800" : "border-gray-200"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h3
          className={cn(
            "text-lg font-bold flex items-center gap-2",
            theme === "dark" ? "text-white" : "text-gray-900"
          )}
        >
          <Sparkles className="w-5 h-5 text-blue-500" />
          AI Tools
        </h3>
        <div
          className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            theme === "dark"
              ? "bg-blue-900/50 text-blue-300 border border-blue-900"
              : "bg-blue-50 text-blue-700 border border-blue-100"
          )}
        >
          {availableTools.filter((tool) => tool.status === "active").length}{" "}
          Active
        </div>
      </div>
      <p
        className={cn(
          "text-sm transition-colors",
          theme === "dark" ? "text-gray-400" : "text-gray-600"
        )}
      >
        {availableTools.length} tools available for document processing and
        analysis
      </p>
    </div>

    {/* Tools Categories */}
    <div className="p-4 space-y-6">
      {["search", "analysis", "processing", "utility"].map((category) => {
        const categoryTools = availableTools.filter(
          (tool) => tool.category === category
        );
        if (categoryTools.length === 0) return null;

        const categoryNames = {
          search: "Search Tools",
          analysis: "Analysis Tools",
          processing: "Processing Tools",
          utility: "Utility Tools",
        };

        const categoryIcons = {
          search: Search,
          analysis: FileText,
          processing: Database,
          utility: Wrench,
        };

        const CategoryIcon =
          categoryIcons[category as keyof typeof categoryIcons];

        return (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              <CategoryIcon
                className={cn(
                  "w-4 h-4",
                  theme === "dark" ? "text-blue-400" : "text-blue-600"
                )}
              />
              <h4
                className={cn(
                  "font-semibold text-sm uppercase tracking-wider",
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                )}
              >
                {categoryNames[category as keyof typeof categoryNames]}
              </h4>
            </div>

            <div className="space-y-2">
              {categoryTools.map((tool) => (
                <motion.button
                  key={tool.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onToolSelect?.(tool.id)}
                  className={cn(
                    "w-full p-3 rounded-xl border transition-all duration-200",
                    tool.status === "active"
                      ? theme === "dark"
                        ? "border-blue-800/50 bg-blue-900/20 hover:bg-blue-900/30"
                        : "border-blue-200 bg-blue-50 hover:bg-blue-100"
                      : tool.status === "error"
                        ? theme === "dark"
                          ? "border-red-800/50 bg-red-900/20 hover:bg-red-900/30"
                          : "border-red-200 bg-red-50 hover:bg-red-100"
                        : theme === "dark"
                          ? "border-gray-800 hover:border-gray-700 bg-gray-800/50 hover:bg-gray-800"
                          : "border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg flex-shrink-0",
                        tool.status === "active"
                          ? theme === "dark"
                            ? "bg-blue-900/70 text-blue-300"
                            : "bg-blue-100 text-blue-700"
                          : tool.status === "error"
                            ? theme === "dark"
                              ? "bg-red-900/70 text-red-300"
                              : "bg-red-100 text-red-700"
                            : theme === "dark"
                              ? "bg-gray-800 text-gray-300"
                              : "bg-gray-100 text-gray-700"
                      )}
                    >
                      {tool.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4
                          className={cn(
                            "font-medium truncate",
                            theme === "dark" ? "text-white" : "text-gray-900"
                          )}
                        >
                          {tool.name}
                        </h4>
                        <div
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ml-2",
                            tool.status === "active"
                              ? theme === "dark"
                                ? "bg-green-900/50 text-green-300 border border-green-900"
                                : "bg-green-100 text-green-800 border border-green-200"
                              : tool.status === "error"
                                ? theme === "dark"
                                  ? "bg-red-900/50 text-red-300 border border-red-900"
                                  : "bg-red-100 text-red-800 border border-red-200"
                                : theme === "dark"
                                  ? "bg-gray-800 text-gray-300 border border-gray-700"
                                  : "bg-gray-100 text-gray-800 border border-gray-200"
                          )}
                        >
                          {tool.status === "active"
                            ? "Active"
                            : tool.status === "error"
                              ? "Error"
                              : "Available"}
                        </div>
                      </div>
                      <p
                        className={cn(
                          "text-sm mt-1 line-clamp-2",
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        )}
                      >
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </motion.div>
);

// Message component with modern design
interface MessageProps {
  message: Message;
  theme: Theme;
  onCopy: (content: string) => void;
  onReaction: (messageId: string, reaction: "like" | "dislike") => void;
  onShowSnippets: (messageId: string) => void;
  openSnippets: string | null;
  showToolCalls: boolean;
  onToggleDebugSection?: (
    messageId: string,
    section: "queryResults" | "tools"
  ) => void;
  openDebugSections?: Record<
    string,
    { queryResults?: boolean; tools?: boolean }
  >;
}

const Message: React.FC<MessageProps> = ({
  message,
  theme,
  onCopy,
  onReaction,
  onShowSnippets,
  openSnippets,
  showToolCalls,
  onToggleDebugSection,
  openDebugSections,
}) => {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleCopy = async () => {
    await onCopy(message.content);
    setCopied(true);
    toast.success("Message copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-4 group m-2",
        message.type === "user" ? "justify-end ml-12" : "justify-start"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {message.type === "assistant" && (
        <div
          className={cn(
            "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0",
            theme === "dark" ? "bg-blue-900/50" : "bg-blue-600"
          )}
        >
          <Bot
            className={cn(
              "w-6 h-6",
              theme === "dark" ? "text-blue-300" : "text-white"
            )}
          />
        </div>
      )}

      <div
        className={cn(
          "flex flex-col items-start max-w-[85%] sm:max-w-[70%]",
          message.type === "user" && "items-end self-end"
        )}
      >
        {/* Message bubble */}
        <div
          className={cn(
            "w-full rounded-2xl transition-all duration-300",
            message.type === "user"
              ? "px-5 py-3" // User messages: compact padding
              : "px-6 py-5", // Assistant messages: more generous padding
            message.type === "user"
              ? theme === "dark"
                ? "bg-blue-900/60 text-white rounded-tr-none border border-blue-800/50"
                : "bg-blue-600 text-white rounded-tr-none border border-blue-700"
              : theme === "dark"
                ? "bg-gray-800/80 text-gray-200 border border-gray-700/50 rounded-tl-none hover:border-gray-700/80"
                : "bg-white text-gray-900 border border-gray-200 rounded-tl-none hover:border-gray-300"
          )}
        >
          {/* Documents Found Badge - Only show for assistant messages with documents */}
          {message.type === "assistant" && message.documentsFound && (
            <div
              className={cn(
                "mb-5 p-4 rounded-xl transition-colors",
                theme === "dark"
                  ? "bg-green-900/30 border border-green-800/50"
                  : "bg-green-50 border border-green-200"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-xl",
                    theme === "dark" ? "bg-green-900/50" : "bg-green-100"
                  )}
                >
                  <FileText
                    className={cn(
                      "w-5 h-5",
                      theme === "dark" ? "text-green-400" : "text-green-600"
                    )}
                  />
                </div>
                <div className="flex-1">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      theme === "dark" ? "text-green-300" : "text-green-800"
                    )}
                  >
                    Found {message.documentsFound.count} relevant document
                    {message.documentsFound.count !== 1 ? "s" : ""}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 bg-green-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          theme === "dark" ? "bg-green-500" : "bg-green-600"
                        )}
                        style={{
                          width: `${message.documentsFound.similarity * 100}%`,
                        }}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium whitespace-nowrap",
                        theme === "dark" ? "text-green-300" : "text-green-700"
                      )}
                    >
                      {(message.documentsFound.similarity * 100).toFixed(0)}%
                      relevance
                    </span>
                  </div>
                </div>
                {message.documentsFound.snippets && (
                  <button
                    onClick={() => onShowSnippets(message.id)}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors flex items-center gap-1.5",
                      theme === "dark"
                        ? openSnippets === message.id
                          ? "bg-green-900 text-green-300"
                          : "text-green-400 hover:bg-green-900/30"
                        : openSnippets === message.id
                          ? "bg-green-100 text-green-800"
                          : "text-green-700 hover:bg-green-100"
                    )}
                    title={
                      openSnippets === message.id
                        ? "Hide document content"
                        : "View relevant document snippets"
                    }
                  >
                    {openSnippets === message.id ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {/* Click Popup - Document Content */}
              {message.documentsFound.snippets &&
                openSnippets === message.id && (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={cn(
                        "mt-3 p-3 rounded-xl max-h-96 overflow-y-auto border",
                        theme === "dark"
                          ? "bg-gray-800/50 border-gray-700"
                          : "bg-gray-50 border-gray-200"
                      )}
                    >
                      <div className="space-y-3">
                        {message.documentsFound.snippets.map((snippet) => (
                          <div
                            key={snippet.id}
                            className={cn(
                              "p-3 rounded-lg transition-all border",
                              theme === "dark"
                                ? "bg-gray-800/30 border-gray-700 hover:border-green-700/50"
                                : "bg-white border-gray-200 hover:border-green-200"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-start gap-2 flex-1">
                                <div
                                  className={cn(
                                    "mt-0.5 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0",
                                    theme === "dark"
                                      ? "bg-green-600"
                                      : "bg-green-500"
                                  )}
                                >
                                  {Math.round(snippet.score * 100)}%
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h5
                                    className={cn(
                                      "text-sm font-semibold truncate",
                                      theme === "dark"
                                        ? "text-gray-200"
                                        : "text-gray-800"
                                    )}
                                  >
                                    {snippet.title}
                                  </h5>
                                  {snippet.date && (
                                    <p
                                      className={cn(
                                        "text-xs mt-0.5",
                                        theme === "dark"
                                          ? "text-gray-500"
                                          : "text-gray-500"
                                      )}
                                    >
                                      {snippet.date}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <p
                              className={cn(
                                "text-sm leading-relaxed",
                                theme === "dark"
                                  ? "text-gray-300"
                                  : "text-gray-700"
                              )}
                            >
                              {snippet.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}
            </div>
          )}

          {/* Message content */}
          <div
            className={cn(
              "whitespace-pre-wrap text-base leading-relaxed",
              message.type === "user"
                ? "text-white"
                : theme === "dark"
                  ? "text-gray-200"
                  : "text-gray-900",
              message.type === "assistant" ? "my-2" : "my-1"
            )}
          >
            {message.content}
          </div>

          {/* RAG Query Results — Improved Debug UI */}
          {showToolCalls &&
            message.queryResults &&
            message.queryResults.length > 0 && (
              <DebugSection
                title="RAG Query Results"
                icon={<Database className="w-4 h-4" />}
                theme={theme}
                isOpen={openDebugSections?.[message.id]?.queryResults ?? true}
                onToggle={() =>
                  onToggleDebugSection?.(message.id, "queryResults")
                }
              >
                <div className="space-y-2">
                  {message.queryResults.map((result, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-2 rounded-lg font-mono text-sm bg-opacity-50 border border-dashed",
                        theme === "dark"
                          ? "bg-purple-900/30 text-purple-200 border-purple-700/50"
                          : "bg-purple-50 text-purple-800 border-purple-200"
                      )}
                    >
                      {result}
                    </div>
                  ))}
                </div>
              </DebugSection>
            )}

          {/* Tools Used — Improved Debug UI */}
          {showToolCalls && message.tools && message.tools.length > 0 && (
            <DebugSection
              title="Tools Used"
              icon={<Zap className="w-4 h-4" />}
              theme={theme}
              isOpen={openDebugSections?.[message.id]?.tools ?? true}
              onToggle={() => onToggleDebugSection?.(message.id, "tools")}
            >
              <div className="flex flex-wrap gap-2">
                {message.tools.map((tool, index) => (
                  <span
                    key={index}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all duration-200",
                      theme === "dark"
                        ? "bg-blue-900/50 text-blue-300 border border-blue-800 hover:bg-blue-900"
                        : "bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200"
                    )}
                  >
                    <Zap className="w-3 h-3" />
                    {tool}
                  </span>
                ))}
              </div>
            </DebugSection>
          )}


        </div>

        {/* Message footer */}
        <div
          className={cn(
            "flex items-center gap-2 mt-2 px-1 text-xs",
            message.type === "user" ? "justify-end" : "justify-start",
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          )}
        >
          <span>{message.timestamp}</span>
          {message.type === "assistant" && (
            <div className="flex items-center gap-2 ml-2 transition-opacity duration-300">
              <button
                onClick={handleCopy}
                className={cn(
                  "p-1 rounded-lg transition-colors hover:bg-opacity-20",
                  copied
                    ? theme === "dark"
                      ? "text-green-400 bg-green-900/30"
                      : "text-green-600 bg-green-100"
                    : theme === "dark"
                      ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                )}
                title={copied ? "Copied!" : "Copy message"}
              >
                {copied ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={() => onReaction(message.id, "like")}
                className={cn(
                  "p-1 rounded-lg transition-colors",
                  message.reaction === "like"
                    ? theme === "dark"
                      ? "text-blue-400 bg-blue-900/30"
                      : "text-blue-600 bg-blue-100"
                    : theme === "dark"
                      ? "text-gray-400 hover:text-blue-400 hover:bg-blue-900/20"
                      : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                )}
                title="Good response"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onReaction(message.id, "dislike")}
                className={cn(
                  "p-1 rounded-lg transition-colors",
                  message.reaction === "dislike"
                    ? theme === "dark"
                      ? "text-red-400 bg-red-900/30"
                      : "text-red-600 bg-red-100"
                    : theme === "dark"
                      ? "text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                      : "text-gray-500 hover:text-red-600 hover:bg-red-50"
                )}
                title="Bad response"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {message.type === "user" && (
        <div
          className={cn(
            "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0",
            theme === "dark" ? "bg-gray-700" : "bg-gray-600"
          )}
        >
          <User
            className={cn(
              "w-6 h-6",
              theme === "dark" ? "text-gray-300" : "text-white"
            )}
          />
        </div>
      )}
    </motion.div>
  );
};

// Input area with modern design
interface InputAreaProps {
  inputMessage: string;
  isTyping: boolean;
  attachedFiles: File[];
  theme: Theme;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onFileAttachment: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  onToggleToolCalls: () => void;
  showToolCalls: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({
  inputMessage,
  isTyping,
  attachedFiles,
  theme,
  onInputChange,
  onSendMessage,
  onFileAttachment,
  onRemoveFile,
  onToggleToolCalls,
  showToolCalls,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={cn(
        "border-t p-4 flex-shrink-0 transition-colors",
        theme === "dark"
          ? "border-gray-800 bg-gray-900"
          : "border-gray-200 bg-white"
      )}
    >
      {/* Attached Files */}
      {attachedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachedFiles.map((file, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1 transition-colors",
                theme === "dark"
                  ? "bg-gray-800/50 border border-gray-700"
                  : "bg-gray-100 border border-gray-200"
              )}
            >
              <Paperclip
                className={cn(
                  "w-4 h-4 flex-shrink-0",
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                )}
              />
              <span
                className={cn(
                  "text-sm truncate max-w-[150px]",
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                )}
              >
                {file.name}
              </span>
              <button
                onClick={() => onRemoveFile(index)}
                className={cn(
                  "text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full transition-colors",
                  theme === "dark"
                    ? "text-gray-400 hover:text-red-400 hover:bg-red-900/30"
                    : "text-gray-500 hover:text-red-600 hover:bg-red-50"
                )}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" &&
              !e.shiftKey &&
              (e.preventDefault(), onSendMessage())
            }
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Message AI Agent..."
            className={cn(
              "w-full p-4 pr-12 rounded-xl resize-none transition-all duration-300",
              isFocused || inputMessage
                ? theme === "dark"
                  ? "border-blue-500/50 bg-gray-800/50"
                  : "border-blue-500 bg-blue-50"
                : theme === "dark"
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-300 bg-gray-50",
              "focus:outline-none focus:ring-0 min-h-[56px] max-h-[200px]"
            )}
            rows={1}
          />
          {inputMessage && (
            <button
              onClick={() => onInputChange("")}
              className={cn(
                "absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors",
                theme === "dark"
                  ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              )}
              title="Clear message"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={onFileAttachment}
              className="hidden"
              accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "p-3 rounded-xl transition-all duration-200 hover:scale-105",
                theme === "dark"
                  ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800 border border-gray-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-200"
              )}
              title="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <button
              className={cn(
                "p-3 rounded-xl transition-all duration-200 hover:scale-105",
                theme === "dark"
                  ? "text-gray-400 hover:text-green-400 hover:bg-gray-800 border border-gray-700"
                  : "text-gray-500 hover:text-green-600 hover:bg-gray-100 border border-gray-200"
              )}
              title="Voice input"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={onSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className={cn(
              "p-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:opacity-50",
              isTyping
                ? theme === "dark"
                  ? "bg-blue-900/70 border border-blue-800"
                  : "bg-blue-100 border border-blue-200"
                : theme === "dark"
                  ? "bg-blue-900 hover:bg-blue-800 border border-blue-700"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
            )}
          >
            {isTyping ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Header with modern design
interface ChatHeaderProps {
  theme: Theme;
  onThemeToggle: () => void;
  onToggleToolCalls: () => void;
  showToolCalls: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  theme,
  onThemeToggle,
  onToggleToolCalls,
  showToolCalls,
}) => {
  return (
    <div
      className={cn(
        "border-b p-4 transition-colors relative z-20",
        theme === "dark"
          ? "border-gray-800 bg-gray-900"
          : "border-gray-200 bg-white"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center",
              theme === "dark" ? "bg-blue-900/70" : "bg-blue-600"
            )}
          >
            <Bot
              className={cn(
                "w-7 h-7",
                theme === "dark" ? "text-blue-300" : "text-white"
              )}
            />
          </div>
          <div>
            <h1
              className={cn(
                "text-xl font-bold",
                theme === "dark" ? "text-white" : "text-gray-900"
              )}
            >
              RAG Platform
            </h1>
            <p
              className={cn(
                "text-sm font-medium",
                theme === "dark" ? "text-blue-300" : "text-blue-600"
              )}
            >
              Web Search & AI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleToolCalls}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border-2 transform hover:scale-[1.02]",
              showToolCalls
                ? theme === "dark"
                  ? "bg-purple-900 text-purple-200 border-purple-700 shadow-lg shadow-purple-900/30"
                  : "bg-purple-100 text-purple-800 border-purple-300 shadow-lg shadow-purple-200/30"
                : theme === "dark"
                  ? "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
            )}
            aria-pressed={showToolCalls}
            title={showToolCalls ? "Exit debug mode" : "Enter debug mode"}
          >
            {showToolCalls ? (
              <>
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Debug View</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                <span className="hidden sm:inline">Debug View</span>
              </>
            )}
          </button>

          <button
            onClick={onThemeToggle}
            className={cn(
              "p-2.5 rounded-xl transition-colors",
              theme === "dark"
                ? "text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200"
            )}
            title={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          <button
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors border",
              theme === "dark"
                ? "text-green-400 border-green-800/50 hover:bg-green-900/30"
                : "text-green-700 border-green-200 hover:bg-green-50"
            )}
          >
            <div
              className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                theme === "dark" ? "bg-green-500" : "bg-green-500"
              )}
            />
            <span>Online</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Debug Badge component - shows when debug mode is active
interface DebugBadgeProps {
  showToolCalls: boolean;
  theme: Theme;
}

const DebugBadge: React.FC<DebugBadgeProps> = ({ showToolCalls, theme }) => {
  return (
    <AnimatePresence>
      {showToolCalls && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          suppressHydrationWarning={true}
          className={cn(
            "absolute top-3 right-3 z-10 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border shadow-lg",
            theme === "dark"
              ? "bg-purple-900/90 text-purple-100 border-purple-700 shadow-purple-900/50"
              : "bg-purple-100 text-purple-900 border-purple-300 shadow-purple-200/50"
          )}
        >
          <Zap className="w-3.5 h-3.5 animate-pulse" />
          <span className="font-extrabold tracking-wide">DEBUG MODE</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Expandable Debug Section component
interface DebugSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  theme: Theme;
  isOpen?: boolean;
  onToggle?: () => void;
}

const DebugSection: React.FC<DebugSectionProps> = ({
  title,
  icon,
  children,
  theme,
  isOpen = true,
  onToggle,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{
        opacity: isOpen ? 1 : 0,
        height: isOpen ? "auto" : 0,
      }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      <div
        className={cn(
          "mb-4 mt-2 m-2 rounded-xl border transition-all duration-300",
          theme === "dark"
            ? "border-gray-700 bg-gray-800/40 hover:border-purple-800/50"
            : "border-gray-200 bg-gray-50/50 hover:border-purple-200"
        )}
      >
        <button
          onClick={onToggle}
          className={cn(
            "flex m-2 items-center justify-between w-full p-3 text-left font-medium transition-colors",
            theme === "dark"
              ? "text-purple-300 hover:text-purple-200"
              : "text-purple-800 hover:text-purple-900"
          )}
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2">
            {icon}
            <span>{title}</span>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-purple-500"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </button>
        {isOpen && (
          <div
            className={cn(
              "p-4 m-2 border-t transition-colors",
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            )}
          >
            {children}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Snippet popup with modern design
interface SnippetPopupProps {
  theme: Theme;
  documents: Message["documentsFound"];
  isOpen: boolean;
  onClose: () => void;
}

const SnippetPopup: React.FC<SnippetPopupProps> = ({
  theme,
  documents,
  isOpen,
  onClose,
}) => {
  if (!documents?.snippets || documents.snippets.length === 0 || !isOpen)
    return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 m-2",
        theme === "dark"
          ? "bg-black/50 backdrop-blur-sm"
          : "bg-black/30 backdrop-blur-sm"
      )}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={cn(
          "w-full max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border",
          theme === "dark"
            ? "bg-gray-900 border-gray-800"
            : "bg-white border-gray-200"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={cn(
            "p-4 m-2 border-b flex items-center justify-between",
            theme === "dark" ? "border-gray-800" : "border-gray-200"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-xl",
                theme === "dark" ? "bg-green-900/50" : "bg-green-100"
              )}
            >
              <FileText
                className={cn(
                  "w-5 h-5",
                  theme === "dark" ? "text-green-400" : "text-green-600"
                )}
              />
            </div>
            <h3
              className={cn(
                "text-lg font-bold",
                theme === "dark" ? "text-white" : "text-gray-900"
              )}
            >
              Document Content
            </h3>
          </div>
          <button
            onClick={onClose}
            className={cn(
              "p-2 rounded-lg transition-colors",
              theme === "dark"
                ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div
          className={cn(
            "p-4 m-2 overflow-y-auto max-h-[60vh]",
            theme === "dark"
              ? "scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800"
              : "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          )}
        >
          <div className="space-y-4">
            {documents.snippets.map((snippet, index) => (
              <div
                key={snippet.id}
                className={cn(
                  "p-4 rounded-xl border transition-all",
                  theme === "dark"
                    ? "bg-gray-800/50 border-gray-700 hover:border-green-800/50"
                    : "bg-gray-50 border-gray-200 hover:border-green-200"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-start gap-2 flex-1">
                    <div
                      className={cn(
                        "mt-1 bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-[10px]",
                        theme === "dark" ? "bg-green-600" : "bg-green-500"
                      )}
                    >
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5
                        className={cn(
                          "text-sm font-semibold truncate",
                          theme === "dark" ? "text-gray-200" : "text-gray-800"
                        )}
                      >
                        {snippet.title}
                      </h5>
                      {snippet.date && (
                        <p
                          className={cn(
                            "text-xs mt-0.5",
                            theme === "dark" ? "text-gray-500" : "text-gray-500"
                          )}
                        >
                          {snippet.date}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap",
                      theme === "dark"
                        ? "bg-green-900/50 text-green-300 border border-green-800"
                        : "bg-green-100 text-green-800 border border-green-200"
                    )}
                  >
                    {(snippet.score * 100).toFixed(0)}% relevance
                  </span>
                </div>
                <p
                  className={cn(
                    "text-sm leading-relaxed",
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  )}
                >
                  {snippet.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className={cn(
            "p-4 border-t flex justify-between items-center",
            theme === "dark" ? "border-gray-800" : "border-gray-200"
          )}
        >
          <p
            className={cn(
              "text-sm font-medium",
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}
          >
            {documents.snippets.length} document
            {documents.snippets.length !== 1 ? "s" : ""} found
          </p>
          <button
            onClick={onClose}
            className={cn(
              "px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2",
              theme === "dark"
                ? "bg-blue-900 text-blue-300 hover:bg-blue-800 border border-blue-800"
                : "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            <span>Close</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function AIChat() {
  const breakpoint = useBreakpoint();
  const isDesktop = breakpoint === "desktop";
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as Theme) || "light";
    }
    return "light";
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Xin chào! Tôi là AI Agent của hệ thống RAG. Tôi có thể giúp bạn tìm kiếm thông tin từ các tài liệu đã được xử lý, phân tích dữ liệu, và trả lời các câu hỏi về kinh tế Việt Nam. Bạn có thể hỏi tôi bất cứ điều gì!",
      timestamp: "20:40:00",
      tools: ["RAG Search", "Document Analysis"],
      documentsFound: {
        count: 1247,
        similarity: 1.0,
        snippets: [
          {
            id: "doc1",
            title: "Tổng quan hệ thống",
            content:
              "Hệ thống RAG đã được khởi tạo với 1,247 tài liệu về kinh tế Việt Nam. Cơ sở dữ liệu vector embeddings đã sẵn sàng để xử lý các truy vấn ngữ nghĩa với độ chính xác cao.",
            score: 1.0,
            date: "Dec 15, 2025",
          },
        ],
      },
      queryResults: [
        "System initialized with 1,247 documents",
        "RAG database ready with embeddings",
        "Vietnamese language support active",
      ],
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [showToolCalls, setShowToolCalls] = useState(true);
  const [openSnippets, setOpenSnippets] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(isDesktop);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [openDebugSections, setOpenDebugSections] = useState<
    Record<string, { queryResults?: boolean; tools?: boolean }>
  >({});

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const toggleToolCalls = () => {
    setShowToolCalls((prev) => !prev);
  };

  const toggleSnippets = (messageId: string) => {
    setOpenSnippets((prev) => (prev === messageId ? null : messageId));
  };

  const closeSnippets = () => {
    setOpenSnippets(null);
  };

  const toggleDebugSection = useCallback(
    (messageId: string, section: "queryResults" | "tools") => {
      setOpenDebugSections((prev) => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          [section]: !prev[messageId]?.[section],
        },
      }));
    },
    []
  );

  const [availableTools] = useState<Tool[]>([
    {
      id: "rag-search",
      name: "RAG Search",
      description:
        "Tìm kiếm thông tin trong cơ sở dữ liệu tài liệu với độ chính xác ngữ nghĩa cao",
      icon: <Search className="w-5 h-5" />,
      status: "active",
      category: "search",
    },
    {
      id: "document-analysis",
      name: "Document Analysis",
      description:
        "Phân tích và tóm tắt nội dung tài liệu PDF, Word, và các định dạng văn bản",
      icon: <FileText className="w-5 h-5" />,
      status: "active",
      category: "analysis",
    },
    {
      id: "web-crawl",
      name: "Web Crawl",
      description:
        "Thu thập dữ liệu từ các trang web và lưu vào cơ sở dữ liệu RAG",
      icon: <Database className="w-5 h-5" />,
      status: "available",
      category: "processing",
    },
    {
      id: "image-analysis",
      name: "Image Analysis",
      description:
        "Phân tích nội dung hình ảnh và trích xuất thông tin văn bản",
      icon: <FileText className="w-5 h-5" />,
      status: "available",
      category: "analysis",
    },
    {
      id: "data-visualization",
      name: "Data Visualization",
      description: "Tạo biểu đồ và hình ảnh trực quan từ dữ liệu đã phân tích",
      icon: <Zap className="w-5 h-5" />,
      status: "available",
      category: "utility",
    },
    {
      id: "sentiment-analysis",
      name: "Sentiment Analysis",
      description: "Phân tích cảm xúc và xu hướng từ văn bản tiếng Việt",
      icon: <MessageCircle className="w-5 h-5" />,
      status: "error",
      category: "analysis",
    },
  ]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const timestamp = new Date();
    const timeString = timestamp.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const userMessage: Message = {
      id: `user-${timestamp.getTime()}`,
      type: "user",
      content: inputMessage,
      timestamp: timeString,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Add thinking message
    setMessages((prev) => [
      ...prev,
      {
        id: `thinking-${timestamp.getTime()}`,
        type: "assistant",
        content: "",
        timestamp: timeString,
        isThinking: true,
        messageType: "thinking",
      },
    ]);

    // Simulate AI response
    setTimeout(() => {
      const responseTime = new Date();
      const responseTimeString = responseTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const aiResponse: Message = {
        id: `assistant-${responseTime.getTime()}`,
        documentsFound: {
          count: 2,
          similarity: 0.92,
          snippets: [
            {
              id: "doc2",
              title: "ban-tin-biwase-thang-11-nam-2025.pdf",
              content:
                "Bản tin Biwase tháng 11/2025: Tổng quan tình hình kinh tế Việt Nam quý 3/2025 cho thấy sự phục hồi mạnh mẽ. Ngành xuất khẩu điện tử đạt kim ngạch 45.2 tỷ USD, tăng 12.3% so với cùng kỳ năm trước. Ngành dệt may ghi nhận mức tăng trưởng 8.5% với tổng kim ngạch đạt 28.7 tỷ USD. Đặc biệt, lĩnh vực sản xuất smartphone và linh kiện bán dẫn tiếp tục dẫn đầu với đơn hàng mới từ các tập đoàn công nghệ quốc tế.",
              score: 0.95,
              date: "Nov 15, 2025",
            },
            {
              id: "doc3",
              title: "bao-cao-kinh-te-q3-2025.pdf",
              content:
                "Báo cáo kinh tế quý 3 năm 2025: GDP Việt Nam đạt mức tăng trưởng ấn tượng 6.8% so với cùng kỳ năm 2024. Các yếu tố thúc đẩy chính bao gồm: (1) Xuất khẩu tăng mạnh trong các ngành điện tử, dệt may, và thủy sản; (2) Tiêu dùng nội địa phục hồi với chỉ số tin cậy người tiêu dùng tăng 15 điểm; (3) Đầu tư FDI tăng 15.8% so với cùng kỳ. Lạm phát được kiểm soát ở mức 3.2%, nằm trong mục tiêu của Chính phủ.",
              score: 0.92,
              date: "Oct 30, 2025",
            },
          ],
        },
        queryResults: [
          "Database query: economic Vietnam Q3 2025",
          "Found 2 relevant documents (similarity: 0.92)",
          "Retrieved: GDP growth data, export statistics, consumption trends",
          "Context window: 2,048 tokens",
        ],
        type: "assistant",
        content:
          "Dựa trên thông tin từ các tài liệu phân tích, tình hình kinh tế Việt Nam trong quý 3 năm 2025 cho thấy những dấu hiệu tích cực. GDP tăng trưởng 6.8% so với cùng kỳ năm trước, được thúc đẩy bởi xuất khẩu mạnh mẽ, đặc biệt trong lĩnh vực điện tử và dệt may, cùng với việc tiêu dùng trong nước tăng cao.",
        timestamp: responseTimeString,
        sources: [
          "ban-tin-biwase-thang-11-nam-2025.pdf",
          "bao-cao-kinh-te-q3-2025.pdf",
        ],
        tools: ["RAG Search", "Document Analysis"],
        messageType: "completed",
      };

      // Remove thinking message and add real response
      setMessages((prev) => prev.filter((msg) => !msg.isThinking));
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2500);
  };

  const handleFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles((prev) => [...prev, ...newFiles]);
      toast.success(
        `${newFiles.length} file${newFiles.length > 1 ? "s" : ""} attached successfully`
      );
    }
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const copyMessage = async (content: string) => {
    await navigator.clipboard.writeText(content);
  };

  const handleReaction = (messageId: string, reaction: "like" | "dislike") => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, reaction: msg.reaction === reaction ? null : reaction }
          : msg
      )
    );

    toast.success(
      `Feedback recorded: ${reaction === "like" ? "Positive" : "Negative"} response`
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className={cn(
        "flex h-screen overflow-hidden bg-gradient-to-br transition-colors duration-300",
        theme === "dark"
          ? "from-gray-900 via-blue-900/20 to-purple-900/10"
          : "from-gray-50 via-blue-50/30 to-purple-50/20"
      )}
    >
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && !isDesktop && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 relative",
          !isDesktop && isSidebarOpen
            ? "translate-x-full opacity-0"
            : "translate-x-0 opacity-100"
        )}
      >
        {/* Debug Badge */}
        <DebugBadge showToolCalls={showToolCalls} theme={theme} />

        <ChatHeader
          theme={theme}
          onThemeToggle={toggleTheme}
          onToggleToolCalls={toggleToolCalls}
          showToolCalls={showToolCalls}
        />

        {/* Messages Area */}
        <div
          className={cn(
            "flex-1 overflow-y-auto p-6 space-y-6",
            theme === "dark"
              ? "scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
              : "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          )}
        >
          {messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              theme={theme}
              onCopy={copyMessage}
              onReaction={handleReaction}
              onShowSnippets={toggleSnippets}
              openSnippets={openSnippets}
              showToolCalls={showToolCalls}
              onToggleDebugSection={toggleDebugSection}
              openDebugSections={openDebugSections}
            />
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0",
                  theme === "dark" ? "bg-blue-900/50" : "bg-blue-600"
                )}
              >
                <Bot
                  className={cn(
                    "w-6 h-6",
                    theme === "dark" ? "text-blue-300" : "text-white"
                  )}
                />
              </div>
              <div
                className={cn(
                  "rounded-2xl px-5 py-4 max-w-[85%] sm:max-w-[70%]",
                  theme === "dark"
                    ? "bg-gray-800/80 border border-gray-700/50"
                    : "bg-white border border-gray-200"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        repeatDelay: 0.2,
                      }}
                      className={cn(
                        "w-2 h-2 rounded-full",
                        theme === "dark" ? "bg-blue-400" : "bg-blue-600"
                      )}
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        repeatDelay: 0.2,
                        delay: 0.2,
                      }}
                      className={cn(
                        "w-2 h-2 rounded-full",
                        theme === "dark" ? "bg-blue-400" : "bg-blue-600"
                      )}
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        repeatDelay: 0.2,
                        delay: 0.4,
                      }}
                      className={cn(
                        "w-2 h-2 rounded-full",
                        theme === "dark" ? "bg-blue-400" : "bg-blue-600"
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    )}
                  >
                    AI Agent is thinking...
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <InputArea
          inputMessage={inputMessage}
          isTyping={isTyping}
          attachedFiles={attachedFiles}
          theme={theme}
          onInputChange={setInputMessage}
          onSendMessage={handleSendMessage}
          onFileAttachment={handleFileAttachment}
          onRemoveFile={removeAttachedFile}
          onToggleToolCalls={toggleToolCalls}
          showToolCalls={showToolCalls}
        />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className={cn(
            "fixed bottom-24 right-8 p-3 rounded-full shadow-lg z-30 transition-all duration-300 transform hover:scale-110",
            theme === "dark"
              ? "bg-blue-900 text-blue-300 hover:bg-blue-800 border border-blue-800"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
          )}
          title="Scroll to bottom"
        >
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </button>
      )}

      {/* Mobile sidebar toggle */}
      {!isDesktop && (
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={cn(
            "fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300",
            theme === "dark"
              ? "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
              : "bg-white text-gray-900 hover:bg-gray-50 border border-gray-200"
          )}
        >
          {isSidebarOpen ? (
            <ChevronRight className="w-6 h-6" />
          ) : (
            <ChevronLeft className="w-6 h-6" />
          )}
        </button>
      )}

      {/* Tools Sidebar - Desktop Only or Mobile when open */}
      {(isDesktop || isSidebarOpen) && (
        <ToolsSidebar availableTools={availableTools} theme={theme} />
      )}

      {/* Snippet Popup */}
      <SnippetPopup
        theme={theme}
        documents={messages.find((m) => m.id === openSnippets)?.documentsFound}
        isOpen={!!openSnippets}
        onClose={closeSnippets}
      />
    </div>
  );
}
