"use client";

import { Clock, Database } from "lucide-react";
import ResultCard from "./ResultCard";
import { QueryResult } from "@/types/rag";

interface ResultsListProps {
  results: QueryResult[];
  selectedResult: string | null;
  onSelectResult: (id: string) => void;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  responseTime?: string;
  isSearching: boolean;
}

export default function ResultsList({
  results,
  selectedResult,
  onSelectResult,
  onCopy,
  copiedId,
  responseTime = "1.2s",
  isSearching
}: ResultsListProps) {
  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Results Header */}
      {results.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Search Results ({results.length})
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
            <Clock className="w-4 h-4" />
            <span>Response time: {responseTime}</span>
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-4">
        {results.map((result) => (
          <ResultCard
            key={result.id}
            result={result}
            isSelected={selectedResult === result.id}
            onSelect={onSelectResult}
            onCopy={onCopy}
            copiedId={copiedId}
          />
        ))}
      </div>

      {/* No Results State */}
      {results.length === 0 && !isSearching && (
        <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl p-8 sm:p-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 dark:bg-gray-700/50 rounded-full mb-4 sm:mb-6 mx-auto">
            <Database className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No results yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-base max-w-md mx-auto">
            Enter a query to search through the document database
          </p>
        </div>
      )}
    </div>
  );
}
