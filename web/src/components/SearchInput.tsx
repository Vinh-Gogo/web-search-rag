"use client";
import { Search, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: (query: string) => void;
  isSearching: boolean;
}

export default function SearchInput({ query, onQueryChange, onSearch, isSearching }: SearchInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="mb-8">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Ask anything about your documents..."
              className={cn(
                "w-full pl-12 pr-12 py-4 text-lg border border-gray-200 dark:border-gray-700 rounded-xl",
                "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                "placeholder-gray-500 dark:placeholder-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "transition-all duration-200",
                isSearching && "opacity-75"
              )}
              disabled={isSearching}
            />
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className={cn(
                "absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg",
                "text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400",
                "transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              )}
            >
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
