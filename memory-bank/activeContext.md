# Active Context - Web Search RAG Platform

## Current Work Focus

### Primary Issues Requiring Immediate Attention

#### 1. Critical Syntax Errors in Chat Interface
**File**: `web/src/app/chat/page.tsx`
**Status**: BLOCKING - Prevents application from running
**Issues Identified**:
- Multiple JSX syntax errors throughout the file
- Missing closing tags and malformed component structures
- Incorrect attribute syntax in React components
- Broken conditional rendering logic
- Malformed className attributes

**Impact**: Frontend cannot compile, users cannot access chat functionality

#### 2. Backend API Inaccessibility
**Issue**: Frontend requests to `/api/logs` returning 404
**Status**: HIGH PRIORITY
**Root Cause**: Backend server not running on port 8080
**Impact**: Activity logging and data operations failing

#### 3. Conflicting Favicon Configuration
**Issue**: "Conflicting public file and page file found for path /favicon.ico"
**Status**: MEDIUM PRIORITY
**Impact**: Console warnings and potential routing issues

### Current Development State

#### What Works
- ✅ Project structure and dependencies installed
- ✅ Basic Next.js frontend routing functional
- ✅ Some UI components rendering correctly
- ✅ Backend API structure defined (but server not running)
- ✅ PDF storage directory exists
- ✅ Basic crawling infrastructure in place

#### What's Broken
- ❌ Chat page compilation fails due to syntax errors
- ❌ Backend server not started
- ❌ API integration not working
- ❌ Activity logging not functional
- ❌ RAG queries cannot be tested

## Recent Changes & Context

### Code State Analysis
- **Frontend**: Modern Next.js 15 setup with TypeScript
- **Backend**: FastAPI with comprehensive AI/ML pipeline
- **UI**: Clean design with dark/light theme support
- **Architecture**: Well-structured separation of concerns

### Technical Patterns Observed
- Multi-stage crawling system for systematic data collection
- Vector database integration (Qdrant/ChromaDB)
- Activity logging with structured JSON format
- Responsive design with mobile-first approach

## Next Steps & Priorities

### Immediate Actions Required
1. **Fix Chat Page Syntax Errors**
   - Parse through JSX errors systematically
   - Fix malformed component structures
   - Validate TypeScript types
   - Test compilation after each fix

2. **Start Backend Server**
   - Activate Python virtual environment
   - Install backend dependencies
   - Launch FastAPI server on port 8080
   - Verify API endpoints accessible

3. **Resolve Favicon Conflict**
   - Remove conflicting favicon.ico file or route
   - Ensure clean favicon implementation

### Short-term Development Goals
1. **Restore Basic Functionality**
   - Get chat page compiling and loading
   - Enable backend-frontend communication
   - Test basic PDF upload functionality

2. **Validate Core Features**
   - Test crawling system with Biwase website
   - Verify PDF processing pipeline
   - Confirm RAG query responses

3. **Polish User Experience**
   - Fix remaining UI/UX issues
   - Implement proper error handling
   - Add loading states and feedback

### Medium-term Objectives
1. **Performance Optimization**
   - Implement virtual scrolling for large lists
   - Optimize PDF processing performance
   - Add caching for frequent queries

2. **Feature Completion**
   - Complete activity dashboard
   - Enhance search and filtering
   - Add export functionality

3. **Testing & Quality**
   - Add comprehensive test suite
   - Implement error boundaries
   - Add input validation

## Active Decisions & Considerations

### Architecture Decisions Made
- **Next.js 15**: Chosen for modern React features and performance
- **FastAPI**: Selected for Python AI/ML ecosystem integration
- **Zustand**: Lightweight state management over Redux complexity
- **Tailwind CSS**: Utility-first approach for rapid UI development

### Technical Trade-offs
- **Local Vector DBs**: Qdrant/ChromaDB chosen over cloud solutions for development simplicity
- **File-based Storage**: Local filesystem for PDFs vs cloud storage (simplicity vs scalability)
- **Multi-stage Crawling**: Comprehensive but complex approach vs simpler single-stage

### Open Questions & Decisions Needed
1. **Error Handling Strategy**: How comprehensive should error recovery be?
2. **Caching Strategy**: What level of caching for embeddings and queries?
3. **Authentication**: Will user accounts be needed in future?
4. **Scalability**: When to move from local to cloud infrastructure?

## Important Patterns & Preferences

### Code Style Preferences
- **TypeScript Strict**: Full type safety enabled
- **Component Composition**: Prefer composition over inheritance
- **Custom Hooks**: Extract reusable logic into custom hooks
- **Consistent Naming**: camelCase for variables, PascalCase for components

### Development Workflow
- **Feature Branches**: New features developed on separate branches
- **Commit Frequency**: Regular commits with descriptive messages
- **Testing**: Test critical paths before merging
- **Documentation**: Update Memory Bank files with significant changes

### Quality Standards
- **Accessibility**: WCAG 2.1 AA compliance for web interfaces
- **Performance**: Core Web Vitals within acceptable ranges
- **Security**: Input validation and secure API practices
- **Maintainability**: Clean, documented, and testable code

## Learnings & Project Insights

### Technical Learnings
- Next.js App Router requires careful attention to server/client boundaries
- Vietnamese text processing needs specialized embedding models
- Multi-stage crawling provides better control but increases complexity
- Vector databases require significant memory for large document sets

### Process Learnings
- Memory Bank system crucial for maintaining context across sessions
- Systematic documentation prevents knowledge loss
- Incremental testing prevents accumulation of breaking changes
- Early identification of syntax errors prevents downstream issues

### Business Insights
- Vietnamese business intelligence market has clear need for specialized tools
- PDF-based content remains primary source for business documents
- Real-time crawling capabilities provide competitive advantage
- Conversational interfaces improve user engagement with complex data

## Current Session Goals

### By End of Session
1. ✅ Create complete Memory Bank documentation
2. 🔄 Fix critical syntax errors in chat page
3. 🔄 Get backend server running
4. 🔄 Establish frontend-backend communication
5. 🔄 Test basic RAG functionality

### Success Criteria
- Frontend compiles without errors
- Backend API responds to requests
- Basic chat interface functional
- PDF upload and processing works
- Memory Bank provides complete project context
