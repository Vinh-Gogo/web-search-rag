"use client";

import { Database } from "lucide-react";
import { DatabaseStat } from "@/types/rag";

interface QueryStatsProps {
  stats?: DatabaseStat[];
}

const defaultStats = [
  { label: "Total Documents", value: "127" },
  { label: "Processed PDFs", value: "89" },
  { label: "Text Chunks", value: "2,847" },
  { label: "Vector Size", value: "768" },
];

export default function QueryStats({ stats = defaultStats }: QueryStatsProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Database className="w-4 h-4 text-blue-500" />
        Database Stats
      </h3>
      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {stat.label}
            </span>
            <span className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl">
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
