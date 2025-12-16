# Active Context

## Current Work Focus
Phase 2C: Chat UI Integration (Completed) - Ready for Backend RAG Integration

## Recent Changes

**Phase 2C - AsyncStatusIndicator & ResponsiveLayout Integration (Just Completed - Dec 16, 2025):**

- Integrated AsyncStatusIndicator component into chat page
  - Real-time async operation status display
  - 6 phase tracking: queued, retrieving, processing, streaming, completed, error
  - Document retrieval progress with progress bar
  - Vietnamese language support for status messages
- Connected chat operations to asyncStore
  - handleSendMessage now uses useAsyncStore.getState()
  - Phase transitions: queued → retrieving → processing → streaming → completed
  - updateProgress() for document retrieval tracking (documentsFound/totalDocuments)
  - completeRequest() with sources and latency tracking
- Integrated ResponsiveLayout into chat page
  - Replaced custom responsive logic (~200 lines removed)
  - ToolsSidebar passed to toolsContent prop
  - Automatic tab navigation for mobile/tablet
  - Swipe gesture support built-in
- Fixed UI layout issues
  - Header now has sticky positioning (sticky top-0 z-40)
  - DebugBadge moved to absolute positioning (top-3 right-3 z-50)
  - Proper flexbox structure: header (sticky) → messages (scroll) → input (fixed)
  - Messages area with flex-1 overflow-y-auto for proper scrolling
- Resolved hydration error
  - Moved theme initialization from useState lazy init to useEffect
  - Server and client now render identical HTML on first pass
  - Theme loads from localStorage after mount
  - Added eslint-disable for effect dependencies
- Removed redundant code
  - Eliminated custom mobile sidebar logic
  - Removed isTyping, isSidebarOpen, showScrollButton states
  - Deleted custom typing indicator (replaced by AsyncStatusIndicator)
  - Removed scroll-to-bottom button

**Phase 2B - Audio Feedback & Voice Queue (Completed):**

- Created audioFeedback.ts utility with Web Audio API for sound effects
  - playRecordingStartSound() - ascending beeps (600Hz → 800Hz → 1000Hz)
  - playRecordingStopSound() - descending beeps (1000Hz → 800Hz → 600Hz)
  - playSuccessSound() - double beep (800Hz + 1200Hz)
  - playErrorSound() - low frequency buzz (300Hz)
- Implemented useVoiceQueue hook for offline voice message management
  - Queue management with localStorage/IndexedDB persistence
  - Online/offline status monitoring
  - Retry logic with max 3 attempts per message
  - Sync when connection restored
- Integrated audio feedback into VoiceInput component
  - Audio toggle button (enable/disable feedback)
  - Sound effects on recording start/stop/success/error
  - Queues messages automatically on send failure (offline)
  - Updated voice message interface with language support

**Previous Phase 2B Implementation:**

- Created VoiceInput.tsx component with Web Speech API integration
- Built MobileGenerationUI.tsx with voice + text generation display
- Implemented useVoiceInput hook for voice state management
- Added MobileTextInput component for text-based input
- Created /voice page for mobile voice & generation feature
- Integrated language selection (10+ languages: English, Spanish, French, etc.)
- Added message actions: copy, speak (Text-to-Speech), delete
- Implemented streaming response display with loading states
- Added error handling and user-friendly error messages
- Voice recognition with interim/final transcript display

**Phase 2A Implementation:**

- Created mobile-optimized API endpoints (`/api/mobile/*` with 20+ endpoints)
- Implemented lightweight request/response models optimized for mobile bandwidth
- Added pagination support (max 50 items per request, configurable)
- Created offline-first synchronization endpoint (`/api/mobile/sync`)
- Implemented mobile API client hook (`useMobileAPI`) with caching and retry logic
- Added specialized hooks: `useMobileChat`, `useMobileSearch`
- Created offline store hook with localStorage and IndexedDB support
- Implemented conversation cache with local persistence
- Integrated mobile API router into main FastAPI app
- Added retry logic with exponential backoff for unreliable networks

## Next Steps

1. **Phase 3: Native Mobile App**
   - React Native or Flutter for iOS/Android
   - Device-specific features (camera, contacts, push notifications)
   - Native file system access for PDFs

2. **Core RAG Backend Implementation**
   - Vector database initialization (Qdrant or ChromaDB)
   - Embedding generation (Sentence Transformers)
   - RAG query implementation (LangChain)
   - PDF processing pipeline
   - Web crawling implementation

3. **Testing & Optimization**
   - Test voice on iOS (limited Web Speech API support)
   - Test offline queue sync on slow networks
   - Performance optimization for mobile

## Active Decisions

1. **Audio Feedback**: Web Audio API with custom frequency generation (no external sounds needed)
2. **Voice Queue**: IndexedDB + localStorage with automatic sync strategy
3. **Offline-First**: Queue all messages, sync when online, retry max 3 times
4. **PWA Strategy**: Network-first for pages, cache API errors gracefully
5. **Mobile Navigation**: Hamburger drawer on mobile/tablet, sidebar on desktop
6. **Touch Targets**: Minimum 48px on mobile (reduced to 44px on desktop)
7. **Font Sizing**: 16px+ on mobile to prevent iOS zoom
8. **Swipe Gestures**: Left/right swipes for tab navigation on mobile

## Important Patterns & Preferences

1. **Mobile-First Design**: TailwindCSS responsive classes (base = mobile, md: = desktop)
2. **Touch-Friendly**: All interactive elements ≥48px, sufficient spacing
3. **Performance**: Service worker caches static assets, API calls not cached
4. **PWA Benefits**: Offline support, installable, app-like experience
5. **Responsive Components**: Separate mobile/tablet/desktop layouts

## Learnings & Project Insights

1. PWA requires manifest.json + service worker + proper headers
2. iOS requires specific meta tags (apple-mobile-web-app-*)
3. Touch gestures need 50px+ swipe distance to avoid accidental triggers
4. 16px+ font size on mobile prevents iOS auto-zoom
5. Service worker caching strategy crucial for offline experience
6. MobileOptimizedInput prevents iOS zoom with specific font-size handling

## Project Architecture Summary

- **Frontend**: Next.js 15.5.9 with React 18, TypeScript, TailwindCSS (now PWA-enabled)
- **Mobile**: Responsive design, touch-optimized, PWA-ready
- **Service Worker**: Network-first strategy, offline fallbacks
- **Navigation**: Desktop sidebar (lg:), mobile hamburger menu
- **Backend**: FastAPI with Python 3.8+, PyTorch, Sentence Transformers
- **Storage**: Qdrant/ChromaDB for vectors, PDFs in file system
- **Communication**: REST API on port 8080 (backend), 3000 (frontend)

## Mobile Implementation Status

✅ PWA manifest and service worker
✅ Offline page (offline.html)
✅ Mobile-optimized input/button components
✅ Touch gesture handling (swipe navigation)
✅ Mobile sidebar navigation (hamburger menu)
✅ Responsive layout (desktop sidebar hidden on mobile)
✅ Mobile-specific API endpoints (20+ endpoints)
✅ Voice input component with Web Speech API
✅ Mobile generation UI with voice + text
✅ Text-to-Speech (TTS) for message playback
✅ Offline chat history caching (localStorage + IndexedDB)
✅ Audio feedback with Web Audio API (start/stop/success/error sounds)
✅ Voice message queuing for offline scenarios
⏳ Native mobile app (React Native/Flutter)
⏳ Core RAG backend (embeddings, vector search)
⏳ iOS Web Speech API support (fallback needed)

## Environment Notes

- Windows development environment
- CORS configured for localhost development
- Docker support available via docker-compose
- PWA tested on Chrome/Edge (service worker support required)
- iOS PWA support via web app meta tags

