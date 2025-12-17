export interface QueryResult {
  id: string;
  content: string;
  source: string;
  relevance: number;
  documentTitle: string;
  pageNumber?: number;
  timestamp: string;
  similarity: number;
}

export interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  resultsCount: number;
  responseTime: string;
}

export interface ServiceStatus {
  name: string;
  status: string;
  color: string;
}

export interface DatabaseStat {
  label: string;
  value: string;
}
