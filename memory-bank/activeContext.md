# Active Context: Web Search RAG Platform

## Current Work Focus

### Immediate Priorities

1. **UI/UX Architecture Design**: Complete redesign document created (uiux-architecture.md)
2. **Layout Restructuring**: Implement responsive desktop → tablet → mobile layouts
3. **Scroll & Performance**: Single scroll area, virtualization, auto-scroll behavior
4. **Async Transparency**: Clear phase-based UI (Searching → Analyzing → Streaming → Done)
5. **Debug Separation**: Move debugging to separate tab, hidden by default

### Active Development Tasks

- **Responsive Components**: Rebuild layout with flex/grid for multiple breakpoints
- **Async State Visualization**: Implement phase-based rendering with clear badges
- **Mobile Optimization**: Test on iOS/Android, implement bottom sheets and tab bars
- **Scroll Performance**: Implement virtualization for long chat histories
- **Visual Hierarchy**: Redesigned badge system and color tokens

## Recent Changes

### Latest Updates (December 16, 2025 - Afternoon)

#### Comprehensive UI/UX Architecture Design Document Created

**Major Document**: `memory-bank/uiux-architecture.md` - Complete design reference for frontend implementation

**Key Deliverables:**

- **Layout Architecture**: Desktop (3-column) → Tablet (adaptive) → Mobile (single-column, bottom sheet)
- **Scroll Strategy**: Single scroll area, virtualization, auto-scroll with "Jump to latest"
- **Responsive Design**: Breakpoints (768px, 1200px), media queries, container queries
- **Async Processing**: Event-driven lifecycle, clear phase visualization
- **Visual Hierarchy**: Color tokens (searching/analyzing/streaming), badge system
- **Mobile Guidelines**: Touch gestures, safe areas, 48px tap targets
- **Performance**: Virtualization, React.memo, bundle optimization
- **Accessibility**: WCAG 2.1 AA compliance checklist

**Design Principles:**

1. **Reduce Cognitive Load**: Separate chat from debug, single scroll area
2. **Clear Async State**: Searching → Analyzing → Streaming → Done with visual indicators
3. **Mobile-First**: No fixed sidebars, responsive bottom sheets, single column
4. **Performance**: Virtualized lists, no nested scrolls, smooth 60fps scrolling
5. **Separation of Concerns**: Chat (primary), Debug (secondary tab), Tools (inspector/modal)

#### Layout Evolution

**Desktop (1200px+)**

```
Nav (72/280px) | Center Canvas | Inspector (360px)
              [Single scroll area]
```

**Tablet (768-1199px)**

```
Nav | Center Canvas (Inspector as modal/toggle)
```

**Mobile (<768px)**

```
Center Canvas (single scroll)
Composer (sticky bottom)
Bottom Tab Bar (Chat | Results | Tools)
Inspector (bottom sheet, swipe to dismiss)
```

#### Scroll Strategy Implementation

- **Single Scroll Area**: All content (messages + results) flow through one container
- **No Nested Scrolls**: Debug, tools in separate tabs (not scroll containers)
- **Auto-Scroll Logic**: Follow bottom when AI streams, pause on user scroll, show "Jump to latest" button
- **Virtualization**: React-window for 100+ messages
- **Performance**: Smooth 60fps on mobile, no jank

#### Async State Visualization

**Events Emitted by AI:**

- `request_received` → Show "Searching documents..."
- `retrieval_started` → Progress indicator with count
- `reasoning_started` → Show "Analyzing..."
- `response_stream` → Token-by-token text with auto-scroll
- `completed` → Metadata, sources, duration
- `error` → Error message with retry option

**UI Rendering:**

- Phase-based components
- Color-coded badges (amber for searching, purple for analyzing, green for streaming)
- Skeleton UI instead of blank states
- Clear status messages and progress indicators

#### Component Specifications

- **AsyncStatusIndicator**: Phase, progress, elapsed time
- **Badge System**: Icon + text, color-coded by async phase
- **MessageComponent**: Content + sources + metadata + actions
- **DebugPanel**: Separate tab, timestamped logs, filterable
- **InspectorPanel**: Responsive (sidebar ↔ modal ↔ bottom sheet)
- **Composer**: Responsive height, sticky positioning on mobile

#### Implementation Roadmap

**Phase 1 (Weeks 1-2)**: Foundation - Responsive layouts, tab switching
**Phase 2 (Weeks 3-4)**: Async experience - Event-driven UI, phase rendering
**Phase 3 (Weeks 5-6)**: Performance - Virtualization, mobile testing
**Phase 4 (Weeks 7-8)**: Refinement - User testing, accessibility, polish

### Earlier Updates (December 16, 2025 - Morning)

#### Chat Page Layout Fixes

- Added `.header-standard` class (88px fixed height with sticky positioning)
- Updated Navigation sidebar header to match
- Created `.messages-area` with proper flex layout
- Added `.input-area` with flex-shrink: 0 to prevent collapse
- Made headers sticky so they remain visible when scrolling

### Previous Updates (Early December 2025)

- **Async Architecture Implementation**: Complete Zustand store and AI event emitter system
- **Streaming Chat Interface**: Real-time token-by-token response streaming
- **UI/UX Overhaul**: Comprehensive design system with Vietnamese localization
- **Component Architecture**: Production-ready component library with accessibility
- **State Management**: Advanced async lifecycle management for AI operations
- **Progress Indicators**: Real-time progress bars and phase-based status updates
- **Error Handling**: Graceful error states with retry capabilities
- **Debug System**: Isolated debug panel that doesn't interfere with main UI

- **Async Architecture Implementation**: Complete Zustand store and AI event emitter system
- **Streaming Chat Interface**: Real-time token-by-token response streaming
- **UI/UX Overhaul**: Comprehensive design system with Vietnamese localization
- **Component Architecture**: Production-ready component library with accessibility
- **State Management**: Advanced async lifecycle management for AI operations
- **Progress Indicators**: Real-time progress bars and phase-based status updates
- **Error Handling**: Graceful error states with retry capabilities
- **Debug System**: Isolated debug panel that doesn't interfere with main UI

### Code Changes

- **asyncStore.ts**: Zustand store for async state management
- **aiEventEmitter.ts**: Event-driven AI operation lifecycle management
- **AsyncStatusIndicator.tsx**: Real-time progress and status component
- **chat/page.tsx**: Complete chat interface with streaming and Vietnamese UI
- **Navigation.tsx**: Updated navigation with proper alignment
- **globals.css**: Design system with consistent colors and typography
- **requirements.txt**: Updated with additional dependencies for async operations

## Next Steps

### Short Term (Next 1-2 days)

1. **Test Backend APIs**: Verify all endpoints are functional
2. **Run Frontend Development Server**: Ensure Next.js app starts correctly
3. **Test Crawling Pipeline**: Execute PDF extraction from Biwase website
4. **Validate Document Processing**: Test PDF to text conversion

### Medium Term (Next 1-2 weeks)

1. **Implement Vector Embeddings**: Set up Qdrant and embedding generation
2. **Connect Frontend to Backend**: Establish API communication
3. **Add Error Handling**: Improve robustness across components
4. **Performance Optimization**: Optimize crawling and processing speeds

### Long Term (Next 1-2 months)

1. **Complete RAG Pipeline**: Full semantic search implementation
2. **Enhanced UI/UX**: Improve user interface and experience
3. **Analytics Dashboard**: Comprehensive usage tracking
4. **Production Deployment**: Docker containerization and hosting

## Active Decisions and Considerations

### Architecture Decisions

- **FastAPI Backend**: Chosen for high performance and async capabilities
- **Next.js Frontend**: Selected for full-stack React development
- **Local Vector Database**: Qdrant for development, scalable for production
- **File-based Storage**: Simple filesystem storage for PDFs and processed content

### Technical Choices

- **Python 3.12+**: Required for optimal performance with ML libraries
- **uv Package Manager**: Fast, reliable Python package installation
- **Async Processing**: Non-blocking operations for better user experience
- **Structured Logging**: JSON format for comprehensive activity tracking

### Design Considerations

- **Modular Architecture**: Separate concerns for maintainability
- **API-First Design**: Backend built for frontend consumption
- **Progressive Enhancement**: Core functionality works without advanced features
- **User-Centric Logging**: Activity tracking focused on user interactions

## Important Patterns and Preferences

### Code Organization

- **Separation of Concerns**: Clear boundaries between crawling, processing, and serving
- **Async by Default**: All I/O operations use async/await patterns
- **Type Safety**: Pydantic models for API validation, TypeScript for frontend
- **Error Resilience**: Graceful failure handling with user-friendly messages

### Development Practices

- **Comprehensive Logging**: Every user interaction and system event logged
- **Configuration Management**: Environment variables for deployment flexibility
- **Documentation First**: Memory Bank maintained for project continuity
- **Incremental Development**: Build and test components iteratively

### User Experience Patterns

- **Progressive Disclosure**: Complex features revealed as needed
- **Real-time Feedback**: Immediate responses and progress indicators
- **Context Preservation**: Maintain user state across interactions
- **Accessibility**: Clean, responsive design for all users

## Project Insights and Learnings

### Technical Learnings

- **uv Package Manager**: Significantly faster than pip for dependency resolution
- **FastAPI Async**: Excellent for I/O-bound operations like web crawling
- **BeautifulSoup Patterns**: Robust HTML parsing requires careful selector strategies
- **PDF Processing**: Text extraction quality varies significantly by PDF source

### Process Learnings

- **Memory Bank Importance**: Critical for maintaining project continuity
- **Incremental Documentation**: Build documentation alongside code development
- **Cross-Platform Considerations**: Windows-specific paths and commands
- **Dependency Versioning**: Strict pinning prevents compatibility issues

### User-Centric Insights

- **Query Patterns**: Users expect both precise search and conversational interfaces
- **Progress Visibility**: Long-running operations need clear progress indicators
- **Source Transparency**: Users value knowing where information comes from
- **Error Communication**: Technical errors should be translated to user-friendly messages

## Current Challenges

### Technical Challenges

- **PDF Quality Variation**: Different PDFs have varying text extraction quality
- **Website Structure Changes**: Biwase website updates may break crawling logic
- **Memory Usage**: Large PDF processing and embedding generation require optimization
- **Cross-Origin Issues**: Frontend-backend communication in development environment

### Process Challenges

- **Documentation Maintenance**: Keeping Memory Bank current with development pace
- **Testing Coverage**: Ensuring comprehensive testing across Python and JavaScript
- **Performance Monitoring**: Tracking and optimizing system performance
- **User Feedback Integration**: Incorporating usage patterns into development decisions

## Risk Mitigation

### Technical Risks

- **Dependency Failures**: Regular dependency updates and compatibility testing
- **Data Loss**: Backup strategies for crawled and processed content
- **Performance Degradation**: Monitoring and optimization of slow operations
- **Security Vulnerabilities**: Regular security audits and updates

### Project Risks

- **Scope Creep**: Clear prioritization and phased development approach
- **Technical Debt**: Regular refactoring and code quality reviews
- **Knowledge Silos**: Comprehensive documentation and knowledge sharing
- **Timeline Delays**: Realistic scheduling and milestone tracking

## Success Metrics Tracking

### Current Status

- **Dependencies**: ✅ Installed and verified
- **Backend API**: ✅ Implemented with 15+ endpoints
- **Frontend Structure**: ✅ Next.js scaffolding complete
- **Crawling Logic**: ✅ Biwase-specific extraction implemented
- **Documentation**: ✅ Memory Bank established

### Key Metrics to Monitor

- **API Response Times**: Target <2 seconds for queries
- **Crawling Success Rate**: Target >95% successful extractions
- **User Query Accuracy**: Target >90% relevant results
- **System Uptime**: Target >99% during development

## Communication and Collaboration

### Internal Communication

- **Memory Bank**: Primary knowledge repository and decision log
- **Code Comments**: Comprehensive inline documentation
- **Commit Messages**: Clear, descriptive Git commit history
- **Issue Tracking**: GitHub issues for bug and feature tracking

### External Communication

- **API Documentation**: Auto-generated OpenAPI/Swagger documentation
- **User Feedback**: Activity logs capture user interaction patterns
- **Progress Updates**: Regular status updates in project documentation
- **Error Reporting**: Clear error messages and logging for troubleshooting
