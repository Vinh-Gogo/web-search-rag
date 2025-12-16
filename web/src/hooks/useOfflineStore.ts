"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Offline-first data store for mobile app
 * Uses localStorage for persistence and IndexedDB for large data
 */

const STORE_PREFIX = "rag_mobile_";
const IDB_NAME = "RAG_Platform";
const IDB_VERSION = 1;

interface StorageOptions {
  useIndexedDB: boolean;
  maxLocalStorageSize: number; // bytes
  autoSync: boolean;
}

/**
 * Data structure interfaces
 */
interface OfflineMessage {
  id: string;
  content: string;
  timestamp: string;
  type: "user" | "assistant";
}

interface OfflineConversation {
  id: string;
  title: string;
  created_at: string;
  message_count: number;
  [key: string]: unknown;
}

interface SearchResultItem {
  id: string;
  content: string;
  score: number;
}

interface SyncQueueItem {
  id: string;
  action: string;
  data: unknown;
  timestamp: number;
  synced: boolean;
}

interface StoredData {
  id: string;
  data: unknown;
  timestamp: number;
}

const DEFAULT_OPTIONS: StorageOptions = {
  useIndexedDB: true,
  maxLocalStorageSize: 5 * 1024 * 1024, // 5MB
  autoSync: true,
};

/**
 * Hook for managing offline-first data storage
 */
export function useOfflineStore(options: Partial<StorageOptions> = {}) {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };
  const dbRef = useRef<IDBDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [storageUsage, setStorageUsage] = useState(0);

  /**
   * Initialize IndexedDB
   */
  useEffect(() => {
    if (!finalOptions.useIndexedDB || typeof window === "undefined") {
      setIsReady(true);
      return;
    }

    const initDB = async () => {
      try {
        const request = indexedDB.open(IDB_NAME, IDB_VERSION);

        request.onerror = () => {
          console.error("Failed to open IndexedDB");
          setIsReady(true);
        };

        request.onsuccess = () => {
          dbRef.current = request.result;
          setIsReady(true);
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          // Create object stores
          if (!db.objectStoreNames.contains("conversations")) {
            db.createObjectStore("conversations", { keyPath: "id" });
          }
          if (!db.objectStoreNames.contains("messages")) {
            db.createObjectStore("messages", { keyPath: "id" });
          }
          if (!db.objectStoreNames.contains("searchResults")) {
            db.createObjectStore("searchResults", { keyPath: "id" });
          }
          if (!db.objectStoreNames.contains("pendingSync")) {
            db.createObjectStore("pendingSync", { keyPath: "id" });
          }
        };
      } catch (error) {
        console.error("IndexedDB initialization failed:", error);
        setIsReady(true);
      }
    };

    initDB();
  }, [finalOptions.useIndexedDB]);

  /**
   * Save data to offline store
   */
  const setData = useCallback(
    async (key: string, data: unknown) => {
      const serialized = JSON.stringify(data);
      const size = new Blob([serialized]).size;

      // Try localStorage first
      if (size < finalOptions.maxLocalStorageSize) {
        try {
          localStorage.setItem(`${STORE_PREFIX}${key}`, serialized);
          updateStorageUsage();
          return true;
        } catch (err) {
          console.warn("localStorage full, trying IndexedDB:", err);
        }
      }

      // Fall back to IndexedDB
      if (dbRef.current) {
        return new Promise((resolve) => {
          const transaction = dbRef.current!.transaction(
            ["messages", "conversations", "searchResults"],
            "readwrite"
          );
          const store = transaction.objectStore("messages");

          const request = store.put({
            id: key,
            data,
            timestamp: Date.now(),
          });

          request.onsuccess = () => {
            updateStorageUsage();
            resolve(true);
          };

          request.onerror = () => {
            console.error("IndexedDB write failed:", request.error);
            resolve(false);
          };
        });
      }

      return false;
    },
    [finalOptions.maxLocalStorageSize]
  );

  /**
   * Retrieve data from offline store
   */
  const getData = useCallback(
    async (key: string): Promise<unknown | null> => {
      // Try localStorage first
      const localData = localStorage.getItem(`${STORE_PREFIX}${key}`);
      if (localData) {
        try {
          return JSON.parse(localData) as unknown;
        } catch (err) {
          console.error("Failed to parse localStorage data:", err);
        }
      }

      // Try IndexedDB
      if (dbRef.current) {
        return new Promise((resolve) => {
          const transaction = dbRef.current!.transaction(
            ["messages", "conversations", "searchResults"],
            "readonly"
          );
          const store = transaction.objectStore("messages");
          const request = store.get(key);

          request.onsuccess = () => {
            resolve(request.result?.data || null);
          };

          request.onerror = () => {
            console.error("IndexedDB read failed:", request.error);
            resolve(null);
          };
        });
      }

      return null;
    },
    []
  );

  /**
   * Remove data from offline store
   */
  const removeData = useCallback(async (key: string) => {
    localStorage.removeItem(`${STORE_PREFIX}${key}`);

    if (dbRef.current) {
      return new Promise((resolve) => {
        const transaction = dbRef.current!.transaction(
          ["messages", "conversations", "searchResults"],
          "readwrite"
        );
        const store = transaction.objectStore("messages");
        const request = store.delete(key);

        request.onsuccess = () => {
          updateStorageUsage();
          resolve(true);
        };

        request.onerror = () => {
          console.error("IndexedDB delete failed:", request.error);
          resolve(false);
        };
      });
    }

    return true;
  }, []);

  /**
   * Clear all offline data
   */
  const clearAll = useCallback(async () => {
    // Clear localStorage
    const keysToDelete = Object.keys(localStorage).filter((key) =>
      key.startsWith(STORE_PREFIX)
    );
    keysToDelete.forEach((key) => localStorage.removeItem(key));

    // Clear IndexedDB
    if (dbRef.current) {
      return new Promise((resolve) => {
        const transaction = dbRef.current!.transaction(
          ["messages", "conversations", "searchResults", "pendingSync"],
          "readwrite"
        );

        let completed = 0;
        const stores = ["messages", "conversations", "searchResults", "pendingSync"];

        stores.forEach((storeName) => {
          const request = transaction.objectStore(storeName).clear();
          request.onsuccess = () => {
            completed++;
            if (completed === stores.length) {
              updateStorageUsage();
              resolve(true);
            }
          };
        });
      });
    }

    updateStorageUsage();
    return true;
  }, []);

  /**
   * Update storage usage
   */
  const updateStorageUsage = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.storage) {
      navigator.storage.estimate?.().then(({ usage }) => {
        setStorageUsage(usage || 0);
      });
    }
  }, []);

  /**
   * Queue data for syncing
   */
  const queueForSync = useCallback(
    async (action: string, data: unknown) => {
      const syncItem: SyncQueueItem = {
        id: `sync_${Date.now()}_${Math.random()}`,
        action,
        data,
        timestamp: Date.now(),
        synced: false,
      };

      if (dbRef.current) {
        return new Promise((resolve) => {
          const transaction = dbRef.current!.transaction(["pendingSync"], "readwrite");
          const store = transaction.objectStore("pendingSync");
          const request = store.add(syncItem);

          request.onsuccess = () => {
            resolve(syncItem.id);
          };

          request.onerror = () => {
            console.error("Failed to queue sync:", request.error);
            resolve(null);
          };
        });
      }

      return null;
    },
    []
  );

  /**
   * Get pending sync items
   */
  const getPendingSync = useCallback(async () => {
    if (!dbRef.current) return [];

    return new Promise((resolve) => {
      const transaction = dbRef.current!.transaction(["pendingSync"], "readonly");
      const store = transaction.objectStore("pendingSync");
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result.filter((item) => !item.synced));
      };

      request.onerror = () => {
        console.error("Failed to get pending sync:", request.error);
        resolve([]);
      };
    });
  }, []);

  /**
   * Mark sync item as completed
   */
  const markSynced = useCallback(async (id: string) => {
    if (!dbRef.current) return false;

    return new Promise((resolve) => {
      const transaction = dbRef.current!.transaction(["pendingSync"], "readwrite");
      const store = transaction.objectStore("pendingSync");
      const request = store.get(id);

      request.onsuccess = () => {
        const item = request.result;
        if (item) {
          item.synced = true;
          store.put(item);
        }
        resolve(true);
      };

      request.onerror = () => {
        console.error("Failed to mark synced:", request.error);
        resolve(false);
      };
    });
  }, []);

  return {
    isReady,
    setData,
    getData,
    removeData,
    clearAll,
    queueForSync,
    getPendingSync,
    markSynced,
    storageUsage,
  };
}

/**
 * Hook for managing conversation cache
 */
export function useConversationCache() {
  const store = useOfflineStore();
  const [conversations, setConversations] = useState<OfflineConversation[]>([]);

  /**
   * Save conversation
   */
  const saveConversation = useCallback(
    async (conversation: OfflineConversation) => {
      await store.setData(`conv_${conversation.id}`, conversation);
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === conversation.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = conversation;
          return updated;
        }
        return [conversation, ...prev];
      });
    },
    [store]
  );

  /**
   * Load conversations
   */
  const loadConversations = useCallback(async () => {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith(`${STORE_PREFIX}conv_`)
    );

    const loaded = keys.map((key) => {
      const data = localStorage.getItem(key);
      return data ? (JSON.parse(data) as OfflineConversation) : null;
    }).filter((item): item is OfflineConversation => item !== null);

    setConversations(loaded);
    return loaded;
  }, []);

  /**
   * Delete conversation
   */
  const deleteConversation = useCallback(
    async (conversationId: string) => {
      await store.removeData(`conv_${conversationId}`);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    },
    [store]
  );

  return {
    conversations,
    saveConversation,
    loadConversations,
    deleteConversation,
  };
}
