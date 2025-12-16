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
    <div className="p-8 h-full overflow-auto bg-muted/20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          RAG Query System
        </h1>
        <p className="text-muted-foreground text-lg">
          Search through processed documents using natural language queries
        </p>
      </div>

      {/* Search Interface */}
      <div className="card p-6 mb-8 animate-fade-in">
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Ask a question about the documents (e.g., 'What are the latest economic indicators?')"
                className="input pl-12 pr-4 py-4 w-full text-lg"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
              className="btn btn-primary px-8 py-4 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="flex flex-wrap gap-3">
            <span className="text-sm text-muted-foreground font-medium">
              Try:
            </span>
            {[
              "Tình hình kinh tế Việt Nam",
              "Đầu tư trực tiếp nước ngoài",
              "Tăng trưởng GDP",
              "Chính sách tiền tệ",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setQuery(suggestion)}
                className="px-4 py-2 text-sm bg-accent text-accent-foreground rounded-full hover:bg-accent/80 transition-colors font-medium"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Results Section */}
        <div className="md:col-span-1 lg:col-span-2 space-y-6">
          {/* Results Header */}
          {results.length > 0 && (
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">
                Search Results ({results.length})
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4" />
                Response time: 1.2s
              </div>
            </div>
          )}

          {/* Results List */}
          <div className="space-y-6">
            {results.map((result) => (
              <div
                key={result.id}
                className={cn(
                  "card p-6 cursor-pointer transition-all duration-200 animate-fade-in",
                  selectedResult === result.id
                    ? "border-primary/50 shadow-lg bg-primary/5"
                    : "hover:shadow-md"
                )}
                onClick={() =>
                  setSelectedResult(
                    selectedResult === result.id ? null : result.id
                  )
                }
              >
                {/* Result Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="text-base font-semibold text-foreground">
                        {result.documentTitle}
                      </span>
                      {result.pageNumber && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          Page {result.pageNumber}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Relevance:</span>{" "}
                        {(result.relevance * 100).toFixed(0)}%
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Similarity:</span>{" "}
                        {(result.similarity * 100).toFixed(0)}%
                      </span>
                      <span>{result.timestamp}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold",
                        result.relevance >= 0.9
                          ? "text-success bg-success/10 border border-success/20"
                          : result.relevance >= 0.7
                            ? "text-warning bg-warning/10 border border-warning/20"
                            : "text-destructive bg-destructive/10 border border-destructive/20"
                      )}
                    >
                      {(result.relevance * 100).toFixed(0)}%
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(result.content, result.id);
                      }}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                      title="Copy content"
                    >
                      {copiedId === result.id ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Content Preview */}
                <p className="text-foreground/80 leading-relaxed mb-4 text-base">
                  {result.content}
                </p>

                {/* Source Link */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <a
                    href={result.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                    View source
                  </a>

                  {selectedResult === result.id && (
                    <div className="flex items-center gap-2">
                      <button className="btn btn-ghost flex items-center gap-2 px-3 py-1.5 text-sm">
                        <Star className="w-3 h-3" />
                        Save
                      </button>
                      <button className="btn btn-ghost flex items-center gap-2 px-3 py-1.5 text-sm">
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
            <div className="card p-12 text-center animate-fade-in">
              <Database className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-foreground mb-3">
                No results yet
              </h3>
              <p className="text-muted-foreground text-base">
                Enter a query to search through the document database
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Query Statistics */}
          <div className="card p-6 animate-fade-in">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              Database Stats
            </h3>
            <div className="space-y-5">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground font-medium">
                  Total Documents
                </span>
                <span className="font-bold text-foreground text-lg">127</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground font-medium">
                  Processed PDFs
                </span>
                <span className="font-bold text-foreground text-lg">89</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground font-medium">
                  Text Chunks
                </span>
                <span className="font-bold text-foreground text-lg">2,847</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground font-medium">
                  Vector Size
                </span>
                <span className="font-bold text-foreground text-lg">768</span>
              </div>
            </div>
          </div>

          {/* Query History */}
          <div className="card p-6 animate-fade-in">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              Recent Queries
            </h3>
            <div className="space-y-4">
              {queryHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-muted/50 rounded-xl hover:bg-muted/70 transition-colors"
                >
                  <p className="text-sm font-semibold text-foreground mb-2 leading-tight">
                    {item.query}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      {item.resultsCount} results
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.responseTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="card p-6 animate-fade-in">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              System Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">
                  Vector Database
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">
                  Embedding Service
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">
                  Search Engine
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-warning/10 rounded-lg border border-warning/20">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">
                  LLM Service
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
