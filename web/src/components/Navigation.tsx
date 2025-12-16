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
  Archive,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Crawl Control",
    href: "/",
    icon: Search,
    description: "Web scraping dashboard",
  },
  {
    name: "PDF Processing",
    href: "/pdfs",
    icon: FileText,
    description: "PDF to Markdown pipeline",
  },
  {
    name: "Personal Archive",
    href: "/archive",
    icon: Archive,
    description: "Manage downloaded files",
  },
  {
    name: "Activity Dashboard",
    href: "/activity-dashboard",
    icon: BarChart3,
    description: "Monitor user activity",
  },
  {
    name: "RAG Query",
    href: "/rag",
    icon: Database,
    description: "Vector search interface",
  },
  {
    name: "AI Chat",
    href: "/chat",
    icon: MessageCircle,
    description: "AI Agent messaging",
  },
];

const tools = [
  { name: "History", href: "/history", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar - Always visible and expanded */}
      <aside
        className={cn(
          "bg-card border-r border-border flex flex-col transition-all duration-300 shadow-sm flex-shrink-0 h-screen w-72",
          // Always visible, no collapse functionality
          "relative z-0"
        )}
      >
        {/* Header - Enhanced Branding */}
        <div className="header-standard px-6 border-b border-border bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-blue-950/20">
          <div className="flex items-center gap-4">
            {/* Enhanced Logo/Icon */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Search className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm">
                <div className="w-full h-full bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Enhanced Branding Text */}
            <div className="animate-fade-in">
              <h1 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-xl tracking-tight">
                RAG Platform
              </h1>
              <p className="text-sm text-muted-foreground font-medium tracking-wide">
                Web Search & AI
              </p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav
          className="flex-1 overflow-y-auto space-y-3"
          style={{ padding: "24px 16px" }}
        >
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={false}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group line-height-[1.5]",
                    isActive
                      ? "bg-[#F0F4F8] text-[#0066CC] border-l-4 border-[#0066CC] shadow-sm"
                      : "text-[#5F6368] hover:bg-[#F0F4F8] hover:text-[#202124]"
                  )}
                  onClick={() => console.log(`Navigating to: ${item.href}`)}
                  style={{
                    paddingLeft: "16px",
                    paddingTop: "12px",
                    paddingBottom: "12px",
                  }}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0 transition-colors",
                      isActive
                        ? "text-[#0066CC]"
                        : "text-[#5F6368] group-hover:text-[#202124]"
                    )}
                    style={{ marginRight: "8px" }}
                  />
                  <div className="flex-1 min-w-0 animate-fade-in">
                    <div className="font-medium leading-tight">{item.name}</div>
                    <div
                      className="text-xs text-[#5F6368] truncate mt-0.5"
                      style={{ lineHeight: "1.5" }}
                    >
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="pt-6 border-t border-border">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              Tools
            </div>
            <div className="space-y-1">
              {tools.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={false}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() =>
                    console.log(`Navigating to tool: ${item.href}`)
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div
            className="flex items-center gap-3 p-4 rounded-xl border shadow-sm"
            style={{
              backgroundColor: "#F0FDFA",
              borderColor: "#D1FAE5",
              marginLeft: "8px",
              marginRight: "8px",
            }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
              style={{
                backgroundColor: "#00C853",
                width: "24px",
                height: "24px",
                whiteSpace: "nowrap",
              }}
              title="AI Agent status: Ready"
            >
              <span className="text-white text-xs font-semibold">R</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium" style={{ color: "#202124" }}>
                AI Agent
              </div>
              <div className="text-xs font-medium" style={{ color: "#00C853" }}>
                Ready
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
