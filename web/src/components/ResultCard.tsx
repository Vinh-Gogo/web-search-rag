"use client";

import { FileText, ExternalLink, Copy, CheckCircle, Download, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { QueryResult } from "@/types/rag";

interface ResultCardProps {
  result: QueryResult;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
}

export default function ResultCard({
  result,
  isSelected,
  onSelect,
  onCopy,
  copiedId
}: ResultCardProps) {
  return (
    <div
      className={cn(
        "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 cursor-pointer transition-all duration-200",
        isSelected
          ? "border-blue-500/50 shadow-lg bg-blue-50/50 dark:bg-blue-900/20"
          : "hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600"
      )}
      onClick={() => onSelect(result.id)}
    >
      {/* Result Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
              <span className="text-base font-semibold text-gray-900 dark:text-white truncate">
                {result.documentTitle}
              </span>
            </div>
            {result.pageNumber && (
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                Page {result.pageNumber}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span className="flex items-center gap-1">
              <span className="font-medium">Relevance:</span>
              <span className="font-semibold">{(result.relevance * 100).toFixed(0)}%</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="font-medium">Similarity:</span>
              <span className="font-semibold">{(result.similarity * 100).toFixed(0)}%</span>
            </span>
            <span className="text-xs">{result.timestamp}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 justify-end sm:block">
          <span
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap",
              result.relevance >= 0.9
                ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50"
                : result.relevance >= 0.7
                ? "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800/50"
                : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50"
            )}
          >
            {(result.relevance * 100).toFixed(0)}% Relevant
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopy(result.content, result.id);
            }}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Copy content"
          >
            {copiedId === result.id ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Content Preview */}
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-sm sm:text-base">
        {result.content}
      </p>

      {/* Source Link */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-gray-200 dark:border-gray-700/50 gap-3">
        <a
          href={result.source}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors group"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          <span className="truncate max-w-[200px] sm:max-w-none">
            {result.source.replace(/https?:\/\//, '').replace(/\/$/, '')}
          </span>
        </a>

        {isSelected && (
          <div className="flex flex-wrap gap-2 justify-end">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors border border-gray-200 dark:border-gray-600">
              <Star className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors border border-gray-200 dark:border-gray-600">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
