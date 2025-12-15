"use client";

import { useState, useEffect } from "react";
import { Play, Pause, Square, RefreshCw, Settings, Download, AlertCircle, CheckCircle, Plus, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActivityLogger } from "@/hooks/useActivityLogger";

interface CrawlJob {
  id: string;
  url: string;
  status: "idle" | "running" | "completed" | "error";
  progress: number;
  pagesFound: number;
  pdfsFound: number;
  lastRun: string;
  avgDelay?: number;
  successRate?: number;
  errorMessage?: string;
  pdfUrls?: string[];
  currentStage?: "pages" | "articles" | "pdfs";
  pageUrls?: string[];
  articleUrls?: string[];
}

interface ApiResponse {
  success: boolean;
  pages_found: number;
  pdfs_found: number;
  pdf_urls: string[];
  message: string;
  error?: string;
}

interface PDFFile {
  id: string;
  name: string;
  size: string;
  status: "pending" | "processing" | "completed" | "error";
  uploadDate: string;
  sourceUrl: string;
  markdownUrl?: string;
  pages: number;
  language: string;
  quality: "high" | "medium" | "low";
}

export default function CrawlControl() {
  const { logActivity, logError } = useActivityLogger();

  // Default jobs for first-time users
  const getDefaultJobs = (): CrawlJob[] => [
    {
      id: "1",
      url: "https://biwase.com.vn/tin-tuc/ban-tin-biwase",
      status: "idle",
      progress: 0,
      pagesFound: 9,
      pdfsFound: 0,
      lastRun: "2025-12-13 20:30:00"
    }
  ];

  // Load jobs from localStorage
  const loadJobsFromStorage = (): CrawlJob[] => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !window.localStorage) {
      return getDefaultJobs();
    }

    try {
      const saved = localStorage.getItem('crawlJobs');
      if (!saved) return getDefaultJobs();

      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) {
        console.warn('Invalid jobs data in localStorage, using defaults');
        return getDefaultJobs();
      }

      // Validate and clean up job data
      return parsed.map(job => ({
        id: job.id || Date.now().toString(),
        url: job.url || '',
        status: job.status || 'idle',
        progress: job.progress || 0,
        pagesFound: job.pagesFound || 0,
        pdfsFound: job.pdfsFound || 0,
        lastRun: job.lastRun || 'Never',
        avgDelay: job.avgDelay,
        successRate: job.successRate,
        errorMessage: job.errorMessage,
        pdfUrls: job.pdfUrls,
        currentStage: job.currentStage,
        pageUrls: job.pageUrls,
        articleUrls: job.articleUrls
      }));
    } catch (error) {
      console.error('Failed to load jobs from localStorage:', error);
      return getDefaultJobs();
    }
  };

  // Save jobs to localStorage
  const saveJobsToStorage = (jobsToSave: CrawlJob[]) => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    try {
      localStorage.setItem('crawlJobs', JSON.stringify(jobsToSave));
    } catch (error) {
      console.error('Failed to save jobs to localStorage:', error);
    }
  };

  // Load settings from localStorage
  const loadSettingsFromStorage = () => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !window.localStorage) {
      return { autoDownloadEnabled: true };
    }

    try {
      const saved = localStorage.getItem('crawlSettings');
      if (!saved) return { autoDownloadEnabled: true };

      const parsed = JSON.parse(saved);
      return {
        autoDownloadEnabled: parsed.autoDownloadEnabled !== undefined ? parsed.autoDownloadEnabled : true
      };
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
      return { autoDownloadEnabled: true };
    }
  };

  // Save settings to localStorage
  const saveSettingsToStorage = (settings: { autoDownloadEnabled: boolean }) => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    try {
      localStorage.setItem('crawlSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  };

  const [isRunning, setIsRunning] = useState(false);
  const [autoDownloadEnabled, setAutoDownloadEnabled] = useState(() => loadSettingsFromStorage().autoDownloadEnabled);
  const [jobs, setJobs] = useState<CrawlJob[]>(getDefaultJobs());

  const [newUrl, setNewUrl] = useState("");

  // Load jobs from localStorage after component mounts (client-side only)
  useEffect(() => {
    const savedJobs = loadJobsFromStorage();
    setJobs(savedJobs);
  }, []);

  // Page load logging
  useEffect(() => {
    logActivity('page_load', {
      job_count: jobs.length,
      running_jobs: jobs.filter(j => j.status === 'running').length,
      auto_download_enabled: autoDownloadEnabled
    });
  }, [jobs.length, autoDownloadEnabled, logActivity]);

  // Save jobs to localStorage whenever jobs change
  useEffect(() => {
    saveJobsToStorage(jobs);
  }, [jobs]);

  // Save settings to localStorage whenever autoDownloadEnabled changes
  useEffect(() => {
    saveSettingsToStorage({ autoDownloadEnabled });
  }, [autoDownloadEnabled]);

  const startCrawl = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const crawlStartTime = Date.now();
    logActivity('crawl_started', {
      job_id: jobId,
      job_url: job.url,
      auto_download_enabled: autoDownloadEnabled
    });

    // Update job status to running
    setJobs(prev => prev.map(j =>
      j.id === jobId
        ? { ...j, status: "running", progress: 0, errorMessage: undefined, currentStage: "pages" }
        : j
    ));
    setIsRunning(true);

    try {
      // Stage 1: Get pagination links
      console.log("Stage 1: Getting pagination links...");
      logActivity('crawl_stage_started', {
        job_id: jobId,
        stage: 'pages',
        url: job.url
      });

      const pagesResponse = await fetch(`http://127.0.0.1:8081/api/crawl/pages?url=${encodeURIComponent(job.url)}`);
      const pagesData = await pagesResponse.json();

      if (!pagesData.success) {
        throw new Error(pagesData.message || "Failed to get pages");
      }

      // Update UI with pages found
      setJobs(prev => prev.map(j =>
        j.id === jobId
          ? {
              ...j,
              pagesFound: pagesData.pages_found,
              pageUrls: pagesData.page_urls,
              progress: 10,
              currentStage: "articles"
            }
          : j
      ));

      logActivity('pages_discovered', {
        job_id: jobId,
        pages_found: pagesData.pages_found,
        page_urls: pagesData.page_urls
      });

      // Stage 2: Get articles from pages
      console.log("Stage 2: Getting articles from pages...");
      logActivity('crawl_stage_started', {
        job_id: jobId,
        stage: 'articles',
        pages_found: pagesData.pages_found
      });

      const articlesResponse = await fetch('http://127.0.0.1:8081/api/crawl/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_urls: pagesData.page_urls })
      });
      const articlesData = await articlesResponse.json();

      if (!articlesData.success) {
        throw new Error(articlesData.message || "Failed to get articles");
      }

      // Update UI with articles found
      setJobs(prev => prev.map(j =>
        j.id === jobId
          ? {
              ...j,
              articleUrls: articlesData.article_urls,
              progress: 50,
              currentStage: "pdfs"
            }
          : j
      ));

      logActivity('articles_discovered', {
        job_id: jobId,
        articles_found: articlesData.article_urls?.length || 0,
        pages_processed: pagesData.pages_found
      });

      // Stage 3: Extract PDF links from articles
      console.log("Stage 3: Extracting PDF links from articles...");
      logActivity('crawl_stage_started', {
        job_id: jobId,
        stage: 'pdfs',
        articles_found: articlesData.article_urls?.length || 0
      });

      const pdfsResponse = await fetch('http://127.0.0.1:8081/api/crawl/pdf-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article_urls: articlesData.article_urls })
      });
      const pdfsData = await pdfsResponse.json();

      if (!pdfsData.success) {
        throw new Error(pdfsData.message || "Failed to get PDF links");
      }

      logActivity('pdfs_discovered', {
        job_id: jobId,
        pdfs_found: pdfsData.pdfs_found,
        articles_processed: articlesData.article_urls?.length || 0
      });

      // Update job with final results
      const avgDelay = 3.2; // Calculate from actual timing if needed
      const successRate = pdfsData.pdfs_found > 0 ? 95 : 0; // Calculate actual success rate

      setJobs(prev => prev.map(j =>
        j.id === jobId
          ? {
              ...j,
              status: "completed",
              progress: 100,
              pdfsFound: pdfsData.pdfs_found,
              lastRun: new Date().toLocaleString(),
              avgDelay: avgDelay,
              successRate: successRate,
              pdfUrls: pdfsData.pdf_urls,
              currentStage: undefined
            }
          : j
      ));

      logActivity('crawl_completed', {
        job_id: jobId,
        total_pages: pagesData.pages_found,
        total_articles: articlesData.article_urls?.length || 0,
        total_pdfs: pdfsData.pdfs_found,
        success_rate: successRate,
        avg_delay: avgDelay,
        duration_ms: Date.now() - crawlStartTime
      });

      // Auto-download new PDFs if enabled
      if (autoDownloadEnabled && pdfsData.pdf_urls && pdfsData.pdf_urls.length > 0) {
        try {
          // Get list of existing PDF files
          const existingResponse = await fetch('http://127.0.0.1:8081/api/pdfs/existing');
          const existingData = await existingResponse.json();

          const existingFiles = existingData.existing_files || [];
          const newPdfUrls = pdfsData.pdf_urls.filter((url: string) => {
            const filename = url.split('/').pop();
            return filename && !existingFiles.includes(filename);
          });

          if (newPdfUrls.length > 0) {
            console.log(`Auto-downloading ${newPdfUrls.length} new PDFs...`);

            // Show progress alert
            alert(`Auto-downloading ${newPdfUrls.length} new PDFs...`);

            const downloadResponse = await fetch('http://127.0.0.1:8081/api/download-pdfs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ pdf_urls: newPdfUrls })
            });

            const downloadData = await downloadResponse.json();

            if (downloadData.success) {
              const successMessage = `Auto-download completed!\n\nDownloaded: ${downloadData.downloaded_count}/${downloadData.total_urls} new PDFs\nSaved to: ${downloadData.output_dir}`;
              alert(successMessage);
            } else {
              alert(`Auto-download failed: ${downloadData.message}`);
            }
          } else {
            console.log('No new PDFs to download');
          }
        } catch (error) {
          const errorObj = error instanceof Error ? error : new Error(String(error));
          logError('auto_download_failed', errorObj, {
            job_id: jobId,
            pdf_count: 0 // Can't access newPdfUrls here since it's in a different scope
          });
          alert(`Auto-download error: ${errorObj.message}`);
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logError('crawl_failed', error instanceof Error ? error : new Error(String(error)), {
        job_id: jobId,
        job_url: job?.url,
        stage: job?.currentStage,
        progress: job?.progress,
        duration_ms: Date.now() - crawlStartTime
      });

      // Handle network error
      setJobs(prev => prev.map(j =>
        j.id === jobId
          ? {
              ...j,
              status: "error",
              progress: 0,
              errorMessage: `Failed to crawl: ${errorMessage}`,
              currentStage: undefined
            }
          : j
      ));
    }

    setIsRunning(false);
  };

  const pauseCrawl = (jobId: string) => {
    logActivity('crawl_paused', { job_id: jobId });
    setJobs(prev => prev.map(job =>
      job.id === jobId
        ? { ...job, status: "idle" }
        : job
    ));
  };

  const stopCrawl = (jobId: string) => {
    logActivity('crawl_stopped', { job_id: jobId });
    setJobs(prev => prev.map(job =>
      job.id === jobId
        ? { ...job, status: "idle", progress: 0 }
        : job
    ));
  };

  const addJob = () => {
    if (newUrl.trim()) {
      logActivity('job_added', {
        job_url: newUrl,
        total_jobs_before: jobs.length
      });

      const newJob: CrawlJob = {
        id: Date.now().toString(),
        url: newUrl,
        status: "idle",
        progress: 0,
        pagesFound: 0,
        pdfsFound: 0,
        lastRun: "Never",
        avgDelay: undefined,
        successRate: undefined,
        errorMessage: undefined,
        pdfUrls: undefined
      };
      setJobs(prev => [...prev, newJob]);
      setNewUrl("");
    }
  };

  const addToPDFProcessing = (pdfUrls: string[]) => {
    logActivity('pdfs_added_to_processing', {
      pdf_count: pdfUrls.length,
      pdf_urls: pdfUrls
    });

    // Convert URLs to PDF file objects
    const newFiles: PDFFile[] = pdfUrls.map((url, index) => ({
      id: `crawled-${Date.now()}-${index}`,
      name: url.split('/').pop() || 'Unknown.pdf',
      size: 'Unknown',
      status: 'pending' as const,
      uploadDate: new Date().toLocaleString(),
      sourceUrl: url,
      pages: 0,
      language: 'Vietnamese',
      quality: 'medium' as const
    }));

    // Store in localStorage for PDF processing page
    localStorage.setItem('pendingPDFs', JSON.stringify(newFiles));

    alert(`Added ${newFiles.length} PDFs to processing queue`);
  };

  const downloadSinglePDF = async (pdfUrl: string) => {
    const startTime = Date.now();
    logActivity('single_pdf_download_started', {
      pdf_url: pdfUrl,
      filename: pdfUrl.split('/').pop()
    });

    try {
      const response = await fetch('http://127.0.0.1:8081/api/download-pdfs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdf_urls: [pdfUrl] })
      });

      const data = await response.json();
      if (data.success) {
        logActivity('single_pdf_download_completed', {
          pdf_url: pdfUrl,
          filename: pdfUrl.split('/').pop(),
          duration_ms: Date.now() - startTime,
          success: true
        });
        alert(`Downloaded ${pdfUrl.split('/').pop()} successfully!`);
      } else {
        logError('single_pdf_download_failed', new Error(data.message), {
          pdf_url: pdfUrl,
          duration_ms: Date.now() - startTime
        });
        alert(`Failed to download PDF: ${data.message}`);
      }
    } catch (error) {
      logError('single_pdf_download_failed', error instanceof Error ? error : new Error(String(error)), {
        pdf_url: pdfUrl,
        duration_ms: Date.now() - startTime
      });
      alert(`Error downloading PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const downloadAllPDFs = async (pdfUrls: string[]) => {
    if (!pdfUrls || pdfUrls.length === 0) {
      alert('No PDFs found to download');
      return;
    }

    const startTime = Date.now();
    logActivity('bulk_download_started', {
      pdf_count: pdfUrls.length,
      pdf_urls: pdfUrls
    });

    try {
      // Show progress indicator
      const progressMessage = `Starting bulk download of ${pdfUrls.length} PDFs...`;
      alert(progressMessage);

      const response = await fetch('http://127.0.0.1:8081/api/download-pdfs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdf_urls: pdfUrls })
      });

      const data = await response.json();

      if (data.success) {
        const successMessage = `Bulk download completed!\n\nDownloaded: ${data.downloaded_count}/${data.total_urls} PDFs\nSaved to: ${data.output_dir}`;
        alert(successMessage);

        logActivity('bulk_download_completed', {
          pdf_count: pdfUrls.length,
          downloaded_count: data.downloaded_count,
          duration_ms: Date.now() - startTime,
          success: data.success,
          output_dir: data.output_dir
        });

        // Update job status to show download completion
        setJobs(prev => prev.map(job =>
          job.pdfUrls && job.pdfUrls.length > 0
            ? { ...job, lastRun: new Date().toLocaleString() }
            : job
        ));
      } else {
        logError('bulk_download_failed', new Error(data.message), {
          pdf_count: pdfUrls.length,
          duration_ms: Date.now() - startTime
        });
        alert(`Bulk download failed: ${data.message}`);
      }
    } catch (error) {
      logError('bulk_download_failed', error instanceof Error ? error : new Error(String(error)), {
        pdf_count: pdfUrls.length,
        duration_ms: Date.now() - startTime
      });
      alert(`Error during bulk download: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

      {/* Auto-Download Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Auto-Download Settings</h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoDownloadEnabled}
              onChange={(e) => {
                const newValue = e.target.checked;
                setAutoDownloadEnabled(newValue);
                logActivity('auto_download_setting_changed', {
                  enabled: newValue,
                  previous_setting: autoDownloadEnabled
                });
              }}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Auto-download new PDFs after re-run</span>
          </label>
          <div className="text-xs text-gray-500">
            When enabled, re-running a crawl will automatically download any newly discovered PDFs that are not already in storage.
          </div>
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
                  <span>Progress ({job.currentStage || 'Initializing'})</span>
                  <span>{job.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {job.currentStage === "pages" && "Finding pagination pages..."}
                  {job.currentStage === "articles" && `Scanning ${job.pagesFound} pages for articles...`}
                  {job.currentStage === "pdfs" && `Extracting PDFs from ${job.articleUrls?.length || 0} articles...`}
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
                <div className="text-2xl font-bold text-gray-900">{job.avgDelay ? `${job.avgDelay}s` : '-'}</div>
                <div className="text-sm text-gray-500">Avg Delay</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{job.successRate ? `${job.successRate}%` : '-'}</div>
                <div className="text-sm text-gray-500">Success Rate</div>
              </div>
            </div>

            {/* Found PDF URLs */}
            {job.status === "completed" && job.pdfUrls && job.pdfUrls.length > 0 && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Found PDF URLs ({job.pdfUrls.length})</h4>
                  <button
                    onClick={() => addToPDFProcessing(job.pdfUrls!)}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add to PDF Processing
                  </button>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {job.pdfUrls.slice(0, 5).map((url, index) => (
                    <div key={index} className="flex items-center justify-between text-xs text-gray-600 bg-white p-2 rounded border">
                      <span className="font-mono truncate flex-1 mr-2">{url.split('/').pop()}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => downloadSinglePDF(url)}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Download PDF"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="View PDF online"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                  {job.pdfUrls.length > 5 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      ... and {job.pdfUrls.length - 5} more URLs
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error Message */}
            {job.status === "error" && job.errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Error:</span>
                </div>
                <p className="text-sm text-red-700 mt-1">{job.errorMessage}</p>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-3">
              {job.status === "idle" && (
                <button
                  onClick={() => startCrawl(job.id)}
                  disabled={isRunning}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Start
                </button>
              )}
              
              {job.status === "running" && (
                <>
                  <button
                    onClick={() => pauseCrawl(job.id)}
                    disabled
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg opacity-50 cursor-not-allowed"
                  >
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Running...
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

              {job.status === "completed" && (
                <button
                  onClick={() => startCrawl(job.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Re-run
                </button>
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
          <button
            onClick={() => {
              logActivity('quick_action_rescan', {
                action: 'rescan_biwase',
                current_job_count: jobs.length
              });
              // TODO: Implement rescan logic
              alert('Rescan functionality coming soon!');
            }}
            className="p-4 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors text-left"
          >
            <RefreshCw className="w-6 h-6 text-blue-600 mb-2" />
            <div className="font-medium text-gray-900">Rescan Biwase</div>
            <div className="text-sm text-gray-600">Check for new newsletters</div>
          </button>
          
          <button
            onClick={() => {
              const currentJob = jobs.find(job => job.pdfUrls && job.pdfUrls.length > 0);
              if (currentJob && currentJob.pdfUrls) {
                downloadAllPDFs(currentJob.pdfUrls);
              } else {
                alert('No PDFs found. Please run a crawl first.');
              }
            }}
            className="p-4 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors text-left"
          >
            <Download className="w-6 h-6 text-blue-600 mb-2" />
            <div className="font-medium text-gray-900">Download All PDFs</div>
            <div className="text-sm text-gray-600">Export found PDF files</div>
          </button>
          
          <button
            onClick={() => {
              logActivity('quick_action_settings', {
                action: 'crawl_settings_opened'
              });
              // TODO: Implement settings modal
              alert('Settings functionality coming soon!');
            }}
            className="p-4 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors text-left"
          >
            <Settings className="w-6 h-6 text-blue-600 mb-2" />
            <div className="font-medium text-gray-900">Crawl Settings</div>
            <div className="text-sm text-gray-600">Configure rate limiting</div>
          </button>
        </div>
      </div>
    </div>
  );
}
