// components/RAGQueryClient.tsx
"use client";

import { useState } from 'react';
import SearchInput from './SearchInput';
import ResultsList from './ResultsList';
import QueryStats from './QueryStats';
import QueryHistory from './QueryHistory';
import SystemStatus from './SystemStatus';
import { QueryResult, QueryHistoryItem } from "@/types/rag";

export default function RAGQueryClient() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results] = useState<QueryResult[]>([
    {
      id: "1",
      content: "The Vietnamese economy showed strong growth in Q3 2025, with GDP increasing by 6.8% year-over-year. This growth was driven by robust exports, particularly in electronics and textiles, as well as increased domestic consumption.",
      source: "https://biwase.com.vn/ban-tin-biwase-thang-11",
      relevance: 0.95,
      documentTitle: "Bản tin Biwase tháng 11 năm 2025",
      pageNumber: 3,
      timestamp: "2025-12-13 20:35:00",
      similarity: 0.92,
    },
    {
      id: "2",
      content: "Foreign direct investment reached $15.2 billion in the first nine months of 2025, with major investments in manufacturing and technology sectors. South Korea and Japan remain the largest investors.",
      source: "https://biwase.com.vn/ban-tin-biwase-thang-11",
      relevance: 0.88,
      documentTitle: "Bản tin Biwase tháng 11 năm 2025",
      pageNumber: 5,
      timestamp: "2025-12-13 20:35:00",
      similarity: 0.87,
    },
  ]);

  const [queryHistory] = useState<QueryHistoryItem[]>([
    {
      id: "1",
      query: "Tình hình kinh tế Việt Nam Q3 2025",
      timestamp: "2025-12-13 20:30:00",
      resultsCount: 8,
      responseTime: "1.2s",
    },
    {
      id: "2",
      query: "Đầu tư trực tiếp nước ngoài Việt Nam",
      timestamp: "2025-12-13 19:45:00",
      resultsCount: 12,
      responseTime: "1.5s",
    },
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

  const handleSelectQuery = (selectedQuery: string) => {
    setQuery(selectedQuery);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SearchInput
        query={query}
        onQueryChange={setQuery}
        onSearch={handleSearch}
        isSearching={isSearching}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ResultsList
          results={results}
          selectedResult={selectedResult}
          onSelectResult={setSelectedResult}
          onCopy={copyToClipboard}
          copiedId={copiedId}
          isSearching={isSearching}
        />

        {/* Sidebar */}
        <div className="space-y-6">
          <QueryStats />
          <QueryHistory history={queryHistory} onSelectQuery={handleSelectQuery} />
          <SystemStatus />
        </div>
      </div>
    </div>
  );
}
