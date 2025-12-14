"use client";

import { useState } from "react";
import { 
  FileText, 
  Download, 
  Search, 
  Eye,
  Trash2,
  Calendar,
  HardDrive,
  Clock,
  Star,
  Folder,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ArchivedFile {
  id: string;
  name: string;
  size: string;
  downloadDate: string;
  sourceUrl: string;
  category: string;
  tags: string[];
  views: number;
  starred: boolean;
  filePath: string;
}

interface ArchiveStats {
  totalFiles: number;
  totalSize: string;
  categoriesCount: number;
  recentlyViewed: number;
}

// Initialize sample data outside component to avoid recreating on each render
const getInitialData = () => {
  const sampleFiles: ArchivedFile[] = [
    {
      id: "1",
      name: "ban-tin-biwase-t1-2025-a4.pdf",
      size: "2.4 MB",
      downloadDate: "2025-12-14 10:30:00",
      sourceUrl: "https://biwase.com.vn/ban-tin-biwase-t1-2025",
      category: "2025",
      tags: ["newsletter", "monthly"],
      views: 5,
      starred: true,
      filePath: "/downloads/ban-tin-biwase-t1-2025-a4.pdf"
    },
    {
      id: "2",
      name: "ban-tin-biwase-t12-2024-a4.pdf",
      size: "2.1 MB",
      downloadDate: "2025-12-14 09:15:00",
      sourceUrl: "https://biwase.com.vn/ban-tin-biwase-t12-2024",
      category: "2024",
      tags: ["newsletter", "quarterly"],
      views: 12,
      starred: false,
      filePath: "/downloads/ban-tin-biwase-t12-2024-a4.pdf"
    },
    {
      id: "3",
      name: "ban-tin-biwase-q4-2023.pdf",
      size: "1.8 MB",
      downloadDate: "2025-12-13 16:45:00",
      sourceUrl: "https://biwase.com.vn/ban-tin-biwase-q4-2023",
      category: "2023",
      tags: ["quarterly", "summary"],
      views: 8,
      starred: true,
      filePath: "/downloads/ban-tin-biwase-q4-2023.pdf"
    },
    {
      id: "4",
      name: "ban-tin-biwase-annual-2022.pdf",
      size: "3.2 MB",
      downloadDate: "2025-12-13 14:20:00",
      sourceUrl: "https://biwase.com.vn/ban-tin-biwase-annual-2022",
      category: "2022",
      tags: ["annual", "report"],
      views: 15,
      starred: false,
      filePath: "/downloads/ban-tin-biwase-annual-2022.pdf"
    }
  ];

  const totalSize = sampleFiles.reduce((acc, file) => {
    return acc + parseFloat(file.size);
  }, 0);

  const stats: ArchiveStats = {
    totalFiles: sampleFiles.length,
    totalSize: `${totalSize.toFixed(1)} MB`,
    categoriesCount: 4,
    recentlyViewed: sampleFiles.filter(f => f.views > 0).length
  };

  return { files: sampleFiles, stats };
};

export default function PersonalArchive() {
  const initialData = getInitialData();
  const [files, setFiles] = useState<ArchivedFile[]>(initialData.files);
  const [stats, setStats] = useState<ArchiveStats>(initialData.stats);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || 
                           (selectedCategory === 'starred' && file.starred) ||
                           file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const toggleStar = (fileId: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, starred: !f.starred } : f
    ));
  };

  const openFile = (file: ArchivedFile) => {
    window.open(file.filePath, '_blank');
  };

  return (
    <div className="p-6 h-full overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Personal Archive</h1>
        <p className="text-gray-600">Manage your downloaded PDF files and documents</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Files</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalFiles}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Storage Used</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalSize}</p>
            </div>
            <HardDrive className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-3xl font-bold text-gray-900">{stats.categoriesCount}</p>
            </div>
            <Folder className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Activity</p>
              <p className="text-3xl font-bold text-gray-900">{stats.recentlyViewed}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="starred">Starred</option>
          </select>
        </div>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredFiles.map((file) => (
          <div key={file.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedFiles.includes(file.id)}
                  onChange={() => toggleFileSelection(file.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <FileText className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleStar(file.id)}
                  className={cn(
                    "p-1 rounded",
                    file.starred 
                      ? "text-yellow-500 hover:text-yellow-600" 
                      : "text-gray-400 hover:text-yellow-500"
                  )}
                >
                  <Star className="w-4 h-4" fill={file.starred ? "currentColor" : "none"} />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="mb-3">
              <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
                {file.name}
              </h3>
              <p className="text-xs text-gray-500 mb-2">{file.size}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {file.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>{new Date(file.downloadDate).toLocaleDateString()}</span>
              <span>{file.views} views</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => openFile(file)}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              >
                <Eye className="w-3 h-3" />
                View
              </button>
              <button className="flex items-center justify-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">
                <Download className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
