# System Patterns: Web Search RAG Platform

## System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│              (Next.js 15 + TypeScript + React)              │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Crawl   │  │   PDFs   │  │   RAG    │  │   Chat   │  │
│  │ Control  │  │   Mgmt   │  │  Search  │  │Interface │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTP/REST API
                         │ (localhost:3000 → localhost:8080)
┌────────────────────────▼─────────────────────────────────────┐
│                        Backend Layer                          │
│                   (FastAPI + Python 3.x)                     │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Web     │  │   PDF    │  │  Vector  │  │   AI     │  │
│  │ Crawler  │  │Processor │  │ Database │  │  Chat    │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │   Data Storage Layer   │
            │                        │
            │  • PDF Files (Raw)     │
            │  • Markdown (Processed)│
            │  • Vector Embeddings   │
            │  • Metadata DB         │
            └────────────────────────┘
```

## Component Architecture

### Frontend Components

#### 1. Navigation Component
**Location**: `src/components/Navigation.tsx`
**Purpose**: Unified navigation across all pages
**Pattern**: Shared layout component
**Key Features**:
- Tab-based navigation (Crawl, PDFs, RAG, Chat, Archive)
- Active state indication
- Responsive design

#### 2. Page Components
**Location**: `src/app/*/page.tsx`
**Pattern**: Next.js App Router pages
**Structure**:
```
/                → Crawl Control (Web scraping interface)
/pdfs            → PDF Management (Processing status)
/rag             → RAG Search (Query interface)
/chat            → Chat Interface (Conversational AI)
/archive         → Query History (Past searches)
```

### Backend Services

#### 1. Web Crawler Service
**File**: `backend/bs4_gspread.py`
**Purpose**: Discover and download PDF URLs from target websites
**Key Functions**:
- `crawl_main(link)`: Main crawling entry point
- Parses HTML with BeautifulSoup
- Extracts PDF hrefs
- Handles pagination
**Pattern**: Single-responsibility module, stateless

#### 2. API Service
**File**: `backend/main.py`
**Purpose**: Central FastAPI application providing all endpoints
**Pattern**: RESTful API with route-based organization
**Endpoints**:
```
GET  /                        → Health check
GET  /api/health              → Service status
GET  /api/pdfs                → List PDF files
POST /api/pdfs/process        → Process selected PDFs
POST /api/pdfs/upload         → Upload new PDF
POST /api/rag/query           → Perform RAG query
GET  /api/rag/stats           → System statistics
GET  /api/rag/history         → Query history
POST /api/chat/message        → Chat with AI
GET  /api/pdf-links           → Crawl for PDF URLs
POST /api/download-pdfs       → Download PDFs from URLs
GET  /api/download/{filename} → Download processed file
```

## Design Patterns

### 1. API-First Architecture
**Implementation**: Frontend and backend completely decoupled via REST API
**Benefits**: 
- Independent deployment
- Technology flexibility
- Clear separation of concerns
**Pattern Details**:
- All frontend-backend communication via HTTP
- CORS configured for localhost development
- Request/Response models defined with Pydantic

### 2. State Management
**Frontend State**:
- React `useState` for local component state
- localStorage for persistent data (pending PDFs)
- No global state management (simple enough without Redux/Zustand)

**Backend State**:
- In-memory dictionaries for demo (pdf_files, conversations, query_history)
- **Note**: Production should use proper database

### 3. File Organization Pattern
```
Project Root
├── src/
│   ├── crawl/              → Standalone crawling scripts
│   ├── biwase_data/        → Data storage
│   │   ├── pdfs_all/       → Raw downloaded PDFs
│   │   └── pdfs_smart/     → Processed markdown files
│   └── web-rag-platform/   → Main application
│       ├── backend/        → Python FastAPI service
│       │   ├── main.py     → API entry point
│       │   └── bs4_gspread.py → Crawler module
│       └── src/            → Next.js frontend
│           ├── app/        → Page routes
│           ├── components/ → Shared components
│           └── lib/        → Utilities
```

### 4. Error Handling Pattern
**Frontend**:
```typescript
try {
  const response = await fetch(url);
  const data = await response.json();
  if (data.success) {
    // Handle success
  } else {
    // Handle API error
  }
} catch (error) {
  // Handle network error
}
```

**Backend**:
```python
try:
    # Operation
    return {"success": True, "data": result}
except Exception as e:
    return {"success": False, "error": str(e)}
```

### 5. Progressive Enhancement Pattern
**Implementation**: Start with mock data, add real functionality incrementally
**Example**: 
- PDFs endpoint initially returns sample data
- Later connects to actual file system
- Eventually integrates with vector database

## Critical Implementation Paths

### Path 1: Web Crawling Flow
```
User clicks "Start" → 
  Frontend sends GET /api/pdf-links →
    Backend calls bs4_gspread.crawl_main() →
      BeautifulSoup parses HTML →
        Extracts PDF hrefs →
          Returns list of URLs →
    Backend responds with results →
  Frontend displays found PDFs →
    User clicks "Add to PDF Processing" →
      URLs stored in localStorage →
        Available in /pdfs page
```

### Path 2: PDF Download Flow
```
User has PDF URLs →
  Frontend sends POST /api/download-pdfs →
    Backend iterates through URLs →
      requests.get() downloads each PDF →
        Saves to src/biwase_data/pdfs_all/ →
    Returns download statistics →
  Frontend shows success message
```

### Path 3: RAG Query Flow (Planned)
```
User enters query →
  Frontend sends POST /api/rag/query →
    Backend converts query to embedding →
      Searches vector database →
        Retrieves top K similar chunks →
          Ranks by relevance →
    Returns results with sources →
  Frontend displays formatted results
```

### Path 4: Chat Conversation Flow
```
User sends message →
  Frontend sends POST /api/chat/message →
    Backend maintains conversation history →
      (Future) Calls LLM with context →
        (Future) Performs RAG search for sources →
          Generates response →
    Returns AI response + sources →
  Frontend appends to chat history →
    Maintains conversation_id for context
```

## Key Technical Decisions

### Decision 1: Next.js App Router
**Rationale**: Modern React pattern with server-side rendering capabilities
**Impact**: File-based routing, better SEO, improved performance
**Trade-off**: Steeper learning curve than Pages Router

### Decision 2: FastAPI for Backend
**Rationale**: 
- Modern Python async framework
- Automatic API documentation (OpenAPI)
- Type safety with Pydantic
- Fast development and performance
**Impact**: Clean API design, easy testing

### Decision 3: Localhost Development
**Rationale**: Simplified setup for initial development
**Impact**: 
- No cloud infrastructure needed initially
- Easy debugging
- **Future**: Will need deployment strategy

### Decision 4: Sample Data for MVP
**Rationale**: Enable frontend development without waiting for full backend
**Impact**: 
- Parallel development possible
- Clear API contracts established
- **Must**: Replace with real implementations

### Decision 5: Modular Crawler Design
**Rationale**: Separate crawling logic for reusability
**Impact**: 
- Can be run standalone or via API
- Easy to test independently
- Adaptable to other websites

## Component Relationships

### Frontend to Backend Communication
- **Protocol**: HTTP REST
- **Format**: JSON
- **CORS**: Enabled for localhost:3000
- **Ports**: Frontend (3000), Backend (8080)

### Backend Internal Dependencies
- **FastAPI** → **bs4_gspread** (crawler module)
- **main.py** imports crawl functions
- Shared data structures via Pydantic models

### Data Flow Dependencies
```
PDF URLs → Download → Raw PDFs → Processing → Markdown → 
  Embedding → Vector DB → RAG Search → Results
```

## Security Considerations

### Current State (Development)
- Open CORS for localhost
- No authentication/authorization
- Local file system access
- In-memory state (not persistent)

### Production Requirements (Future)
- Authentication system (JWT tokens)
- Rate limiting on API endpoints
- Input validation and sanitization
- Secure file upload handling
- Database encryption
- HTTPS only
- Environment-based configuration

## Performance Patterns

### Optimization Strategies
1. **Async Operations**: FastAPI async endpoints for I/O operations
2. **Background Tasks**: Long-running crawls via BackgroundTasks
3. **Caching**: (Planned) Cache frequently accessed documents
4. **Streaming**: (Planned) Stream large file responses
5. **Pagination**: Limit results per page for large datasets

### Monitoring Points
- API response times
- Crawl success rates
- PDF processing times
- Vector search latency
- Memory usage during processing
