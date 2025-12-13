"use client";

import { useState } from "react";
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
  MoreHorizontal,
  Eye,
  Trash2,
  Settings
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

export default function PDFProcessing() {
  const [files, setFiles] = useState<PDFFile[]>([
    {
      id: "1",
      name: "ban-tin-biwase-thang-11-nam-2025.pdf",
      size: "2.4 MB",
      status: "completed",
      uploadDate: "2025-12-13 18:30:00",
      sourceUrl: "https://biwase.com.vn/ban-tin-biwase-thang-11",
      markdownUrl: "/api/download/ban-tin-biwase-thang-11-nam-2025.md",
      pages: 8,
      language: "Vietnamese",
      quality: "high"
    },
    {
      id: "2",
      name: "ban-tin-biwase-thang-10-nam-2025.pdf",
      size: "2.1 MB",
      status: "processing",
      uploadDate: "2025-12-13 18:25:00",
      sourceUrl: "https://biwase.com.vn/ban-tin-biwase-thang-10",
      pages: 7,
      language: "Vietnamese",
      quality: "high"
    },
    {
      id: "3",
      name: "ban-tin-biwase-thang-9-nam-2025.pdf",
      size: "1.8 MB",
      status: "error",
      uploadDate: "2025-12-13 18:20:00",
      sourceUrl: "https://biwase.com.vn/ban-tin-biwase-thang-9",
      pages: 0,
      language: "Vietnamese",
      quality: "medium"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || file.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-50 border-green-200";
      case "processing": return "text-blue-600 bg-blue-50 border-blue-200";
      case "error": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "processing": return <RefreshCw className="w-4 h-4 animate-spin" />;
      case "error": return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const selectAllFiles = () => {
    setSelectedFiles(
      selectedFiles.length === filteredFiles.length 
        ? [] 
        : filteredFiles.map(f => f.id)
    );
  };

  const processSelectedFiles = () => {
    console.log("Processing files:", selectedFiles);
  };

  const deleteSelectedFiles = () => {
    setFiles(prev => prev.filter(f => !selectedFiles.includes(f.id)));
    setSelectedFiles([]);
  };

  return (
    <div className="p-6 h-full overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF Processing</h1>
        <p className="text-gray-600">Manage PDF files and convert to markdown for RAG processing</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total PDFs</p>
              <p className="text-3xl font-bold text-gray-900">{files.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Processed</p>
              <p className="text-3xl font-bold text-green-600">
                {files.filter(f => f.status === "completed").length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Processing</p>
              <p className="text-3xl font-bold text-blue-600">
                {files.filter(f => f.status === "processing").length}
              </p>
            </div>
            <RefreshCw className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Errors</p>
              <p className="text-3xl font-bold text-red-600">
                {files.filter(f => f.status === "error").length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search PDFs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Upload className="w-4 h-4" />
              Upload PDFs
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Process All
            </button>
          </div>
        </div>
      </div>

      {/* Batch Actions */}
      {selectedFiles.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-blue-900 font-medium">
              {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={processSelectedFiles}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Process
              </button>
              <button
                onClick={deleteSelectedFiles}
                className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Files Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                    onChange={selectAllFiles}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pages
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quality
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => toggleFileSelection(file.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4">
                    <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border", getStatusColor(file.status))}>
                      {getStatusIcon(file.status)}
                      {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {file.size}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {file.pages || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                      file.quality === "high" ? "bg-green-100 text-green-800" :
                      file.quality === "medium" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    )}>
                      {file.quality}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {file.uploadDate}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Eye className="w-4 h-4" />
                      </button>
                      {file.markdownUrl && (
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Processing Pipeline Info */}
      <div className="mt-8 bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Pipeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900">Upload</h4>
            <p className="text-sm text-gray-600">PDF files uploaded and validated</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <RefreshCw className="w-6 h-6 text-yellow-600" />
            </div>
            <h4 className="font-medium text-gray-900">Extract</h4>
            <p className="text-sm text-gray-600">Text extraction with OCR fallback</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900">Convert</h4>
            <p className="text-sm text-gray-600">Markdown conversion and cleaning</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900">Ready</h4>
            <p className="text-sm text-gray-600">Ready for RAG embedding</p>
          </div>
        </div>
      </div>
    </div>
  );
}
