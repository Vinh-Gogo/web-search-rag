"use client";

import { useState } from "react";
import { 
  Search, 
  Send, 
  Database, 
  Clock, 
  FileText, 
  ExternalLink,
  Copy,
  CheckCircle,
  AlertCircle,
  Filter,
  RefreshCw,
  Download,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QueryResult {
  id: string;
  content: string;
  source: string;
  relevance: number;
  documentTitle: string;
  pageNumber?: number;
  timestamp: string;
  similarity: number;
}

interface QueryHistory {
  id: string;
  query: string;
  timestamp: string;
  resultsCount: number;
  responseTime: string;
}

export default function RAGQuery() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<QueryResult[]>([
    {
      id: "1",
      content: "The Vietnamese economy showed strong growth in Q3 2025, with GDP increasing by 6.8% year-over-year. This growth was driven by robust exports, particularly in electronics and textiles, as well as increased domestic consumption.",
      source: "https://biwase.com.vn/ban-tin-biwase-thang-11",
      relevance: 0.95,
      documentTitle: "Bản tin Biwase tháng 11 năm 2025",
      pageNumber: 3,
      timestamp: "2025-12-13 20:35:00",
      similarity: 0.92
    },
    {
      id: "2", 
      content: "Foreign direct investment reached $15.2 billion in the first nine months of 2025, with major investments in manufacturing and technology sectors. South Korea and Japan remain the largest investors.",
      source: "https://biwase.com.vn/ban-tin-biwase-thang-11",
      relevance: 0.88,
      documentTitle: "Bản tin Biwase tháng 11 năm 2025", 
      pageNumber: 5,
      timestamp: "2025-12-13 20:35:00",
      similarity: 0.87
    }
  ]);

  const [queryHistory] = useState<QueryHistory[]>([
    {
      id: "1",
      query: "Tình hình kinh tế Việt Nam Q3 2025",
      timestamp: "2025-12-13 20:30:00",
      resultsCount: 8,
      responseTime: "1.2s"
    },
    {
      id: "2", 
      query: "Đầu tư trực tiếp nước ngoài Việt Nam",
      timestamp: "2025-12-13 19:45:00",
      resultsCount: 12,
      responseTime: "1.5s"
    }
  ]);

  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setIsSearching(false);
    }, 1500);
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 0.9) return "text-green-600 bg-green-50";
    if (relevance >= 0.7) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="p-6 h-full overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">RAG Query System</h1>
        <p className="text-gray-600">Search through processed documents using natural language queries</p>
      </div>

      {/* Search Interface */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ask a question about the documents (e.g., 'What are the latest economic indicators?')"
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSearching ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>

          {/* Quick Suggestions */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500">Try:</span>
            {[
              "Tình hình kinh tế Việt Nam",
              "Đầu tư trực tiếp nước ngoài", 
              "Tăng trưởng GDP",
              "Chính sách tiền tệ"
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setQuery(suggestion)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Results Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Results Header */}
          {results.length > 0 && (
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Search Results ({results.length})
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                Response time: 1.2s
              </div>
            </div>
          )}

          {/* Results List */}
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                className={cn(
                  "bg-white rounded-lg border p-6 cursor-pointer transition-all",
                  selectedResult === result.id 
                    ? "border-blue-300 shadow-md" 
                    : "border-gray-200 hover:border-gray-300"
                )}
                onClick={() => setSelectedResult(selectedResult === result.id ? null : result.id)}
              >
                {/* Result Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {result.documentTitle}
                      </span>
                      {result.pageNumber && (
                        <span className="text-xs text-gray-500">
                          Page {result.pageNumber}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>Relevance: {(result.relevance * 100).toFixed(0)}%</span>
                      <span>Similarity: {(result.similarity * 100).toFixed(0)}%</span>
                      <span>{result.timestamp}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getRelevanceColor(result.relevance))}>
                      {(result.relevance * 100).toFixed(0)}%
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(result.content, result.id);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Copy content"
                    >
                      {copiedId === result.id ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Content Preview */}
                <p className="text-gray-700 leading-relaxed mb-3">
                  {result.content}
                </p>

                {/* Source Link */}
                <div className="flex items-center justify-between">
                  <a
                    href={result.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3 h-3" />
                    View source
                  </a>
                  
                  {selectedResult === result.id && (
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100">
                        <Star className="w-3 h-3" />
                        Save
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-50 text-gray-700 rounded hover:bg-gray-100">
                        <Download className="w-3 h-3" />
                        Export
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* No Results State */}
          {results.length === 0 && !isSearching && (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results yet</h3>
              <p className="text-gray-600">Enter a query to search through the document database</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Query Statistics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Documents</span>
                <span className="font-semibold">127</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Processed PDFs</span>
                <span className="font-semibold">89</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Text Chunks</span>
                <span className="font-semibold">2,847</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Vector Size</span>
                <span className="font-semibold">768</span>
              </div>
            </div>
          </div>

          {/* Query History */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Queries</h3>
            <div className="space-y-3">
              {queryHistory.map((item) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-1">{item.query}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{item.resultsCount} results</span>
                    <span>{item.responseTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">Vector Database</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">Embedding Service</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">Search Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-gray-700">LLM Service</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
