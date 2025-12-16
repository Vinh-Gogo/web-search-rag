"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useOfflineStore } from "./useOfflineStore";

/**
 * Voice message for offline queue
 */
export interface QueuedVoiceMessage {
  id: string;
  text: string;
  language: string;
  timestamp: number;
  status: "pending" | "sent" | "failed";
  retries: number;
}

/**
 * Hook for managing offline voice message queue
 * Stores voice messages when offline, syncs when online
 */
export function useVoiceQueue() {
  const { setData, getData, removeData } = useOfflineStore();
  const [queue, setQueue] = useState<QueuedVoiceMessage[]>([]);
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window === "undefined") return true;
    return navigator.onLine;
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const hasInitializedRef = useRef(false);

  // Monitor online/offline status
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Load queue from storage on mount
  useEffect(() => {
    const loadQueue = async () => {
      try {
        const stored = await getData("voiceQueue");
        if (stored && Array.isArray(stored)) {
          setQueue(stored as QueuedVoiceMessage[]);
        }
      } catch (error) {
        console.error("Failed to load voice queue:", error);
      }
    };

    loadQueue();
  }, [getData]);

  /**
   * Add voice message to queue
   */
  const addToQueue = useCallback(
    async (text: string, language: string = "en-US") => {
      const message: QueuedVoiceMessage = {
        id: `voice-${Date.now()}`,
        text,
        language,
        timestamp: Date.now(),
        status: "pending",
        retries: 0,
      };

      const newQueue = [...queue, message];
      setQueue(newQueue);

      try {
        await setData("voiceQueue", newQueue);
      } catch (error) {
        console.error("Failed to save voice message to queue:", error);
      }

      return message.id;
    },
    [queue, setData]
  );

  /**
   * Remove message from queue
   */
  const removeFromQueue = useCallback(
    async (messageId: string) => {
      const newQueue = queue.filter((msg) => msg.id !== messageId);
      setQueue(newQueue);

      try {
        await setData("voiceQueue", newQueue);
      } catch (error) {
        console.error("Failed to update voice queue:", error);
      }
    },
    [queue, setData]
  );

  /**
   * Update message status
   */
  const updateStatus = useCallback(
    async (messageId: string, status: "pending" | "sent" | "failed") => {
      const newQueue = queue.map((msg) =>
        msg.id === messageId ? { ...msg, status } : msg
      );
      setQueue(newQueue);

      try {
        await setData("voiceQueue", newQueue);
      } catch (error) {
        console.error("Failed to update message status:", error);
      }
    },
    [queue, setData]
  );

  /**
   * Increment retry count
   */
  const incrementRetries = useCallback(
    async (messageId: string) => {
      const newQueue = queue.map((msg) =>
        msg.id === messageId ? { ...msg, retries: msg.retries + 1 } : msg
      );
      setQueue(newQueue);

      try {
        await setData("voiceQueue", newQueue);
      } catch (error) {
        console.error("Failed to increment retries:", error);
      }
    },
    [queue, setData]
  );

  /**
   * Get pending messages
   */
  const getPendingMessages = useCallback(() => {
    return queue.filter((msg) => msg.status === "pending" && msg.retries < 3);
  }, [queue]);

  /**
   * Get failed messages
   */
  const getFailedMessages = useCallback(() => {
    return queue.filter((msg) => msg.status === "failed" || msg.retries >= 3);
  }, [queue]);

  /**
   * Clear queue
   */
  const clearQueue = useCallback(async () => {
    setQueue([]);
    try {
      await removeData("voiceQueue");
    } catch (error) {
      console.error("Failed to clear voice queue:", error);
    }
  }, [removeData]);

  /**
   * Sync queue with server (when online)
   */
  const syncQueue = useCallback(
    async (onSyncMessage: (message: QueuedVoiceMessage) => Promise<void>) => {
      if (isSyncing || !isOnline) return;

      setIsSyncing(true);
      const pendingMessages = getPendingMessages();

      for (const message of pendingMessages) {
        try {
          await onSyncMessage(message);
          await updateStatus(message.id, "sent");
        } catch (error) {
          console.error("Failed to sync voice message:", error);
          await incrementRetries(message.id);

          // Mark as failed after 3 retries
          if (message.retries >= 2) {
            await updateStatus(message.id, "failed");
          }
        }
      }

      setIsSyncing(false);
    },
    [isSyncing, isOnline, getPendingMessages, updateStatus, incrementRetries]
  );

  return {
    queue,
    isOnline,
    isSyncing,
    addToQueue,
    removeFromQueue,
    updateStatus,
    incrementRetries,
    getPendingMessages,
    getFailedMessages,
    clearQueue,
    syncQueue,
  };
}
