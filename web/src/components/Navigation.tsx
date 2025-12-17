// web\src\components\Navigation.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Search,
  FileText,
  Database,
  MessageCircle,
  Settings,
  History,
  Archive,
  BarChart3,
  Menu,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Star,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

const navigation = [
  {
    name: "Crawl Control",
    href: "/",
    icon: Search,
    description: "Web scraping dashboard",
    gradient: "from-blue-500 via-cyan-500 to-blue-600",
  },
  {
    name: "PDF Processing",
    href: "/pdfs",
    icon: FileText,
    description: "PDF to Markdown pipeline",
    gradient: "from-purple-500 via-pink-500 to-purple-600",
  },
  {
    name: "Personal Archive",
    href: "/archive",
    icon: Archive,
    description: "Manage downloaded files",
    gradient: "from-amber-500 via-orange-500 to-amber-600",
  },
  {
    name: "Activity Dashboard",
    href: "/activity-dashboard",
    icon: BarChart3,
    description: "Monitor user activity",
    gradient: "from-emerald-500 via-teal-500 to-emerald-600",
  },
  {
    name: "RAG Query",
    href: "/rag",
    icon: Database,
    description: "Vector search interface",
    gradient: "from-indigo-500 via-violet-500 to-indigo-600",
  },
  {
    name: "AI Chat",
    href: "/chat",
    icon: MessageCircle,
    description: "AI Agent messaging",
    gradient: "from-fuchsia-500 via-pink-500 to-fuchsia-600",
  },
];

const tools = [
  {
    name: "History",
    href: "/history",
    icon: History,
    gradient: "from-gray-500 via-gray-400 to-gray-600",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    gradient: "from-blue-500 via-blue-400 to-blue-600",
  },
];

export function Navigation() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeGradient, setActiveGradient] = useState("");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch and stabilize during hot reload
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is ready and prevent hot reload flicker
    const timer = setTimeout(() => {
      requestAnimationFrame(() => setMounted(true));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Generate stable random values for particles (lazy initializer runs once)
  const [particleStyles] = useState(() =>
    [...Array(15)].map((_, i) => ({
      width: Math.random() * 8 + 2,
      height: Math.random() * 8 + 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 5,
      animationDuration: Math.random() * 10 + 10,
      colorClass:
        i % 3 === 0
          ? "bg-blue-400"
          : i % 3 === 1
            ? "bg-purple-400"
            : "bg-cyan-400",
    }))
  );

  // Track mouse position for interactive background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Detect mobile screen size and close sidebar on desktop transition
  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 1024;
      setIsMobile(newIsMobile);
      if (isMobile && !newIsMobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile, sidebarOpen]);

  // Handle escape key to close mobile sidebar
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const closeMobileSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile sidebar overlay - only visible on mobile when open */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-gradient-to-br from-black/80 via-black/60 to-transparent z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.1)_0%,transparent_40%)]"
            style={
              {
                "--mouse-x": `${mousePosition.x}px`,
                "--mouse-y": `${mousePosition.y}px`,
              } as React.CSSProperties
            }
          />
        </div>
      )}

      {/* Sidebar - Responsive behavior with attractive background */}
      <aside
        className={cn(
          "flex flex-col transition-all duration-300 shadow-xl flex-shrink-0 h-screen z-50",
          // Mobile behavior
          isMobile
            ? sidebarOpen
              ? "fixed left-0 top-0 w-72"
              : "-translate-x-full"
            : "relative",
          // Desktop behavior
          !isMobile && collapsed ? "w-20" : "w-72",
          "block" // Simplified - let parent container handle responsive behavior
        )}
        style={{
          background:
            mounted && theme === "dark"
              ? `linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)`
              : `linear-gradient(160deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)`,
          borderRight:
            mounted && theme === "dark"
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.1)",
          backgroundImage:
            mounted && theme === "dark"
              ? `radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 20%),
               radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 20%),
               linear-gradient(rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.03))`
              : `radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 20%),
               radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.05) 0%, transparent 20%),
               linear-gradient(rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.02))`,
          backdropFilter: "blur(10px)",
          transition: "background 0.3s ease, border-color 0.3s ease",
        }}
      >
        {/* Interactive background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.05)_0%,transparent_30%)] transition-all duration-100"
            style={
              {
                "--mouse-x": `${mousePosition.x}px`,
                "--mouse-y": `${mousePosition.y}px`,
              } as React.CSSProperties
            }
          />

          {/* Floating particles */}
          {particleStyles.map((style, i) => (
            <div
              key={i}
              className={cn(
                "absolute rounded-full opacity-20 animate-float",
                style.colorClass
              )}
              style={{
                width: `${style.width}px`,
                height: `${style.height}px`,
                left: `${style.left}%`,
                top: `${style.top}%`,
                animationDelay: `${style.animationDelay}s`,
                animationDuration: `${style.animationDuration}s`,
              }}
            />
          ))}
        </div>

        {/* Glass effect overlay */}
        <div
          className="absolute inset-0 backdrop-blur-sm transition-all duration-300"
          style={{
            background:
              mounted && theme === "dark"
                ? "linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4))"
                : "linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.5))",
          }}
        />



        {/* Main Navigation with gradient backgrounds */}
        <nav
          className={cn(
            "flex-1 overflow-y-auto space-y-3 relative",
            collapsed && !isMobile ? "px-2 py-4" : "p-6"
          )}
        >
          <div className="space-y-2 relative">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const isHovered = activeGradient === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={false}
                  onMouseEnter={() => setActiveGradient(item.href)}
                  onMouseLeave={() => setActiveGradient("")}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-300 group overflow-hidden",
                    collapsed && !isMobile
                      ? "justify-center px-2 py-2.5 h-12"
                      : "px-4 py-3",
                    isActive || isHovered
                      ? mounted && theme === "dark"
                        ? "text-white shadow-lg"
                        : "text-gray-900 shadow-lg"
                      : mounted && theme === "dark"
                        ? "text-blue-100 hover:text-white hover:shadow-md"
                        : "text-gray-700 hover:text-gray-900 hover:shadow-md"
                  )}
                  onClick={() => {
                    console.log(`Navigating to: ${item.href}`);
                    closeMobileSidebar();
                  }}
                  style={{
                    background:
                      isActive || isHovered
                        ? mounted && theme === "dark"
                          ? `linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%), linear-gradient(to right, ${item.gradient})`
                          : `linear-gradient(135deg, rgba(226, 232, 240, 0.8) 0%, rgba(241, 245, 249, 0.9) 100%), linear-gradient(to right, ${item.gradient})`
                        : mounted && theme === "dark"
                          ? "rgba(255, 255, 255, 0.03)"
                          : "rgba(0, 0, 0, 0.02)",
                    backdropFilter: "blur(8px)",
                    border:
                      isActive || isHovered
                        ? mounted && theme === "dark"
                          ? "1px solid rgba(255, 255, 255, 0.2)"
                          : "1px solid rgba(59, 130, 246, 0.3)"
                        : mounted && theme === "dark"
                          ? "1px solid rgba(255, 255, 255, 0.1)"
                          : "1px solid rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {/* Gradient overlay for hover/active states */}
                  {(isActive || isHovered) && (
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: `linear-gradient(45deg, ${item.gradient})`,
                        animation: "gradientShift 8s ease infinite",
                      }}
                    />
                  )}

                  <item.icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0 transition-all duration-300 relative z-10",
                      collapsed && !isMobile && "mx-auto",
                      isActive || isHovered
                        ? mounted && theme === "dark"
                          ? "text-white scale-110"
                          : "text-blue-600 scale-110"
                        : mounted && theme === "dark"
                          ? "text-blue-200 group-hover:text-white"
                          : "text-gray-600 group-hover:text-gray-900"
                    )}
                    style={{
                      filter:
                        isActive || isHovered
                          ? mounted && theme === "dark"
                            ? "drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))"
                            : "drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))"
                          : "none",
                    }}
                  />

                  {!collapsed && !isMobile && (
                    <div className="flex-1 min-w-0 animate-fade-in relative z-10">
                      <div className="font-medium leading-tight flex items-center gap-2">
                        {item.name}
                        {isActive && (
                          <span
                            className={cn(
                              "ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                              mounted && theme === "dark"
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                : "bg-blue-100 text-blue-700 border border-blue-300"
                            )}
                          >
                            Active
                          </span>
                        )}
                      </div>
                      <div
                        className={cn(
                          "text-xs truncate mt-0.5 transition-colors duration-300",
                          mounted && theme === "dark"
                            ? "text-blue-200/80 group-hover:text-blue-100"
                            : "text-gray-600/80 group-hover:text-gray-700"
                        )}
                      >
                        {item.description}
                      </div>
                    </div>
                  )}

                  {/* Animated underline for active item */}
                  {isActive && !collapsed && (
                    <div
                      className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full animate-pulse"
                      style={{
                        background:
                          mounted && theme === "dark"
                            ? "linear-gradient(to right, #60a5fa, #22d3ee)"
                            : "linear-gradient(to right, #2563eb, #0891b2)",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {!collapsed && !isMobile && (
            <div
              className="pt-6 border-t relative mt-4 transition-colors duration-300"
              style={{
                borderColor:
                  mounted && theme === "dark"
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div
                  className="text-xs font-bold text-transparent bg-clip-text uppercase tracking-wider transition-all duration-300"
                  style={{
                    backgroundImage:
                      mounted && theme === "dark"
                        ? "linear-gradient(to right, #93c5fd, #c4b5fd)"
                        : "linear-gradient(to right, #2563eb, #7c3aed)",
                  }}
                >
                  Quick Tools
                </div>
              </div>

              <div className="space-y-2">
                {tools.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={false}
                    className={cn(
                      "relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group",
                      pathname === item.href
                        ? mounted && theme === "dark"
                          ? "text-white bg-white/10 backdrop-blur-sm shadow-lg"
                          : "text-gray-900 bg-blue-50 backdrop-blur-sm shadow-lg"
                        : mounted && theme === "dark"
                          ? "text-blue-200 hover:text-white hover:bg-white/5"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    )}
                    onClick={() => {
                      console.log(`Navigating to tool: ${item.href}`);
                      closeMobileSidebar();
                    }}
                    style={{
                      backdropFilter:
                        pathname === item.href ? "blur(12px)" : "blur(4px)",
                      border:
                        pathname === item.href
                          ? mounted && theme === "dark"
                            ? "1px solid rgba(255, 255, 255, 0.2)"
                            : "1px solid rgba(59, 130, 246, 0.3)"
                          : mounted && theme === "dark"
                            ? "1px solid rgba(255, 255, 255, 0.1)"
                            : "1px solid rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <div
                      className={cn(
                        "p-1.5 rounded-lg transition-all duration-300",
                        pathname === item.href
                          ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20"
                          : mounted && theme === "dark"
                            ? "bg-white/5 group-hover:bg-white/10"
                            : "bg-gray-200/50 group-hover:bg-gray-300/50"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "w-4 h-4 transition-colors duration-300",
                          pathname === item.href
                            ? "text-white"
                            : mounted && theme === "dark"
                              ? "text-blue-200 group-hover:text-white"
                              : "text-gray-600 group-hover:text-gray-900"
                        )}
                      />
                    </div>
                    <span className="font-medium relative z-10">
                      {item.name}
                    </span>

                    {/* Hover effect glow */}
                    {pathname === item.href && (
                      <div
                        className="absolute inset-0 rounded-xl opacity-30"
                        style={{
                          background: `radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)`,
                          boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)",
                        }}
                      />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Footer with AI Agent status - enhanced design */}
        {!collapsed && !isMobile && (
          <div
            className="p-4 pt-2 border-t relative transition-colors duration-300"
            style={{
              borderColor:
                mounted && theme === "dark"
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              className="relative rounded-xl overflow-hidden backdrop-blur-sm transition-all duration-300"
              style={{
                background:
                  mounted && theme === "dark"
                    ? "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)"
                    : "linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(226, 232, 240, 0.9) 100%)",
                boxShadow:
                  mounted && theme === "dark"
                    ? "0 4px 20px rgba(0, 0, 0, 0.3)"
                    : "0 4px 20px rgba(0, 0, 0, 0.1)",
                border:
                  mounted && theme === "dark"
                    ? "1px solid rgba(255, 255, 255, 0.1)"
                    : "1px solid rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* Gradient border effect */}
              <div
                className="absolute inset-0 rounded-xl opacity-80 animate-gradient-shift"
                style={{
                  background:
                    "linear-gradient(45deg, #0ea5e9, #8b5cf6, #22d3ee, #0ea5e9)",
                  backgroundSize: "400% 400%",
                }}
              />
              <div
                className="absolute inset-0.5 rounded-xl backdrop-blur-sm transition-colors duration-300"
                style={{
                  background:
                    mounted && theme === "dark" ? "#0f172a" : "#f8fafc",
                }}
              />

              <div className="relative p-4 flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30"
                    style={{
                      transform: "scale(1.05)",
                      animation: "pulse 2s infinite",
                    }}
                  >
                    <Zap className="w-5 h-5 text-white" />
                  </div>

                  {/* Pulsing status indicator */}
                  <div
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 animate-ping transition-colors duration-300"
                    style={{
                      borderColor:
                        mounted && theme === "dark" ? "#0f172a" : "#f8fafc",
                      boxShadow: "0 0 8px rgba(34, 197, 94, 0.8)",
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-bold bg-clip-text text-transparent transition-all duration-300"
                    style={{
                      backgroundImage:
                        mounted && theme === "dark"
                          ? "linear-gradient(to right, #4ade80, #22d3ee)"
                          : "linear-gradient(to right, #16a34a, #0891b2)",
                    }}
                  >
                    AI Agent
                  </div>
                  <div
                    className={cn(
                      "text-xs font-medium flex items-center gap-1 transition-colors duration-300",
                      mounted && theme === "dark"
                        ? "text-green-400"
                        : "text-green-600"
                    )}
                  >
                    <Star className="w-3 h-3 text-yellow-400" />
                    <span>Ready • Ultra Mode</span>
                  </div>
                </div>

                <button
                  className="p-1.5 rounded-lg transition-colors"
                  style={{
                    background:
                      mounted && theme === "dark"
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(59, 130, 246, 0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      mounted && theme === "dark"
                        ? "rgba(255, 255, 255, 0.2)"
                        : "rgba(59, 130, 246, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      mounted && theme === "dark"
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(59, 130, 246, 0.1)";
                  }}
                  title="Configure AI Agent"
                >
                  <Settings
                    className={cn(
                      "w-4 h-4 transition-colors duration-300",
                      mounted && theme === "dark"
                        ? "text-blue-300"
                        : "text-blue-600"
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Hamburger Menu Button - upgraded design */}
      {isMobile && mounted && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2.5 rounded-xl shadow-lg lg:hidden transition-all duration-300 hover:scale-105 backdrop-blur-sm"
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          style={{
            background:
              theme === "dark"
                ? "linear-gradient(to bottom right, rgba(37, 99, 235, 0.9), rgba(126, 34, 206, 0.9))"
                : "linear-gradient(to bottom right, rgba(59, 130, 246, 0.95), rgba(147, 51, 234, 0.95))",
            border:
              theme === "dark"
                ? "1px solid rgba(255, 255, 255, 0.2)"
                : "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow:
              theme === "dark"
                ? "0 4px 20px rgba(59, 130, 246, 0.4)"
                : "0 4px 20px rgba(59, 130, 246, 0.3)",
          }}
        >
          {sidebarOpen ? (
            <X className="w-6 h-6 text-white drop-shadow-lg" />
          ) : (
            <Menu className="w-6 h-6 text-white drop-shadow-lg" />
          )}
        </button>
      )}

      <style jsx global>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes pulse {
          0% {
            opacity: 1;
            transform: scale(1.05);
          }
          50% {
            opacity: 0.8;
            transform: scale(1);
          }
          100% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-10px) translateX(5px);
            opacity: 0.3;
          }
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0.2;
          }
        }

        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-float {
          animation: float 15s ease-in-out infinite;
        }

        .animate-gradient-shift {
          animation: gradient-shift 8s ease infinite;
        }
      `}</style>
    </>
  );
}
