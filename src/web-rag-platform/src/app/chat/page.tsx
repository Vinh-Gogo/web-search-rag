"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Paperclip, 
  Mic, 
  Square, 
  Bot, 
  User, 
  Settings,
  MoreVertical,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Zap,
  Database,
  Search,
  FileText,
  Image
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: string[];
  tools?: string[];
  isThinking?: boolean;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "available" | "active" | "error";
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content: "Xin chào! Tôi là AI Agent của hệ thống RAG. Tôi có thể giúp bạn tìm kiếm thông tin từ các tài liệu đã được xử lý, phân tích dữ liệu, và trả lời các câu hỏi về kinh tế Việt Nam. Bạn có thể hỏi tôi bất cứ điều gì!",
      timestamp: "2025-12-13 20:40:00",
      tools: ["RAG Search", "Document Analysis"]
    }
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [availableTools] = useState<Tool[]>([
    {
      id: "rag-search",
      name: "RAG Search",
      description: "Tìm kiếm thông tin trong cơ sở dữ liệu tài liệu",
      icon: <Search className="w-4 h-4" />,
      status: "active"
    },
    {
      id: "document-analysis",
      name: "Document Analysis", 
      description: "Phân tích và tóm tắt tài liệu PDF",
      icon: <FileText className="w-4 h-4" />,
      status: "active"
    },
    {
      id: "web-crawl",
      name: "Web Crawl",
      description: "Thu thập dữ liệu từ các trang web",
      icon: <Database className="w-4 h-4" />,
      status: "available"
    },
    {
      id: "image-analysis",
      name: "Image Analysis",
      description: "Phân tích nội dung hình ảnh",
      icon: <Image className="w-4 h-4" />,
      status: "available"
    }
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Dựa trên thông tin từ các tài liệu Biwase, tình hình kinh tế Việt Nam trong quý 3 năm 2025 cho thấy những dấu hiệu tích cực. GDP tăng trưởng 6.8% so với cùng kỳ năm trước, được thúc đẩy bởi xuất khẩu mạnh mẽ, đặc biệt trong lĩnh vực điện tử và dệt may, cùng với việc tiêu dùng trong nước tăng cao.",
        timestamp: new Date().toLocaleTimeString(),
        sources: ["ban-tin-biwase-thang-11-nam-2025.pdf", "bao-cao-kinh-te-q3-2025.pdf"],
        tools: ["RAG Search", "Document Analysis"]
      };

      setMessages(prev => [...prev, aiResponse]);
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
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
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
                <h1 className="text-lg font-semibold text-gray-900">AI Agent</h1>
                <p className="text-sm text-gray-500">Trợ lý thông minh cho RAG Platform</p>
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

        {/* Messages Area */}
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
              
              <div className={cn(
                "max-w-3xl",
                message.type === "user" ? "order-2" : ""
              )}>
                <div className={cn(
                  "rounded-lg p-4",
                  message.type === "user" 
                    ? "bg-blue-600 text-white ml-auto" 
                    : "bg-white border border-gray-200"
                )}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Nguồn tham khảo:</p>
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
                  
                  {/* Tools Used */}
                  {message.tools && message.tools.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Công cụ sử dụng:</p>
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
                
                <div className={cn(
                  "flex items-center gap-2 mt-2 text-xs text-gray-500",
                  message.type === "user" ? "justify-end" : "justify-start"
                )}>
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
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">AI đang suy nghĩ...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          {/* Attached Files */}
          {attachedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1">
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
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
      </div>

      {/* Tools Sidebar */}
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
                <div className={cn(
                  "p-2 rounded-lg",
                  tool.status === "active" 
                    ? "bg-green-100 text-green-600"
                    : tool.status === "error"
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-600"
                )}>
                  {tool.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{tool.name}</h4>
                  <div className={cn(
                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1",
                    tool.status === "active" 
                      ? "bg-green-100 text-green-800"
                      : tool.status === "error"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  )}>
                    {tool.status === "active" ? "Hoạt động" : 
                     tool.status === "error" ? "Lỗi" : "Khả dụng"}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">{tool.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
