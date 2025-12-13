"use client";

import { useState } from "react";
import { Play, Pause, Square, RefreshCw, Settings, Download, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CrawlJob {
  id: string;
  url: string;
  status: "idle" | "running" | "completed" | "error";
  progress: number;
  pagesFound: number;
  pdfsFound: number;
  lastRun: string;
}

export default function CrawlControl() {
  const [isRunning, setIsRunning] = useState(false);
  const [jobs, setJobs] = useState<CrawlJob[]>([
    {
      id: "1",
      url: "https://biwase.com.vn/tin-tuc/ban-tin-biwase",
      status: "idle",
      progress: 0,
      pagesFound: 9,
      pdfsFound: 0,
      lastRun: "2025-12-13 20:30:00"
    }
  ]);

  const [newUrl, setNewUrl] = useState("");

  const startCrawl = (jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, status: "running", progress: 0 }
        : job
    ));
    setIsRunning(true);
  };

  const pauseCrawl = (jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, status: "idle" }
        : job
    ));
  };

  const stopCrawl = (jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, status: "idle", progress: 0 }
        : job
    ));
  };

  const addJob = () => {
    if (newUrl.trim()) {
      const newJob: CrawlJob = {
        id: Date.now().toString(),
        url: newUrl,
        status: "idle",
        progress: 0,
        pagesFound: 0,
        pdfsFound: 0,
        lastRun: "Never"
      };
      setJobs(prev => [...prev, newJob]);
      setNewUrl("");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "text-blue-600 bg-blue-50 border-blue-200";
      case "completed": return "text-green-600 bg-green-50 border-green-200";
      case "error": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running": return <RefreshCw className="w-4 h-4 animate-spin" />;
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "error": return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="p-6 h-full overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Crawl Control</h1>
        <p className="text-gray-600">Manage web scraping jobs and monitor progress</p>
      </div>

      {/* Add New Job */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Crawl Job</h2>
        <div className="flex gap-3">
          <input
            type="url"
            placeholder="Enter website URL to crawl..."
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={addJob}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Job
          </button>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Active Jobs</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className={cn("w-2 h-2 rounded-full", isRunning ? "bg-green-500 animate-pulse" : "bg-gray-400")} />
            {isRunning ? "Running" : "Idle"}
          </div>
        </div>

        {jobs.map((job) => (
          <div key={job.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900 truncate">{job.url}</h3>
                <p className="text-sm text-gray-500">Last run: {job.lastRun}</p>
              </div>
              <div className={cn("px-3 py-1 rounded-full text-sm font-medium border", getStatusColor(job.status))}>
                <div className="flex items-center gap-2">
                  {getStatusIcon(job.status)}
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {job.status === "running" && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{job.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{job.pagesFound}</div>
                <div className="text-sm text-gray-500">Pages Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{job.pdfsFound}</div>
                <div className="text-sm text-gray-500">PDFs Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">3.2s</div>
                <div className="text-sm text-gray-500">Avg Delay</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">92%</div>
                <div className="text-sm text-gray-500">Success Rate</div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {job.status === "idle" && (
                <button
                  onClick={() => startCrawl(job.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Start
                </button>
              )}
              
              {job.status === "running" && (
                <>
                  <button
                    onClick={() => pauseCrawl(job.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </button>
                  <button
                    onClick={() => stopCrawl(job.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Square className="w-4 h-4" />
                    Stop
                  </button>
                </>
              )}

              <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              
              <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors text-left">
            <RefreshCw className="w-6 h-6 text-blue-600 mb-2" />
            <div className="font-medium text-gray-900">Rescan Biwase</div>
            <div className="text-sm text-gray-600">Check for new newsletters</div>
          </button>
          
          <button className="p-4 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors text-left">
            <Download className="w-6 h-6 text-blue-600 mb-2" />
            <div className="font-medium text-gray-900">Download All PDFs</div>
            <div className="text-sm text-gray-600">Export found PDF files</div>
          </button>
          
          <button className="p-4 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors text-left">
            <Settings className="w-6 h-6 text-blue-600 mb-2" />
            <div className="font-medium text-gray-900">Crawl Settings</div>
            <div className="text-sm text-gray-600">Configure rate limiting</div>
          </button>
        </div>
      </div>
    </div>
  );
}
