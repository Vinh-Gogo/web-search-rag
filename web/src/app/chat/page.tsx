"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  Bot,
  User,
  Copy,
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { AsyncStatusIndicator } from "@/components/AsyncStatusIndicator";
import { useBreakpoint } from "@/hooks/useMediaQuery";

type TabType = "chat" | "debug" | "tools";

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
    snippets?: Array<{ title: string; content: string; score: number }>;
  }; // Document search stats
  isThinking?: boolean;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "available" | "active" | "error";
}

// Tools sidebar component (extracted for reuse)
interface ToolsSidebarProps {
  availableTools: Tool[];
}

const ToolsSidebar: React.FC<ToolsSidebarProps> = ({ availableTools }) => (
  <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
    {/* Tools Header */}
    <div className="p-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Công cụ AI</h3>
      <p className="text-sm text-gray-600">Các công cụ có sẵn cho AI Agent</p>
    </div>

    {/* Tools List */}
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {availableTools.map((tool) => (
        <div
          key={tool.id}
          className={cn(
            "p-3 rounded-lg border transition-colors",
            tool.status === "active"
              ? "border-green-200 bg-green-50"
              : tool.status === "error"
                ? "border-red-200 bg-red-50"
                : "border-gray-200 bg-gray-50"
          )}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className={cn(
                "p-2 rounded-lg",
                tool.status === "active"
                  ? "bg-green-100 text-green-600"
                  : tool.status === "error"
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-600"
              )}
            >
              {tool.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{tool.name}</h4>
              <div
                className={cn(
                  "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1",
                  tool.status === "active"
                    ? "bg-green-100 text-green-800"
                    : tool.status === "error"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                )}
              >
                {tool.status === "active"
                  ? "Hoạt động"
                  : tool.status === "error"
                    ? "Lỗi"
                    : "Khả dụng"}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600">{tool.description}</p>
        </div>
      ))}
    </div>
  </div>
);

// Tab navigation component (extracted for reuse)
interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => (
  <div className="flex items-center gap-0 border-b border-gray-200">
    {[
      { id: "chat" as TabType, label: "Chat", icon: MessageCircle },
      { id: "debug" as TabType, label: "Debug", icon: Bug },
      { id: "tools" as TabType, label: "Tools", icon: Wrench },
    ].map((tab) => {
      const Icon = tab.icon;
      return (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === tab.id
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          )}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      );
    })}
  </div>
);

export default function AIChat() {
  const breakpoint = useBreakpoint();
  const isDesktop = breakpoint === "desktop";

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
            title: "Tổng quan hệ thống",
            content:
              "Hệ thống RAG đã được khởi tạo với 1,247 tài liệu về kinh tế Việt Nam. Cơ sở dữ liệu vector embeddings đã sẵn sàng để xử lý các truy vấn ngữ nghĩa với độ chính xác cao.",
            score: 1.0,
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle function for showing/hiding tool calls
  const toggleToolCalls = () => {
    setShowToolCalls((prev) => !prev);
  };

  // Toggle snippets popup
  const toggleSnippets = (messageId: string) => {
    setOpenSnippets((prev) => (prev === messageId ? null : messageId));
  };

  const [availableTools] = useState<Tool[]>([
    {
      id: "rag-search",
      name: "RAG Search",
      description: "Tìm kiếm thông tin trong cơ sở dữ liệu tài liệu",
      icon: <Search className="w-4 h-4" />,
      status: "active",
    },
    {
      id: "document-analysis",
      name: "Document Analysis",
      description: "Phân tích và tóm tắt tài liệu PDF",
      icon: <FileText className="w-4 h-4" />,
      status: "active",
    },
    {
      id: "web-crawl",
      name: "Web Crawl",
      description: "Thu thập dữ liệu từ các trang web",
      icon: <Database className="w-4 h-4" />,
      status: "available",
    },
    {
      id: "image-analysis",
      name: "Image Analysis",
      description: "Phân tích nội dung hình ảnh",
      icon: <FileText className="w-4 h-4" />,
      status: "available",
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
              title: "ban-tin-biwase-thang-11-nam-2025.pdf",
              content:
                "Bản tin Biwase tháng 11/2025: Tổng quan tình hình kinh tế Việt Nam quý 3/2025 cho thấy sự phục hồi mạnh mẽ. Ngành xuất khẩu điện tử đạt kim ngạch 45.2 tỷ USD, tăng 12.3% so với cùng kỳ năm trước. Ngành dệt may ghi nhận mức tăng trưởng 8.5% với tổng kim ngạch đạt 28.7 tỷ USD. Đặc biệt, lĩnh vực sản xuất smartphone và linh kiện bán dẫn tiếp tục dẫn đầu với đơn hàng mới từ các tập đoàn công nghệ quốc tế.",
              score: 0.95,
            },
            {
              title: "bao-cao-kinh-te-q3-2025.pdf",
              content:
                "Báo cáo kinh tế quý 3 năm 2025: GDP Việt Nam đạt mức tăng trưởng ấn tượng 6.8% so với cùng kỳ năm 2024. Các yếu tố thúc đẩy chính bao gồm: (1) Xuất khẩu tăng mạnh trong các ngành điện tử, dệt may, và thủy sản; (2) Tiêu dùng nội địa phục hồi với chỉ số tin cậy người tiêu dùng tăng 15 điểm; (3) Đầu tư FDI tăng 15.8% so với cùng kỳ. Lạm phát được kiểm soát ở mức 3.2%, nằm trong mục tiêu của Chính phủ.",
              score: 0.92,
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
          "Dựa trên thông tin từ các tài liệu Biwase, tình hình kinh tế Việt Nam trong quý 3 năm 2025 cho thấy những dấu hiệu tích cực. GDP tăng trưởng 6.8% so với cùng kỳ năm trước, được thúc đẩy bởi xuất khẩu mạnh mẽ, đặc biệt trong lĩnh vực điện tử và dệt may, cùng với việc tiêu dùng trong nước tăng cao.",
        timestamp: responseTimeString,
        sources: [
          "ban-tin-biwase-thang-11-nam-2025.pdf",
          "bao-cao-kinh-te-q3-2025.pdf",
        ],
        tools: ["RAG Search", "Document Analysis"],
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const copyMessage = async (content: string) => {
    await navigator.clipboard.writeText(content);
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  AI Agent
                </h1>
                <p className="text-sm text-gray-500">
                  Trợ lý thông minh cho RAG Platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Online
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Mobile/Tablet only */}
        {!isDesktop && (
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        )}

        {/* Messages Area - Always visible for Chat */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.type === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.type === "assistant" && (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
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
                    "rounded-lg p-4",
                    message.type === "user"
                      ? "bg-blue-600 text-white ml-auto"
                      : "bg-white border border-gray-200"
                  )}
                >
                  {/* Documents Found Badge - Only show for assistant messages with documents */}
                  {message.type === "assistant" && message.documentsFound && (
                    <div className="mb-3 bg-green-50 border border-green-200 rounded-lg p-3 relative">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-500 p-2 rounded-lg">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-green-800">
                            Found {message.documentsFound.count} relevant
                            document
                            {message.documentsFound.count !== 1 ? "s" : ""}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 bg-green-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-green-600 h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${message.documentsFound.similarity * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-green-700">
                              {(
                                message.documentsFound.similarity * 100
                              ).toFixed(0)}
                              % similarity
                            </span>
                          </div>
                        </div>
                        {message.documentsFound.snippets &&
                          message.documentsFound.snippets.length > 0 && (
                            <button
                              onClick={() => toggleSnippets(message.id)}
                              className={cn(
                                "text-xs font-medium px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5",
                                openSnippets === message.id
                                  ? "text-green-900 bg-green-200 hover:bg-green-300"
                                  : "text-green-700 bg-green-100 hover:bg-green-200"
                              )}
                            >
                              <Search className="w-3.5 h-3.5" />
                              {openSnippets === message.id
                                ? "Hide Content"
                                : "View Content"}
                            </button>
                          )}
                      </div>

                      {/* Click Popup - Document Content */}
                      {message.documentsFound.snippets &&
                        message.documentsFound.snippets.length > 0 &&
                        openSnippets === message.id && (
                          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border-2 border-green-500 rounded-lg shadow-2xl p-4 max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                              <FileText className="w-4 h-4 text-green-600" />
                              <h4 className="text-sm font-bold text-gray-800">
                                Document Content
                              </h4>
                              <span className="ml-auto text-xs text-gray-500">
                                {message.documentsFound.snippets.length}{" "}
                                documents
                              </span>
                            </div>
                            <div className="space-y-3">
                              {message.documentsFound.snippets.map(
                                (snippet, index) => (
                                  <div
                                    key={index}
                                    className="p-3 bg-gradient-to-br from-gray-50 to-green-50 rounded-lg border border-gray-200 hover:border-green-300 transition-all"
                                  >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <div className="flex items-center gap-2 flex-1">
                                        <div className="bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                                          {index + 1}
                                        </div>
                                        <h5 className="text-xs font-semibold text-gray-800 break-all">
                                          {snippet.title}
                                        </h5>
                                      </div>
                                      <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded whitespace-nowrap">
                                        {(snippet.score * 100).toFixed(0)}%
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-700 leading-relaxed pl-7">
                                      {snippet.content}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {/* RAG Query Results - Only show when showToolCalls is true (Debug) */}
                  {showToolCalls &&
                    message.queryResults &&
                    message.queryResults.length > 0 && (
                      <div
                        className={cn(
                          "mb-3 pb-3 border-b border-orange-200 bg-orange-50 -m-4 p-4",
                          message.documentsFound && "-mt-3"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Database className="w-4 h-4 text-orange-600" />
                          <p className="text-xs font-semibold text-orange-800 uppercase">
                            RAG Query Results (Debug)
                          </p>
                        </div>
                        <div className="space-y-1">
                          {message.queryResults.map((result, index) => (
                            <div
                              key={index}
                              className="text-xs text-orange-700 font-mono bg-orange-100/50 px-2 py-1 rounded"
                            >
                              → {result}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Always show the message content */}
                  <p className="whitespace-pre-wrap">{message.content}</p>

                  {/* Sources - Always show */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">
                        Nguồn tham khảo:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {message.sources.map((source, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {source}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tools Used - Only show when showToolCalls is true */}
                  {showToolCalls &&
                    message.tools &&
                    message.tools.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">
                          Công cụ sử dụng:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {message.tools.map((tool, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs flex items-center gap-1"
                            >
                              <Zap className="w-3 h-3" />
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

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
                        onClick={() => copyMessage(message.content)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Copy message"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Good response"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Bad response"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {message.type === "user" && (
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 order-2">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                  <span className="text-sm text-gray-500">
                    AI đang suy nghĩ...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Always at bottom */}
        <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
          {/* Attached Files */}
          {attachedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1"
                >
                  <Paperclip className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <button
                    onClick={() => removeAttachedFile(index)}
                    className="text-gray-400 hover:text-gray-600"
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
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn của bạn..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[44px] max-h-[120px]"
                rows={1}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileAttachment}
                className="hidden"
                accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Attach file"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <button
                className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Voice input"
              >
                <Mic className="w-5 h-5" />
              </button>

              {/* Separator for visual clarity */}
              <div className="w-px h-8 bg-gray-300"></div>

              {/* Toggle Tool Calls Button - Debug Feature */}
              <button
                onClick={toggleToolCalls}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm shadow-sm border",
                  showToolCalls
                    ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-400"
                )}
                title={
                  showToolCalls
                    ? "Hide tool call results (Debug)"
                    : "Show tool call results (Debug)"
                }
              >
                {showToolCalls ? (
                  <>
                    <Eye className="w-4 h-4" />
                    <span className="hidden md:inline">Tool Calls</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span className="hidden md:inline">Tool Calls</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content Container - For Debug/Tools tabs on mobile */}
        {!isDesktop && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Debug Tab */}
            {activeTab === "debug" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="text-center py-8">
                  <Bug className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Debug Information
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Toggle Tool Calls in the Chat tab to see debug information
                  </p>

                  {/* Current debug state */}
                  <div className="bg-white rounded-lg p-4 text-left border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Session Info
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Messages:</span>
                        <span className="font-mono text-gray-900">
                          {messages.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tool Calls:</span>
                        <span className="font-mono text-gray-900">
                          {showToolCalls ? "Visible" : "Hidden"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Breakpoint:</span>
                        <span className="font-mono text-gray-900">
                          {breakpoint}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Typing:</span>
                        <span className="font-mono text-gray-900">
                          {isTyping ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tools Tab - Remove duplicate, show placeholder */}
            {activeTab === "tools" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="text-center py-8">
                  <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Tools
                  </h3>
                  <p className="text-gray-600">
                    Tools panel is available on desktop in the right sidebar
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tools Sidebar - Desktop Only */}
      {isDesktop && <ToolsSidebar availableTools={availableTools} />}
    </div>
  );
}
