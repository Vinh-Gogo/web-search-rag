"use client";

import { useBreakpoint } from "@/hooks/useMediaQuery";
import { ReactNode, useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MessageCircle, Bug, Wrench, X, ChevronDown } from "lucide-react";

type TabType = "chat" | "debug" | "tools";

interface ResponsiveLayoutProps {
  children: ReactNode;
  inspectorContent?: ReactNode;
  debugContent?: ReactNode;
  toolsContent?: ReactNode;
  className?: string;
}

// Touch gesture handler hook
function useTouchGestures(onSwipeRight?: () => void, onSwipeLeft?: () => void) {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    handleSwipe();
  };

  const handleSwipe = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return { handleTouchStart, handleTouchEnd };
}

interface ResponsiveLayoutProps {
  children: ReactNode;
  inspectorContent?: ReactNode;
  debugContent?: ReactNode;
  toolsContent?: ReactNode;
  className?: string;
}

// Tab navigation component
function TabNavigation({
  activeTab,
  onTabChange,
}: {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}) {
  return (
    <div className="flex items-center gap-0 border-b border-gray-200 bg-white">
      {[
        { id: "chat" as TabType, label: "Chat", icon: MessageCircle },
        { id: "debug" as TabType, label: "Debug", icon: Bug },
        { id: "tools" as TabType, label: "Tools", icon: Wrench },
      ].map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              // Touch-friendly minimum height on mobile
              "min-h-[48px] md:min-h-[auto]",
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900 active:bg-gray-100"
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Inspector panel component
function InspectorPanel({
  inspectorContent,
  isDesktop,
  isTablet,
  inspectorOpen,
  onClose,
}: {
  inspectorContent: ReactNode;
  isDesktop: boolean;
  isTablet: boolean;
  inspectorOpen: boolean;
  onClose: () => void;
}) {
  if (!inspectorContent) return null;

  if (isDesktop) {
    // Desktop: fixed sidebar
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        {inspectorContent}
      </div>
    );
  }

  if (isTablet) {
    // Tablet: modal overlay
    if (!inspectorOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Inspector</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
            {inspectorContent}
          </div>
        </div>
      </div>
    );
  }

  // Mobile: bottom sheet
  if (!inspectorOpen) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
          <h3 className="font-semibold">Inspector</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
        {inspectorContent}
      </div>
    </div>
  );
}

// Main content area with single scroll and touch gestures
function MainContent({
  mainChildren,
  debugContent,
  toolsContent,
  inspectorContent,
  isDesktop,
  activeTab,
  onTabChange,
  onInspectorOpen,
}: {
  mainChildren: ReactNode;
  debugContent?: ReactNode;
  toolsContent?: ReactNode;
  inspectorContent?: ReactNode;
  isDesktop: boolean;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onInspectorOpen: () => void;
}) {
  // Tab swipe logic
  const tabs: TabType[] = ["chat", "debug", "tools"];
  const currentTabIndex = tabs.indexOf(activeTab);

  const handleSwipeRight = () => {
    const previousTab = currentTabIndex - 1;
    if (previousTab >= 0) {
      onTabChange(tabs[previousTab]);
    }
  };

  const handleSwipeLeft = () => {
    const nextTab = currentTabIndex + 1;
    if (nextTab < tabs.length) {
      onTabChange(tabs[nextTab]);
    }
  };

  const { handleTouchStart, handleTouchEnd } = useTouchGestures(
    handleSwipeRight,
    handleSwipeLeft
  );

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden"
      onTouchStart={!isDesktop ? handleTouchStart : undefined}
      onTouchEnd={!isDesktop ? handleTouchEnd : undefined}
    >
      {/* Tab navigation for mobile/tablet */}
      {!isDesktop && (
        <TabNavigation activeTab={activeTab} onTabChange={onTabChange} />
      )}

      {/* Single scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        {/* Chat Tab */}
        {(isDesktop || activeTab === "chat") && (
          <div className="h-full">{mainChildren}</div>
        )}

        {/* Debug Tab */}
        {(isDesktop || activeTab === "debug") && activeTab === "debug" && (
          <div className="h-full">
            {debugContent || (
              <div className="flex items-center justify-center h-full text-gray-500">
                Debug information will appear here
              </div>
            )}
          </div>
        )}

        {/* Tools Tab */}
        {(isDesktop || activeTab === "tools") && activeTab === "tools" && (
          <div className="h-full">
            {toolsContent || (
              <div className="flex items-center justify-center h-full text-gray-500">
                Tools will appear here
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile inspector trigger */}
      {!isDesktop && inspectorContent && (
        <div className="bg-white border-t border-gray-200 p-4">
          <button
            onClick={onInspectorOpen}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors min-h-[48px]"
          >
            <Wrench className="w-5 h-5" />
            <span>Open Inspector</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export function ResponsiveLayout({
  children,
  inspectorContent,
  debugContent,
  toolsContent,
  className
}: ResponsiveLayoutProps) {
  const breakpoint = useBreakpoint();
  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const [inspectorOpen, setInspectorOpen] = useState(false);

  const isDesktop = breakpoint === "desktop";
  const isTablet = breakpoint === "tablet";
  const isMobile = breakpoint === "mobile";

  return (
    <div className={cn("flex h-full bg-gray-50", className)}>
      <MainContent
        mainChildren={children}
        debugContent={debugContent}
        toolsContent={toolsContent}
        inspectorContent={inspectorContent}
        isDesktop={isDesktop}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onInspectorOpen={() => setInspectorOpen(true)}
      />
      <InspectorPanel
        inspectorContent={inspectorContent}
        isDesktop={isDesktop}
        isTablet={isTablet}
        inspectorOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
      />

      {/* Desktop inspector toggle */}
      {isDesktop && inspectorContent && (
        <button
          onClick={() => setInspectorOpen(!inspectorOpen)}
          className={cn(
            "fixed top-1/2 right-4 z-40 p-2 bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-all",
            inspectorOpen ? "translate-x-80" : "translate-x-0"
          )}
        >
          <Wrench className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
