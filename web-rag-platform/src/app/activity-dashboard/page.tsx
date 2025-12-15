"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  FileText,
  Clock,
  Calendar,
  Search,
  MessageSquare,
  Archive,
  Settings,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityStats {
  totalLogs: number;
  totalPages: number;
  mostActivePage: string;
  mostActiveAction: string;
  logsLast24h: number;
  logsLast7d: number;
  logsLast30d: number;
  pageBreakdown: { [page: string]: number };
  actionBreakdown: { [action: string]: number };
  hourlyActivity: { hour: number; count: number }[];
  dailyActivity: { date: string; count: number }[];
}

interface LogEntry {
  timestamp: string;
  page: string;
  action: string;
  data?: Record<string, unknown>;
  session_id?: string;
  user_agent?: string;
}

export default function ActivityDashboard() {
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);

      // Load stats
      const statsResponse = await fetch('http://127.0.0.1:8081/api/logs/stats');
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Load recent logs
      const logsResponse = await fetch(`http://127.0.0.1:8081/api/logs?limit=100`);
      const logsData = await logsResponse.json();

      // Flatten logs from all pages
      const allLogs: LogEntry[] = [];
      Object.values(logsData.logs_by_page || {}).forEach((pageLogs: unknown) => {
        const logs = (pageLogs as { logs?: LogEntry[] }).logs || [];
        allLogs.push(...logs);
      });

      // Sort by timestamp (newest first)
      allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setLogs(allLogs.slice(0, 50)); // Show last 50 logs

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getPageIcon = (page: string) => {
    switch (page.toLowerCase()) {
      case 'crawl-control': return <Settings className="w-4 h-4" />;
      case 'pdf-processing': return <FileText className="w-4 h-4" />;
      case 'rag-search': return <Search className="w-4 h-4" />;
      case 'chat': return <MessageSquare className="w-4 h-4" />;
      case 'personal-archive': return <Archive className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionColor = (action: string) => {
    if (action.includes('started') || action.includes('completed')) return 'text-green-600';
    if (action.includes('failed') || action.includes('error')) return 'text-red-600';
    if (action.includes('paused') || action.includes('stopped')) return 'text-yellow-600';
    return 'text-blue-600';
  };

  if (loading) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading activity dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Dashboard</h1>
          <p className="text-gray-600">Monitor user activity and system usage patterns</p>
        </div>
        <button
          onClick={loadDashboardData}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Activity</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalLogs.toLocaleString()}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Pages</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalPages}</p>
              </div>
              <FileText className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last 24h</p>
                <p className="text-3xl font-bold text-gray-900">{stats.logsLast24h}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last 7 days</p>
                <p className="text-3xl font-bold text-gray-900">{stats.logsLast7d}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Page Activity Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity by Page</h3>
          {stats?.pageBreakdown && (
            <div className="space-y-3">
              {Object.entries(stats.pageBreakdown)
                .sort(([,a], [,b]) => b - a)
                .map(([page, count]) => (
                  <div key={page} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getPageIcon(page)}
                      <span className="text-sm font-medium capitalize">
                        {page.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(count / Math.max(...Object.values(stats.pageBreakdown))) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Action Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Actions</h3>
          {stats?.actionBreakdown && (
            <div className="space-y-3">
              {Object.entries(stats.actionBreakdown)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([action, count]) => (
                  <div key={action} className="flex items-center justify-between">
                    <span className={cn("text-sm font-medium", getActionColor(action))}>
                      {action.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                {getPageIcon(log.page)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {log.page.replace('-', ' ')}
                  </span>
                  <span className={cn("text-xs px-2 py-1 rounded", getActionColor(log.action))}>
                    {log.action.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {formatTimestamp(log.timestamp)}
                </p>
                {log.data && Object.keys(log.data).length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    {Object.entries(log.data).slice(0, 3).map(([key, value]) => (
                      <span key={key} className="mr-3">
                        <strong>{key}:</strong> {String(value).length > 20 ? String(value).substring(0, 20) + '...' : String(value)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
