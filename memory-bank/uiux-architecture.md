# RAG Platform UI/UX Architecture Design

**Version**: 1.0  
**Date**: December 16, 2025  
**Status**: Design Reference Document  
**Target Implementation**: Frontend Team

---

## Executive Summary

The RAG Platform interface requires fundamental restructuring to address information overload, poor async transparency, and mobile incompatibility. This document defines a scalable, responsive, and user-centric architecture that separates concerns (chat vs. debug), prioritizes scrolling performance, and provides clear async state visualization.

**Key Principle**: Reduce cognitive load through separation of concerns. Only ONE main scroll area. AI is the truth source for async state.

---

## Part 1: Architectural Overview

### Current Problems & Solutions

| Problem | Impact | Solution |
|---------|--------|----------|
| **Information Overload** | Debugging mixed with chat | Separate channels: Chat (primary), Debug (secondary) |
| **Nested Scrolls** | Poor UX, mobile breaks | Single scroll area in center canvas |
| **Fixed Panels** | Mobile layout fails | Responsive: Fixed → Dock → Modal → Bottom Sheet |
| **Async Opacity** | User confusion | Clear events: Searching → Analyzing → Streaming |
| **No Visual Hierarchy** | Unclear main actions | Redesigned composer, badge system, color tokens |
| **Unvirtualized Lists** | Performance degrades | Implement virtualization for 100+ messages |

---

## Part 2: Layout Architecture

### 2.1 Desktop Layout (1200px+)

```
┌─────────────────────────────────────────────────────────────────┐
│                        HEADER (Sticky)                          │
└─────────────────────────────────────────────────────────────────┘
┌──────┬──────────────────────────────────┬───────────┐
│      │                                  │           │
│ NAV  │       CENTER CANVAS (Main)       │ INSPECTOR │
│      │                                  │ (optional) │
│      │  ┌─ Chat                         │           │
│ Icon │  │  Results                      │ Tool 1    │
│ List │  │  Documents                    │ Settings  │
│      │  │  Debug (Hidden by default)    │           │
│      │  └─                              │           │
│      │                                  │           │
│      │  [Virtual Scroll Area]           │           │
│      │  - Message 1                     │           │
│      │  - Message 2                     │           │
│      │  - Message N                     │           │
│      │                                  │           │
│      │  [Auto-scroll to end when AI    │           │
│      │   streams, unless user scrolled] │           │
├──────┼──────────────────────────────────┼───────────┤
│      │     COMPOSER (Sticky Bottom)     │           │
│      │  [Input area + attachments]      │           │
└──────┴──────────────────────────────────┴───────────┘
```

**Key Measurements:**
- Left Nav: 72px (collapsed, icon-first) → 280px (expanded)
- Right Inspector: 360px (default width, collapsible)
- Header: 88px (standardized sticky header)
- Composer: Variable height (52px min, max 140px with wrapping)
- Center Canvas: Remaining space, single scrollable area

---

### 2.2 Tablet Layout (768px - 1199px)

```
┌─────────────────────────────────────────────────┐
│              HEADER (Sticky)                    │
└─────────────────────────────────────────────────┘
┌──────┬──────────────────────────────────────────┐
│      │                                          │
│ NAV  │     CENTER CANVAS                        │
│      │  [Single scroll area]                    │
│ Icon │  - Chat messages                         │
│ List │  - RAG results (in-canvas)               │
│      │  - Quick inspector toggle                │
│      │                                          │
│      │  [Inspector as side panel                │
│      │   or full-width modal above]             │
├──────┼──────────────────────────────────────────┤
│      │   COMPOSER (Sticky Bottom)               │
│      │   [Input + tools]                        │
└──────┴──────────────────────────────────────────┘
```

**Changes from Desktop:**
- Inspector may be hidden by default (toggle button)
- When opened: Overlays right side or appears as modal
- Nav can collapse to icons only
- Composer remains sticky at bottom

---

### 2.3 Mobile Layout (< 768px)

```
┌──────────────────────────────┐
│   HEADER (Sticky, compact)   │
│   [Logo | Title | Menu]      │
└──────────────────────────────┘
│                              │
│   CENTER CANVAS              │
│   [Scrollable Area]          │
│   - Chat messages            │
│   - RAG results (inline)     │
│   - "Advanced" button        │
│                              │
│ [Inspector as bottom sheet]  │
│ or full-screen modal         │
│                              │
│ [Advanced Tools hidden by    │
│  default, revealed via       │
│  toggle or swipe gesture]    │
│                              │
└──────────────────────────────┘
┌──────────────────────────────┐
│   COMPOSER (Sticky Bottom)   │
│   [Input + send button]      │
└──────────────────────────────┘
┌──────────────────────────────┐
│   BOTTOM TAB BAR             │
│  [Chat | Results | Tools]    │
└──────────────────────────────┘
```

**Mobile-Specific Rules:**
- NO fixed sidebars or overlays blocking content
- NO nested scroll containers (causes iOS scroll jank)
- Composer height NOT fixed (allow natural growth)
- Inspector opens as bottom sheet (swipe to dismiss)
- Tab bar at bottom for navigation
- Tools hidden in "Advanced" menu to reduce cognitive load

---

## Part 3: Scroll Strategy (Critical)

### 3.1 Core Principles

**Principle 1: Single Scroll Area**
- Only ONE scrollable container (center canvas)
- All content (messages, RAG results, documents) flows through it
- Debug logs, tool settings in separate TAB (not nested scroll)

**Principle 2: No Nested Scrolls**
```tsx
// ❌ BAD - Causes UX problems
<div className="flex">
  <div className="overflow-y-auto">Chat messages (SCROLL 1)</div>
  <div className="overflow-y-auto">Tool settings (SCROLL 2)</div>
</div>

// ✅ GOOD - Single scroll area, tabs switch content
<div className="flex">
  <div className="overflow-y-auto">
    {activeTab === 'chat' && <ChatMessages />}
    {activeTab === 'debug' && <DebugLogs />}
    {activeTab === 'docs' && <Documents />}
  </div>
</div>
```

### 3.2 Auto-Scroll Behavior

**Requirements:**
1. When AI streams responses: Auto-scroll to bottom
2. When user manually scrolls up: Pause auto-scroll
3. Show "Jump to latest" button when paused
4. Resume auto-scroll when "Jump" clicked

**Implementation:**
```tsx
// Pseudo-code
const [isUserScrolled, setIsUserScrolled] = useState(false);
const scrollContainerRef = useRef<HTMLDivElement>(null);

const handleScroll = (e: Event) => {
  const container = e.target as HTMLDivElement;
  const isAtBottom = 
    container.scrollHeight - container.scrollTop - container.clientHeight < 100;
  setIsUserScrolled(!isAtBottom);
};

const autoScrollToBottom = () => {
  if (!isUserScrolled && scrollContainerRef.current) {
    scrollContainerRef.current.scrollTop = 
      scrollContainerRef.current.scrollHeight;
  }
};

// Listen to AI streaming events
useEffect(() => {
  aiEmitter.on('response_stream', autoScrollToBottom);
  return () => aiEmitter.off('response_stream', autoScrollToBottom);
}, [isUserScrolled]);
```

### 3.3 Virtualization Strategy

**For long chat histories (100+ messages):**

```tsx
import { FixedSizeList as List } from 'react-window';

const ChatMessageList = ({ messages }) => (
  <List
    height={canvasHeight}
    itemCount={messages.length}
    itemSize={120} // avg height per message
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        <ChatMessage message={messages[index]} />
      </div>
    )}
  </List>
);
```

**Benefits:**
- Only renders visible messages
- Smooth scrolling even with 1000+ messages
- Consistent performance on mobile

### 3.4 Scroll Behavior on Different Devices

**Desktop:**
- Natural mouse wheel scroll
- Jump to bottom button (fixed at scroll position)
- Smooth scroll enabled

**Mobile:**
- Natural touch scroll (no scroll jank)
- Composer moves WITH page (slightly sticky, not rigid)
- Bottom sheet slides up without blocking messages

---

## Part 4: Responsive Design System

### 4.1 Breakpoints & Container Queries

```css
/* Tailwind-based breakpoints */
@media (max-width: 768px) {
  /* Mobile: Single column */
}

@media (min-width: 768px) and (max-width: 1199px) {
  /* Tablet: Layout adjustment */
}

@media (min-width: 1200px) {
  /* Desktop: Full layout */
}

/* Container Queries (for component-level responsiveness) */
@container (max-width: 400px) {
  .chat-message { font-size: 14px; }
}

@container (min-width: 400px) {
  .chat-message { font-size: 16px; }
}
```

### 4.2 Responsive Component Patterns

**Pattern 1: Responsive Inspector**

```tsx
const Inspector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return <BottomSheet isOpen={isOpen}>{/* Tools */}</BottomSheet>;
  }

  return (
    <aside className="w-80 border-l">
      {/* Tools */}
    </aside>
  );
};
```

**Pattern 2: Responsive Composer**

```tsx
const Composer = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className={cn(
      'border-t p-4',
      isMobile ? 'fixed bottom-16 w-full' : 'sticky bottom-0'
    )}>
      <textarea 
        className="w-full resize-none min-h-[52px] max-h-[140px]"
        placeholder="Ask a question..."
      />
    </div>
  );
};
```

**Pattern 3: Tab-Based Content Switching**

```tsx
const CenterCanvas = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'debug' | 'docs'>('chat');

  return (
    <div className="flex flex-col flex-1">
      {/* Tab Bar */}
      <div className="flex gap-2 border-b px-4 py-2">
        {['chat', 'debug', 'docs'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              'px-3 py-1 rounded-md text-sm',
              activeTab === tab ? 'bg-primary text-white' : 'bg-muted'
            )}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'chat' && <ChatMessages />}
        {activeTab === 'debug' && <DebugLogs />}
        {activeTab === 'docs' && <Documents />}
      </div>
    </div>
  );
};
```

---

## Part 5: Async Processing & State Management

### 5.1 AI Event Lifecycle

**The AI emits events; UI listens and renders.**

```
User Input
    ↓
request_received
    ↓
retrieval_started → [Show "Searching documents..."]
    ↓
reasoning_started → [Show "Analyzing..."]
    ↓
response_stream (token 1, 2, 3, ...) → [Stream text, auto-scroll]
    ↓
completed / error → [Show metadata, sources, duration]
```

### 5.2 Event Definitions

```typescript
// Events emitted by AI
type AIEvent = 
  | { type: 'request_received'; requestId: string; query: string }
  | { type: 'retrieval_started'; requestId: string }
  | { type: 'retrieval_progress'; docs: number; elapsed: number }
  | { type: 'reasoning_started'; requestId: string }
  | { type: 'response_stream'; requestId: string; token: string; elapsed: number }
  | { type: 'completed'; requestId: string; duration: number; sources: string[] }
  | { type: 'error'; requestId: string; message: string; code: string };
```

### 5.3 UI State Management (Zustand)

```typescript
interface AsyncState {
  currentRequest: {
    id: string;
    query: string;
    phase: 'idle' | 'retrieval' | 'reasoning' | 'streaming' | 'completed' | 'error';
    progress: { docsFound?: number; elapsed: number };
    response: string;
    sources: string[];
    error?: string;
  };
  
  // Actions
  onRequestReceived: (query: string) => void;
  onPhaseChange: (phase: string) => void;
  onToken: (token: string) => void;
  onCompleted: (sources: string[]) => void;
  onError: (message: string) => void;
}

export const useAsyncStore = create<AsyncState>((set) => ({
  currentRequest: { /* ... */ },
  
  onRequestReceived: (query) => set((state) => ({
    currentRequest: {
      ...state.currentRequest,
      query,
      phase: 'retrieval',
    }
  })),
  
  onToken: (token) => set((state) => ({
    currentRequest: {
      ...state.currentRequest,
      phase: 'streaming',
      response: state.currentRequest.response + token,
    }
  })),
  
  // ... other actions
}));
```

### 5.4 UI Rendering Based on Phase

```tsx
const ChatCanvas = () => {
  const { currentRequest } = useAsyncStore();
  const { phase, response, progress, sources } = currentRequest;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Async Status Indicator */}
      {phase !== 'idle' && (
        <AsyncStatusIndicator
          phase={phase}
          progress={progress}
          elapsed={Math.round(progress.elapsed / 1000)}
        />
      )}

      {/* Chat Messages */}
      <VirtualizedMessageList messages={messages} />

      {/* Streaming Response */}
      {phase === 'streaming' && (
        <AIMessage
          content={response}
          isStreaming={true}
          sources={sources}
        />
      )}

      {/* Completed State */}
      {phase === 'completed' && (
        <AIMessage
          content={response}
          isStreaming={false}
          sources={sources}
          metadata={{
            duration: currentRequest.progress.elapsed,
            docsUsed: currentRequest.progress.docsFound,
          }}
        />
      )}

      {/* Error State */}
      {phase === 'error' && (
        <ErrorMessage
          message={currentRequest.error}
          onRetry={() => handleRetry()}
        />
      )}
    </div>
  );
};
```

---

## Part 6: Visual Hierarchy & Design Tokens

### 6.1 Color System (By Intent)

```css
/* Primary Actions */
--primary: #3b82f6;        /* Main action buttons */
--primary-hover: #2563eb;
--primary-active: #1d4ed8;

/* Async States */
--searching: #f59e0b;      /* Warm orange - retrieval */
--analyzing: #8b5cf6;      /* Purple - reasoning */
--streaming: #10b981;      /* Green - active response */
--completed: #6b7280;      /* Gray - done */

/* Semantic */
--success: #10b981;
--error: #ef4444;
--warning: #f59e0b;
--info: #3b82f6;

/* Content Separation */
--debug-bg: #1e293b;       /* Dark background for debug */
--debug-text: #94a3b8;     /* Muted text for debug */
--chat-bg: #ffffff;        /* Clean white for chat */
--tool-bg: #f1f5f9;        /* Light gray for tools */
```

### 6.2 Badge System (Clear State Communication)

```tsx
// ❌ Current (confusing)
<span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Searching...</span>

// ✅ Better (with icon + color)
<Badge
  variant="searching"
  icon={<MagnifyingGlassIcon />}
  text="Searching documents..."
/>

// Badge component
const Badge = ({ variant, icon, text }) => {
  const variants = {
    searching: { bg: 'bg-amber-50', text: 'text-amber-800', icon: <Zap /> },
    analyzing: { bg: 'bg-purple-50', text: 'text-purple-800', icon: <Brain /> },
    streaming: { bg: 'bg-green-50', text: 'text-green-800', icon: <MessageCircle /> },
  };
  
  const v = variants[variant];
  return (
    <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg', v.bg)}>
      <span className={v.text}>{icon}</span>
      <span className={cn('text-sm font-medium', v.text)}>{text}</span>
    </div>
  );
};
```

### 6.3 Message Component Hierarchy

```tsx
// Clear visual distinction
<ChatMessage
  role="assistant"
  isStreaming={false}
  sources={['doc1.pdf', 'doc2.pdf']}
>
  {/* Title/Summary */}
  <h3 className="text-lg font-semibold text-foreground">Answer Title</h3>
  
  {/* Main Content */}
  <p className="text-base leading-relaxed text-foreground mt-2">
    {content}
  </p>
  
  {/* Metadata */}
  <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm text-muted-foreground">
    <span>Duration: 2.3s</span>
    <span>Sources: 3 documents</span>
  </div>
  
  {/* Sources */}
  <div className="mt-4 space-y-2">
    {sources.map(source => (
      <SourceCard key={source} source={source} />
    ))}
  </div>
  
  {/* Actions */}
  <div className="flex gap-2 mt-4">
    <button className="text-sm text-muted-foreground hover:text-foreground">
      <Copy /> Copy
    </button>
    <button className="text-sm text-muted-foreground hover:text-foreground">
      <ThumbsUp /> Helpful
    </button>
  </div>
</ChatMessage>
```

---

## Part 7: Debug & System Logs (Separated)

### 7.1 Debug Channel Design

**Rules:**
- Hidden by default (tab/toggle)
- Never renders inline with chat
- Timestamped, filterable
- JSON-formatted logs

```tsx
const DebugPanel = () => {
  const [filters, setFilters] = useState<'all' | 'info' | 'error' | 'warning'>('all');
  const logs = useAsyncStore((s) => s.debugLogs);

  return (
    <div className="bg-slate-900 text-slate-100 font-mono text-xs">
      {/* Filter Bar */}
      <div className="flex gap-2 p-3 border-b border-slate-700">
        {(['all', 'info', 'error', 'warning'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilters(f)}
            className={cn(
              'px-3 py-1 rounded',
              filters === f ? 'bg-slate-700' : 'hover:bg-slate-800'
            )}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Logs */}
      <div className="max-h-64 overflow-y-auto p-3 space-y-1">
        {logs.filter(log => filters === 'all' || log.level === filters).map(log => (
          <div key={log.id} className="flex gap-3">
            <span className="text-slate-500">[{log.timestamp}]</span>
            <span className={cn(
              'font-semibold',
              log.level === 'error' ? 'text-red-400' :
              log.level === 'warning' ? 'text-yellow-400' :
              'text-blue-400'
            )}>
              {log.level.toUpperCase()}
            </span>
            <code className="text-slate-300">{log.message}</code>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## Part 8: Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

- [ ] Restructure layout: Desktop → Tablet → Mobile
- [ ] Implement single scroll area in center canvas
- [ ] Add tab-based content switching (Chat | Debug | Docs)
- [ ] Set up responsive breakpoints and media queries
- [ ] Create badge and status indicator components

### Phase 2: Async Experience (Week 3-4)

- [ ] Wire AI events to UI state management
- [ ] Implement phase-based rendering (searching → streaming → done)
- [ ] Add auto-scroll logic with "Jump to latest" button
- [ ] Create AsyncStatusIndicator component
- [ ] Add skeleton UI for loading states

### Phase 3: Performance & Polish (Week 5-6)

- [ ] Implement virtualization for chat messages
- [ ] Optimize re-renders (React.memo, useMemo)
- [ ] Test on mobile devices (iOS + Android)
- [ ] Implement responsive inspector (sidebar → modal)
- [ ] Add smooth animations and transitions

### Phase 4: Refinement (Week 7-8)

- [ ] User testing and feedback collection
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance profiling (Lighthouse)
- [ ] Mobile gesture support (swipe to dismiss)
- [ ] Final polish and deployment

---

## Part 9: Code Examples & Patterns

### 9.1 Complete Responsive Layout

```tsx
// pages/chat.tsx
export default function ChatPage() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1199px)');

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile: Bottom tab bar instead of sidebar */}
      {!isMobile && <Navigation />}

      {/* Main Canvas */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        {/* Content Area - SINGLE SCROLL */}
        <CenterCanvas />
        
        {/* Composer - Sticky */}
        <Composer />
      </main>

      {/* Desktop Only: Inspector Sidebar */}
      {!isTablet && <Inspector />}

      {/* Mobile: Inspector as bottom sheet */}
      {isMobile && <InspectorBottomSheet />}

      {/* Mobile: Bottom Tab Bar */}
      {isMobile && <BottomTabBar />}
    </div>
  );
}
```

### 9.2 Auto-Scroll with "Jump to Latest"

```tsx
const CenterCanvas = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showJump, setShowJump] = useState(false);
  const { currentRequest } = useAsyncStore();

  // Detect scroll position
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowJump(!isAtBottom);
    }
  };

  // Auto-scroll when AI streams
  useEffect(() => {
    if (currentRequest.phase === 'streaming' && !showJump) {
      const timer = setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentRequest.response, showJump]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 relative"
      onScroll={handleScroll}
    >
      {/* Content */}
      <ChatMessages />

      {/* Jump Button */}
      {showJump && (
        <button
          onClick={() => {
            scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
            setShowJump(false);
          }}
          className="sticky bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-primary text-white rounded-full shadow-lg"
        >
          ↓ Jump to latest
        </button>
      )}
    </div>
  );
};
```

### 9.3 Mobile Composer (Sticky, Not Fixed)

```tsx
const Composer = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [height, setHeight] = useState(52);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
    setHeight(Math.min(e.target.scrollHeight, 140));
  };

  return (
    <div className={cn(
      'border-t bg-card/50 backdrop-blur-sm p-4',
      // Mobile: Slightly sticky, follows page scroll naturally
      // Desktop: Rigid sticky
      isMobile ? '' : 'sticky bottom-0'
    )}>
      <div className="flex gap-2">
        <textarea
          onChange={handleInput}
          className="flex-1 resize-none min-h-[52px] max-h-[140px] rounded-lg border p-3"
          placeholder="Ask about the documents..."
        />
        <button className="self-end px-4 py-2 bg-primary text-white rounded-lg">
          Send
        </button>
      </div>
    </div>
  );
};
```

### 9.4 Virtualized Message List

```tsx
import { FixedSizeList as List } from 'react-window';

const ChatMessages = () => {
  const messages = useAsyncStore((s) => s.messages);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="flex-1 overflow-hidden">
      <List
        height={containerRef.current?.clientHeight || 600}
        itemCount={messages.length}
        itemSize={120} // avg height
        width="100%"
      >
        {({ index, style }) => (
          <div style={style} className="px-4">
            <ChatMessage message={messages[index]} />
          </div>
        )}
      </List>
    </div>
  );
};
```

---

## Part 10: Mobile-Specific Guidelines

### 10.1 Touch & Gesture Support

```tsx
// Bottom sheet swipe-to-dismiss
<BottomSheet
  onSwipeDown={() => closeInspector()}
  snapPoints={[0, 250, 500]} // Snap positions
>
  {/* Content */}
</BottomSheet>

// Horizontal swipe for tab switching
<Tabs
  value={activeTab}
  onSwipe={(direction) => {
    if (direction === 'left') nextTab();
    if (direction === 'right') prevTab();
  }}
/>
```

### 10.2 Safe Areas (Notches, etc.)

```css
/* Respect safe area on mobile */
.mobile-padding {
  padding-top: max(1rem, env(safe-area-inset-top));
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
  padding-left: max(1rem, env(safe-area-inset-left));
  padding-right: max(1rem, env(safe-area-inset-right));
}
```

### 10.3 Font Sizes & Tap Targets

```css
/* Ensure tap targets are 48px minimum */
.button {
  min-height: 48px;
  min-width: 48px;
}

/* Font sizes for readability */
@media (max-width: 768px) {
  body { font-size: 16px; } /* Prevent zoom on focus */
  .message { font-size: 16px; }
  .button-text { font-size: 16px; }
}
```

---

## Part 11: Performance Checklist

- [ ] Virtualized lists for 100+ messages
- [ ] Lazy loading for images and attachments
- [ ] Memoized components (React.memo)
- [ ] useCallback for event handlers
- [ ] CSS containment for isolated re-renders
- [ ] Service Worker for offline capability (future)
- [ ] Image optimization (WebP, srcset)
- [ ] Bundle size < 200KB (gzipped)
- [ ] Lighthouse score > 90 (mobile)
- [ ] Time to Interactive < 2s (3G)

---

## Part 12: Accessibility (WCAG 2.1 AA)

- [ ] Semantic HTML (`<button>`, `<nav>`, `<main>`)
- [ ] ARIA labels for dynamic content
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Focus indicators (visible, not hidden)
- [ ] Color contrast (4.5:1 for text)
- [ ] Screen reader tested (NVDA, JAWS)
- [ ] Reduced motion support (`prefers-reduced-motion`)
- [ ] Alt text for all images

---

## Part 13: Testing Strategy

### Unit Tests
- Component rendering with different states
- Async event handling
- Scroll behavior logic

### Integration Tests
- Full message flow (send → retrieve → stream → done)
- Responsive layout switches
- Tab switching functionality

### E2E Tests (Cypress/Playwright)
- User flow: Ask → Wait → Scroll → View debug → Try again
- Mobile: Swipe actions, bottom sheet behavior
- Accessibility: Keyboard navigation

### Performance Tests
- Message virtualization (1000+ items)
- Scroll performance (60fps target)
- Memory leaks during long sessions

---

## Part 14: Next Steps for Implementation

1. **Review & Approve**: Team reviews this document
2. **Create Components**: Build reusable components per Part 6-9
3. **Update Chat Page**: Refactor existing chat/page.tsx
4. **Test on Devices**: iOS (iPhone 12/14), Android (Pixel 6)
5. **Iterate & Polish**: User feedback & performance optimization
6. **Deploy**: Stage → Production with monitoring

---

## Summary Table: Before vs. After

| Aspect | Before | After |
|--------|--------|-------|
| **Scrolling** | Multiple nested scrolls | Single scroll area |
| **Debug** | Mixed with chat | Separate tab, hidden |
| **Mobile** | Breaks with 3 columns | Single column, bottom sheet |
| **Async** | No clear status | Clear phases + badges |
| **Performance** | Lags with 100+ messages | Virtualized, smooth |
| **Inspector** | Always visible | Toggle, modal on mobile |
| **Visual Hierarchy** | Unclear | Color-coded, badges |
| **Accessibility** | Limited | WCAG 2.1 AA compliant |

---

**Document Status**: Design Reference (Ready for Implementation)  
**Last Updated**: December 16, 2025  
**Author**: Cline (AI Product Architect)  
**Approval**: Pending Team Review
