# System Patterns & Architecture - Web Search RAG Platform

## System Architecture Overview

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │   FastAPI       │    │   Vector DBs    │
│   (Next.js)     │◄──►│   Backend       │◄──►│   (Qdrant,      │
│                 │    │   (Python)      │    │    ChromaDB)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Interface│    │   PDF Processing│    │   Document      │
│   Components    │    │   Pipeline      │    │   Embeddings    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Relationships

#### Frontend Layer (Next.js + React)
- **Routing**: App Router with dynamic routes for different views
- **State Management**: Zustand for global state, React hooks for local state
- **UI Components**: Reusable components with Tailwind CSS styling
- **API Integration**: RESTful calls to backend with error handling

#### Backend Layer (FastAPI + Python)
- **API Design**: RESTful endpoints with Pydantic models for validation
- **Processing Pipeline**: Multi-stage document processing (PDF → Text → Chunks → Embeddings)
- **Crawling System**: Multi-stage web crawling (Pages → Articles → PDFs)
- **Vector Operations**: Integration with Qdrant and ChromaDB for similarity search

#### Data Layer
- **Vector Databases**: Qdrant for production, ChromaDB for development
- **Document Storage**: Local file system for PDF storage with metadata
- **Activity Logs**: JSON-based logging for user actions and system events

## Key Technical Patterns

### 1. Multi-Stage Crawling Pattern
```
Stage 1: Page Discovery
    Base URL → Pagination Links → Page URLs[]

Stage 2: Article Extraction
    Page URLs[] → Article Links → Article URLs[]

Stage 3: PDF Collection
    Article URLs[] → PDF Links → PDF URLs[]

Stage 4: Download & Processing
    PDF URLs[] → Download → Process → Store
```

**Implementation**: `bs4_gspread.py` with `BiwaseCrawler` class
**Benefits**: Systematic discovery, progress tracking, error resilience

### 2. Document Processing Pipeline
```
PDF File → Text Extraction → Chunking → Embedding → Vector Storage → Search Index
```

**Components**:
- **Text Extraction**: PyPDF2 for PDF parsing, BeautifulSoup for HTML
- **Chunking**: Intelligent text splitting preserving context
- **Embedding**: Sentence-transformers for Vietnamese text embeddings
- **Vector Storage**: Qdrant/ChromaDB for similarity search

### 3. RAG Query Pattern
```
User Query → Query Embedding → Vector Similarity Search → Context Retrieval → LLM Generation → Response
```

**Features**:
- Multi-document context aggregation
- Source attribution and relevance scoring
- Conversation history maintenance

### 4. Activity Logging Pattern
```
User Action → Log Entry Creation → JSON Storage → Analytics Processing
```

**Structure**:
```json
{
  "timestamp": "ISO8601",
  "page": "component_name",
  "action": "user_action",
  "data": {...},
  "session_id": "uuid"
}
```

### 5. Error Handling Patterns

#### Frontend Error Handling
- Try-catch blocks around API calls
- User-friendly error messages via toast notifications
- Graceful degradation for failed operations
- Loading states for async operations

#### Backend Error Handling
- HTTP exception raising with appropriate status codes
- Structured error responses with error types
- Logging of errors for debugging
- Fallback responses for partial failures

## Critical Implementation Paths

### PDF Processing Flow
1. **Upload/File Discovery**: Files added via upload or crawling
2. **Validation**: Check file format, size, corruption
3. **Text Extraction**: Convert PDF to structured text
4. **Metadata Extraction**: Capture title, author, dates, page count
5. **Chunking**: Split into semantically meaningful chunks
6. **Embedding Generation**: Create vector representations
7. **Storage**: Save to vector database with metadata
8. **Indexing**: Update search indices for fast retrieval

### Query Processing Flow
1. **Query Reception**: Accept natural language query
2. **Preprocessing**: Clean and normalize Vietnamese text
3. **Embedding**: Convert query to vector representation
4. **Similarity Search**: Find most relevant document chunks
5. **Context Assembly**: Combine relevant chunks with conversation history
6. **Generation**: Use LLM to generate contextual response
7. **Post-processing**: Add source citations and confidence scores

### Crawling Execution Flow
1. **Target Identification**: Define base URLs and crawling scope
2. **Stage 1 - Pages**: Discover all pagination pages
3. **Stage 2 - Articles**: Extract article URLs from each page
4. **Stage 3 - PDFs**: Find PDF download links in articles
5. **Download Phase**: Fetch PDFs with progress tracking
6. **Processing Phase**: Convert PDFs to searchable format
7. **Integration**: Add processed content to knowledge base

## Design Patterns in Use

### Frontend Patterns
- **Component Composition**: Reusable UI components with props
- **Custom Hooks**: Encapsulate stateful logic (useMediaQuery, useActivityLogger)
- **Layout Components**: Responsive layout with theme support
- **Virtual Scrolling**: Performance optimization for large lists

### Backend Patterns
- **Dependency Injection**: FastAPI's dependency system for services
- **Repository Pattern**: Data access abstraction for vector databases
- **Factory Pattern**: Crawler factory for different website types
- **Observer Pattern**: Progress tracking during long operations

### Data Patterns
- **Document Model**: Structured representation of PDF metadata
- **Embedding Model**: Vector representation with metadata linkage
- **Query Model**: Structured query with parameters and results
- **Activity Model**: Comprehensive logging of user interactions

## Performance Considerations

### Frontend Optimization
- **Code Splitting**: Route-based and component-based splitting
- **Image Optimization**: Next.js automatic image optimization
- **Virtual Lists**: React-window for large message lists
- **Debounced Search**: Prevent excessive API calls

### Backend Optimization
- **Async Processing**: Non-blocking I/O for file operations
- **Batch Processing**: Group operations for efficiency
- **Caching**: Vector database caching for frequent queries
- **Connection Pooling**: Database connection management

### Database Optimization
- **Index Strategy**: Optimized indices for similarity search
- **Batch Inserts**: Efficient bulk data operations
- **Memory Management**: Streaming for large document processing

## Scalability Patterns

### Horizontal Scaling
- **Stateless Backend**: API servers can be scaled independently
- **Shared Vector DB**: Centralized knowledge base accessible by multiple instances
- **Load Balancing**: Distribute requests across multiple frontend instances

### Vertical Scaling
- **Resource Allocation**: Memory for embedding operations, CPU for text processing
- **Batch Processing**: Handle large volumes of documents efficiently
- **Queue Management**: Background job processing for intensive operations

### Data Scaling
- **Partitioning**: Split large knowledge bases across multiple collections
- **Archiving**: Move old/unused documents to cheaper storage
- **Incremental Updates**: Add new content without full reprocessing
