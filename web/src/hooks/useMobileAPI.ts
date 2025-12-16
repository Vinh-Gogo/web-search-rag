"use client";

import { useState, useCallback, useRef, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8080";
const MOBILE_API_ENDPOINT = `${API_BASE_URL}/api/mobile`;

/**
 * Configuration for mobile API caching and retry logic
 */
interface MobileAPIConfig {
  cacheDuration: number; // milliseconds
  maxRetries: number;
  retryDelay: number; // milliseconds
  useLocalCache: boolean;
}

const DEFAULT_CONFIG: MobileAPIConfig = {
  cacheDuration: 5 * 60 * 1000, // 5 minutes
  maxRetries: 3,
  retryDelay: 1000,
  useLocalCache: true,
};

/**
 * Cache entry for API responses
 */
interface CacheEntry {
  data: unknown;
  timestamp: number;
}

/**
 * Mobile API Response Types
 */
interface MobileChatResponse {
  id: string;
  response: string;
  conversation_id: string;
  message_count: number;
  timestamp: string;
  sources?: Array<{ title: string; url: string }>;
}

interface MobileMessage {
  id: string;
  content: string;
  timestamp: string;
  type: "user" | "assistant";
}

interface MobileConversation {
  id: string;
  title: string;
  created_at: string;
  message_count: number;
}

interface MobileSearchResult {
  results: Array<{ id: string; content: string; score: number }>;
  total: number;
  has_more: boolean;
}

interface MobileSyncResponse {
  success: boolean;
  synced_count: number;
}

/**
 * Hook for mobile API communication with caching and offline support
 */
export function useMobileAPI(config: Partial<MobileAPIConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const [isOnline, setIsOnline] = useState(true);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  /**
   * Get cached data if valid
   */
  const getCachedData = useCallback(
    (key: string): unknown | null => {
      if (!finalConfig.useLocalCache) return null;

      const cached = cacheRef.current.get(key);
      if (!cached) return null;

      const isExpired = Date.now() - cached.timestamp > finalConfig.cacheDuration;
      if (isExpired) {
        cacheRef.current.delete(key);
        return null;
      }

      return cached.data;
    },
    [finalConfig]
  );

  /**
   * Set cached data
   */
  const setCachedData = useCallback((key: string, data: unknown) => {
    if (!finalConfig.useLocalCache) return;

    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
    });
  }, [finalConfig]);

  /**
   * Make API request with retry logic
   */
  const request = useCallback(
    async <T,>(
      endpoint: string,
      options?: RequestInit,
      cacheKey?: string
    ): Promise<T> => {
      // Check cache first
      if (cacheKey && options?.method !== "POST" && options?.method !== "PUT") {
        const cached = getCachedData(cacheKey);
        if (cached) {
          return cached as T;
        }
      }

      let lastError: Error | null = null;

      // Retry logic
      for (let attempt = 0; attempt < finalConfig.maxRetries; attempt++) {
        try {
          const response = await fetch(`${MOBILE_API_ENDPOINT}${endpoint}`, {
            ...options,
            headers: {
              "Content-Type": "application/json",
              ...options?.headers,
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();

          // Cache successful GET requests
          if (cacheKey && (!options?.method || options.method === "GET")) {
            setCachedData(cacheKey, data);
          }

          return data as T;
        } catch (error) {
          lastError = error as Error;

          if (attempt < finalConfig.maxRetries - 1) {
            await new Promise((resolve) =>
              setTimeout(resolve, finalConfig.retryDelay * Math.pow(2, attempt))
            );
          }
        }
      }

      throw lastError || new Error("Failed to fetch from mobile API");
    },
    [finalConfig, getCachedData, setCachedData]
  );

  /**
   * GET request
   */
  const get = useCallback(
    async <T,>(endpoint: string, cacheKey?: string): Promise<T> => {
      return request<T>(endpoint, { method: "GET" }, cacheKey);
    },
    [request]
  );

  /**
   * POST request
   */
  const post = useCallback(
    async <T,>(
      endpoint: string,
      data: unknown,
      cacheKey?: string
    ): Promise<T> => {
      return request<T>(
        endpoint,
        {
          method: "POST",
          body: JSON.stringify(data),
        },
        cacheKey
      );
    },
    [request]
  );

  /**
   * Clear cache
   */
  const clearCache = useCallback((key?: string) => {
    if (key) {
      cacheRef.current.delete(key);
    } else {
      cacheRef.current.clear();
    }
  }, []);

  /**
   * Sync offline data when back online
   */
  const syncOfflineData = useCallback(async () => {
    if (!isOnline) return false;

    try {
      const conversationId = localStorage.getItem("currentConversationId");
      const offlineMessages = localStorage.getItem("offlineMessages");

      if (!conversationId || !offlineMessages) return true;

      const messages = JSON.parse(offlineMessages);
      const response = await post<MobileSyncResponse>(
        "/sync",
        {
          conversation_id: conversationId,
          messages,
          last_sync: new Date().toISOString(),
        },
        undefined
      );

      if (response.success) {
        localStorage.removeItem("offlineMessages");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to sync offline data:", error);
      return false;
    }
  }, [isOnline, post]);

  return {
    request,
    get,
    post,
    clearCache,
    syncOfflineData,
    isOnline,
    cacheSize: cacheRef.current.size,
  };
}

/**
 * Hook for mobile chat operations
 */
export function useMobileChat() {
  const api = useMobileAPI();
  const [conversation, setConversation] = useState<{ id: string; messageCount: number } | null>(null);
  const [messages, setMessages] = useState<MobileMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Send chat message
   */
  const sendMessage = useCallback(
    async (message: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.post<MobileChatResponse>(
          "/chat",
          {
            message,
            conversation_id: conversation?.id,
            include_history: true,
          }
        );

        setConversation({
          id: response.conversation_id,
          messageCount: response.message_count,
        });

        setMessages((prev) => [
          ...prev,
          {
            id: response.id,
            type: "assistant",
            content: response.response,
            timestamp: response.timestamp,
          },
        ]);

        return response;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to send message";
        setError(errorMsg);

        // Store for offline sync
        if (!api.isOnline) {
          const offlineMessages = JSON.parse(
            localStorage.getItem("offlineMessages") || "[]"
          );
          offlineMessages.push({
            message,
            timestamp: new Date().toISOString(),
            pending: true,
          });
          localStorage.setItem("offlineMessages", JSON.stringify(offlineMessages));
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api, conversation]
  );

  /**
   * Load conversation history
   */
  const loadConversation = useCallback(
    async (conversationId: string, limit = 20) => {
      setLoading(true);
      setError(null);

      try {
        const messages = await api.get<MobileMessage[]>(
          `/conversations/${conversationId}/messages?limit=${limit}`,
          `conversation_${conversationId}`
        );

        setMessages(messages);
        localStorage.setItem("currentConversationId", conversationId);

        return messages;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load messages";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  /**
   * Load conversations list
   */
  const loadConversations = useCallback(
    async (limit = 10) => {
      setLoading(true);
      setError(null);

      try {
        const conversations = await api.get<MobileConversation[]>(
          `/conversations?limit=${limit}`,
          "conversations_list"
        );

        return conversations;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to load conversations";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  return {
    conversation,
    messages,
    loading,
    error,
    sendMessage,
    loadConversation,
    loadConversations,
    isOnline: api.isOnline,
  };
}

/**
 * Hook for mobile search operations
 */
export function useMobileSearch() {
  const api = useMobileAPI();
  const [results, setResults] = useState<Array<{ id: string; content: string; score: number }>>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Search knowledge base
   */
  const search = useCallback(
    async (query: string, limit = 10, offset = 0) => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.post<MobileSearchResult>(
          "/search",
          { query, limit, offset },
          `search_${query}_${offset}`
        );

        if (offset === 0) {
          setResults(response.results);
        } else {
          setResults((prev) => [...prev, ...response.results]);
        }

        setTotal(response.total);
        setHasMore(response.has_more);

        return response;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Search failed";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  /**
   * Load more results
   */
  const loadMore = useCallback(
    (query: string, limit = 10) => {
      return search(query, limit, results.length);
    },
    [search, results.length]
  );

  return {
    results,
    total,
    hasMore,
    loading,
    error,
    search,
    loadMore,
    clear: () => {
      setResults([]);
      setTotal(0);
      setHasMore(false);
    },
  };
}
