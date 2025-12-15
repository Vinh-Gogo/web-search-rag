"use client";

import React, { useState, useMemo, useCallback } from "react";
import { 
  FileText, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Filter,
  Search,
  Eye,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

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

const PDFViewer = React.memo(({ file, onDownload }: { file: PDFFile; onDownload: (file: PDFFile) => void }) => {
  const [isDownloaded, setIsDownloaded] = useState(file.status === 'completed');
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadAndView = useCallback(async () => {
    setIsDownloading(true);
    try {
      const response = await fetch('http://127.0.0.1:8081/api/download-pdfs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdf_urls: [file.sourceUrl] })
      });
      
      if (response.ok) {
        setIsDownloaded(true);
        onDownload(file);
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  }, [file.sourceUrl, onDownload, file]);

  if (!isDownloaded) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Download Required</h3>
          <p className="text-gray-600 mb-4">You need to download this file before viewing.</p>
          <button
            onClick={downloadAndView}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 mx-auto"
          >
            <Download className="w-4 h-4" />
            {isDownloading ? 'Downloading...' : 'Download & View'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <FileText className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">{file.name}</h3>
        <p className="text-gray-600">PDF Viewer would go here</p>
        <p className="text-sm text-gray-500 mt-2">
          Pages: {file.pages || 'Unknown'} | Quality: {file.quality}
        </p>
        <div className="mt-4 flex gap-2 justify-center">
          <button className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded text-sm">
            <Download className="w-3 h-3" />
            Download PDF
          </button>
          {file.markdownUrl && (
            <button className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-sm">
              <FileText className="w-3 h-3" />
              View Markdown
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

PDFViewer.displayName = 'PDFViewer';

export default function PDFProcessing() {
  // Lazy state initialization for localStorage
  const [files, setFiles] = useState<PDFFile[]>(() => {
    if (typeof window !== 'undefined') {
      const pendingPDFs = localStorage.getItem('pendingPDFs');
      if (pendingPDFs) {
        try {
          const crawledFiles = JSON.parse(pendingPDFs);
          localStorage.removeItem('pendingPDFs');
          return crawledFiles;
        } catch (error) {
          console.error('Failed to parse pendingPDFs:', error);
          return [];
        }
      }
    }
    return [];
  });
  
  const [selectedFile, setSelectedFile] = useState<PDFFile | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'split'>('split');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Memoize filtered files to avoid recalculating on every render
  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === "all" || file.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [files, searchTerm, filterStatus]);

  // Memoize stats calculations
  const stats = useMemo(() => ({
    total: files.length,
    completed: files.filter(f => f.status === "completed").length,
    processing: files.filter(f => f.status === "processing").length,
    errors: files.filter(f => f.status === "error").length
  }), [files]);

  // Memoize status helper functions
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-50 border-green-200";
      case "processing": return "text-blue-600 bg-blue-50 border-blue-200";
      case "error": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "processing": return <RefreshCw className="w-4 h-4 animate-spin" />;
      case "error": return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  }, []);

  // Memoize callbacks to prevent unnecessary re-renders
  const toggleFileSelection = useCallback((fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  }, []);

  const selectAllFiles = useCallback(() => {
    setSelectedFiles(prev =>
      prev.length === filteredFiles.length 
        ? [] 
        : filteredFiles.map(f => f.id)
    );
  }, [filteredFiles]);

  const deleteSelectedFiles = useCallback(() => {
    setFiles(prev => prev.filter(f => !selectedFiles.includes(f.id)));
    setSelectedFiles([]);
    if (selectedFile && selectedFiles.includes(selectedFile.id)) {
      setSelectedFile(null);
    }
  }, [selectedFiles, selectedFile]);

  const handleFileDownload = useCallback((file: PDFFile) => {
    setFiles(prev => prev.map(f => 
      f.id === file.id 
        ? { ...f, status: 'completed' as const, size: '2.4 MB', pages: 8 }
        : f
    ));
  }, []);

  const handleFileClick = useCallback((file: PDFFile) => {
    setSelectedFile(file);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  }, []);

  return (
    <div className="p-6 h-full overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF Processing</h1>
        <p className="text-gray-600">Manage PDF files and convert to markdown for RAG processing</p>
      </div>

      {/* Stats Cards - Using memoized stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total PDFs</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Processed</p>
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Processing</p>
              <p className="text-3xl font-bold text-blue-600">{stats.processing}</p>
            </div>
            <RefreshCw className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Errors</p>
              <p className="text-3xl font-bold text-red-600">{stats.errors}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6 h-[600px]">
        {/* Left Panel - File List */}
        <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search PDFs..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <select
                value={filterStatus}
                onChange={handleFilterChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="w-12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                      onChange={selectAllFiles}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFiles.map((file) => (
                  <tr 
                    key={file.id} 
                    className={cn(
                      "hover:bg-gray-50 cursor-pointer",
                      selectedFile?.id === file.id ? 'bg-blue-50' : ''
                    )}
                    onClick={() => handleFileClick(file)}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.id)}
                        onChange={() => toggleFileSelection(file.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-red-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{file.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {file.sourceUrl}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className={cn("inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border", getStatusColor(file.status))}>
                        {getStatusIcon(file.status)}
                        {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileDownload(file);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileClick(file);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel - PDF Viewer */}
        {viewMode === 'split' && (
          <div className="w-1/2 bg-white rounded-lg border border-gray-200">
            {selectedFile ? (
              <PDFViewer file={selectedFile} onDownload={handleFileDownload} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>Select a PDF file to view</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
