"use client";

import { Clock, Database } from "lucide-react";
import { QueryHistoryItem } from "@/types/rag";

interface QueryHistoryProps {
  history?: QueryHistoryItem[];
  onSelectQuery?: (query: string) => void;
}

const defaultHistory: QueryHistoryItem[] = [
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
];

export default function QueryHistory({
  history = defaultHistory,
  onSelectQuery
}: QueryHistoryProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 text-blue-500" />
        Recent Queries
      </h3>
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {history.map((item) => (
          <div
            key={item.id}
            className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            onClick={() => onSelectQuery?.(item.query)}
          >
            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 mb-1">
              {item.query}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
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
  );
}
