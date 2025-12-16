"use client";

import { useCallback, useRef } from 'react';

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  sessionId: string;
  page: string;
  action: string;
  data: Record<string, unknown>;
  userAgent?: string;
  url?: string;
}

export interface UseActivityLoggerReturn {
  logActivity: (action: string, data?: Record<string, unknown>) => void;
  logError: (action: string, error: Error | string, data?: Record<string, unknown>) => void;
  getSessionLogs: () => ActivityLogEntry[];
  exportLogs: (format?: 'json' | 'csv') => string;
}

const STORAGE_KEY = 'activity_logs';
const MAX_LOGS_PER_PAGE = 500;
const SESSION_ID_KEY = 'activity_session_id';

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getCurrentSessionId(): string {
  if (typeof window === 'undefined') return 'server';

  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

function getCurrentPage(): string {
  if (typeof window === 'undefined') return 'unknown';

  const path = window.location.pathname;
  const pageMap: Record<string, string> = {
    '/': 'crawl-control',
    '/pdfs': 'pdf-processing',
    '/rag': 'rag-query',
    '/chat': 'ai-chat',
    '/archive': 'personal-archive',
  };

  return pageMap[path] || path.replace('/', '').replace('-', ' ') || 'unknown';
}

export function useActivityLogger(): UseActivityLoggerReturn {
  const sessionIdRef = useRef(getCurrentSessionId());

  const saveLogEntry = useCallback((entry: ActivityLogEntry) => {
    if (typeof window === 'undefined') return;

    try {
      const existingLogs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as ActivityLogEntry[];

      // Filter logs for current page and limit count
      const pageLogs = existingLogs.filter(log => log.page === entry.page);
      const otherLogs = existingLogs.filter(log => log.page !== entry.page);

      // Keep only the most recent logs for this page
      const updatedPageLogs = [entry, ...pageLogs].slice(0, MAX_LOGS_PER_PAGE);

      // Combine and save
      const updatedLogs = [...updatedPageLogs, ...otherLogs];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));

      // Also send to backend if available
      fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      }).catch(err => {
        console.warn('Failed to send log to backend:', err);
      });

    } catch (error) {
      console.error('Failed to save activity log:', error);
    }
  }, []);

  const logActivity = useCallback((action: string, data: Record<string, unknown> = {}) => {
    const entry: ActivityLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      sessionId: sessionIdRef.current,
      page: getCurrentPage(),
      action,
      data,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    console.log(`[Activity] ${entry.page}:${entry.action}`, data);
    saveLogEntry(entry);
  }, [saveLogEntry]);

  const logError = useCallback((action: string, error: Error | string, data: Record<string, unknown> = {}) => {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorData = {
      ...data,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    };

    logActivity(`error:${action}`, errorData);
  }, [logActivity]);

  const getSessionLogs = useCallback((): ActivityLogEntry[] => {
    if (typeof window === 'undefined') return [];

    try {
      const logs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as ActivityLogEntry[];
      return logs.filter(log => log.sessionId === sessionIdRef.current);
    } catch {
      return [];
    }
  }, []);

  const exportLogs = useCallback((format: 'json' | 'csv' = 'json'): string => {
    const logs = getSessionLogs();

    if (format === 'csv') {
      const headers = ['timestamp', 'page', 'action', 'data'];
      const csvRows = [
        headers.join(','),
        ...logs.map(log => [
          log.timestamp,
          log.page,
          log.action,
          JSON.stringify(log.data).replace(/"/g, '""')
        ].map(field => `"${field}"`).join(','))
      ];
      return csvRows.join('\n');
    }

    return JSON.stringify(logs, null, 2);
  }, [getSessionLogs]);

  return {
    logActivity,
    logError,
    getSessionLogs,
    exportLogs,
  };
}
