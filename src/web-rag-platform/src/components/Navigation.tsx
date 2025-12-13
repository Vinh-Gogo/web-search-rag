"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Search, 
  FileText, 
  Database, 
  MessageCircle, 
  Settings,
  History,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Crawl Control", href: "/", icon: Search, description: "Web scraping dashboard" },
  { name: "PDF Processing", href: "/pdfs", icon: FileText, description: "PDF to Markdown pipeline" },
  { name: "RAG Query", href: "/rag", icon: Database, description: "Vector search interface" },
  { name: "AI Chat", href: "/chat", icon: MessageCircle, description: "AI Agent messaging" },
];

const tools = [
  { name: "History", href: "/history", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          "lg:static absolute inset-y-0 left-0 z-40 lg:z-0"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-semibold text-gray-900">RAG Platform</h1>
                <p className="text-xs text-gray-500">Web Search & AI</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50",
                    isCollapsed && "justify-center"
                  )}
                  title={isCollapsed ? item.name : ""}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {item.description}
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {!isCollapsed && (
            <>
              <div className="pt-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Tools
                </div>
                <div className="space-y-1">
                  {tools.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        pathname === item.href
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">AI</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">AI Agent</div>
                <div className="text-xs text-green-600">Ready</div>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <span className="text-white text-sm font-medium">AI</span>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
}
