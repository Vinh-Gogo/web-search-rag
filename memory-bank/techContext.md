# Technical Context: Web Search RAG Platform

## Technology Stack

### Backend (Python/FastAPI)

- **Framework**: FastAPI 0.104.1 - High-performance async web framework
- **Language**: Python 3.12+ (with uv package manager)
- **Runtime**: Uvicorn ASGI server
- **API Documentation**: Automatic OpenAPI/Swagger generation

### Frontend (Next.js/React)

- **Framework**: Next.js 14+ - React full-stack framework
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS (via PostCSS) with custom design system
- **State Management**: Zustand for async state management
- **Event System**: Custom AI event emitter for real-time updates
- **Build Tool**: Next.js built-in (Webpack under the hood)
- **Package Manager**: npm

### Data Processing & AI

- **PDF Processing**: PyPDF2, python-docx for document handling
- **Web Scraping**: BeautifulSoup4, requests for HTML parsing
- **ML Framework**: PyTorch 2.0+ for transformer models
- **Embeddings**: sentence-transformers, transformers libraries
- **Vector Database**: Qdrant client for vector storage and search

### Development Tools

- **Version Control**: Git (GitHub repository)
- **IDE**: Visual Studio Code with Python and TypeScript extensions
- **Package Management**: uv (fast Python package installer)
- **Virtual Environment**: Python venv
- **Containerization**: Docker + Docker Compose

## Development Setup

### Local Development Environment

```bash
# Backend Setup
cd web-rag-platform/backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Frontend Setup
cd web-rag-platform
npm install

# Running Services
# Backend: python -m uvicorn main:app --reload --host 127.0.0.1 --port 8080
# Frontend: npm run dev
```

### Project Structure

```bash
web-search-rag/
├── requirements.txt              # Python dependencies
├── web-rag-platform/
│   ├── backend/
│   │   ├── main.py              # FastAPI application
│   │   ├── requirements.txt     # Backend dependencies
│   │   ├── bs4_gspread.py       # Crawling logic
│   │   └── store_pdfs/          # PDF storage
│   ├── src/
│   │   ├── app/                 # Next.js pages
│   │   ├── components/          # React components
│   │   └── lib/                 # Utility functions
│   ├── package.json             # Frontend dependencies
│   └── docker-compose.yml       # Container orchestration
└── memory-bank/                 # Project documentation
```

## Technical Constraints

### Performance Limitations

- **Memory**: Large PDF processing requires significant RAM
- **CPU**: Embedding generation is computationally intensive
- **Network**: Crawling operations depend on external website availability
- **Storage**: Vector databases grow with document volume

### Platform Constraints

- **Operating System**: Windows 11 (primary development)
- **Python Version**: 3.12+ required for optimal performance
- **Node.js Version**: 18+ for Next.js compatibility
- **Browser Support**: Modern browsers with ES6+ support

### External Dependencies

- **Biwase Website**: Subject to change, requiring crawler updates
- **Hugging Face Models**: Require internet access for initial download
- **Qdrant Service**: Local deployment may have resource limitations

## Dependencies Management

### Python Dependencies (requirements.txt)

```txt
# Core web framework
fastapi==0.104.1
uvicorn[standard]==0.24.0

# Data processing
requests==2.31.0
beautifulsoup4==4.12.2
pypdf2==3.0.1
python-docx==1.1.0

# AI/ML stack
torch>=2.0.0
transformers>=4.40.0
accelerate>=0.20.0
sentence-transformers==2.3.1

# Vector database
qdrant-client==1.7.0

# Utilities
aiofiles==23.2.1
pydantic==2.5.0
python-multipart==0.0.6
```

### JavaScript Dependencies (package.json)

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.0.0"
  }
}
```

## Tool Usage Patterns

### Development Workflow

1. **Code Changes**: Edit in VS Code with TypeScript/Python extensions
2. **Testing**: Run backend with `uvicorn --reload`, frontend with `npm run dev`
3. **Debugging**: Use VS Code debugger for both Python and JavaScript
4. **Version Control**: Git commits with descriptive messages

### Package Management

- **Python**: Use `uv pip install` for fast, reliable installations
- **Node.js**: Use `npm install` for dependency management
- **Virtual Environment**: Always activate Python venv before development

### Build and Deployment

- **Development**: Hot reload enabled for both frontend and backend
- **Production**: Docker containers for consistent deployment
- **CI/CD**: GitHub Actions for automated testing and deployment

## Environment Configuration

### Environment Variables

```bash
# Backend
PORT=8080
HOST=127.0.0.1
DEBUG=True

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8080

# External Services
QDRANT_URL=http://localhost:6333
HF_TOKEN=your_huggingface_token
```

### Configuration Files

- **requirements.txt**: Python package specifications
- **package.json**: Node.js dependencies and scripts
- **docker-compose.yml**: Multi-service orchestration
- **next.config.ts**: Next.js build configuration
- **tsconfig.json**: TypeScript compiler options

## Performance Optimization

### Backend Optimizations

- **Async/Await**: All I/O operations are asynchronous
- **Connection Pooling**: HTTP client reuse for external requests
- **Caching**: In-memory caching for frequently accessed data
- **Background Tasks**: Long-running operations don't block API responses

### Frontend Optimizations

- **Server-Side Rendering**: Next.js SSR for better SEO and performance
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js built-in image optimization
- **API Routes**: Serverless functions for API endpoints

### Database Optimizations

- **Vector Indexing**: Efficient similarity search with Qdrant
- **Batch Processing**: Bulk operations for embedding generation
- **Memory Mapping**: Large datasets handled efficiently
- **Query Optimization**: Filtered and paginated results

## Security Considerations

### Input Validation

- **URL Validation**: Sanitize all crawled URLs
- **File Upload**: Restrict to PDF files only
- **Query Sanitization**: Prevent injection in search queries

### Access Control

- **CORS**: Configured for localhost development
- **Rate Limiting**: Prevent API abuse (future implementation)
- **Authentication**: API key system (planned)

### Data Protection

- **Local Storage**: All data stored locally during development
- **No External APIs**: Avoid exposing sensitive data
- **Secure Defaults**: Conservative security settings

## Monitoring and Debugging

### Logging Strategy

- **Structured Logging**: JSON format for all log entries
- **Log Levels**: DEBUG, INFO, WARNING, ERROR
- **Activity Tracking**: Comprehensive user interaction logging
- **Error Tracking**: Detailed error information with stack traces

### Performance Monitoring

- **Response Times**: API endpoint performance tracking
- **Resource Usage**: Memory and CPU monitoring
- **Error Rates**: Failure rate tracking across components
- **User Metrics**: Query volume and success rates

### Debugging Tools

- **VS Code Extensions**: Python, TypeScript, Docker support
- **Browser DevTools**: Frontend debugging and performance analysis
- **API Testing**: Swagger UI for endpoint testing
- **Database Tools**: Qdrant dashboard for vector database inspection

## Async Architecture & State Management

### Zustand Store (asyncStore.ts)

- **Global State**: Centralized async operation state management
- **Request Lifecycle**: Complete request tracking from initiation to completion
- **Phase Management**: Multi-phase async operations (idle → retrieval → reasoning → streaming)
- **Error Handling**: Comprehensive error state management with retry capabilities
- **Real-time Updates**: Immediate UI updates for all async state changes

### AI Event Emitter (aiEventEmitter.ts)

- **Event-Driven Architecture**: Decoupled event system for AI operations
- **Lifecycle Events**: Request received, retrieval started, reasoning started, response streaming
- **Progress Tracking**: Real-time progress updates with detailed status information
- **Error Propagation**: Structured error events with recovery options
- **Performance Monitoring**: Built-in timing and metrics collection

### Streaming Chat Interface

- **Token-by-Token Streaming**: Real-time text streaming for immediate user feedback
- **Phase-Based UI**: Dynamic interface that adapts to current operation phase
- **Progress Indicators**: Visual progress bars and status animations
- **Interrupt Handling**: Ability to cancel ongoing operations
- **Context Preservation**: Maintains conversation state across streaming updates

## UI/UX Design System

### Component Architecture

- **AsyncStatusIndicator**: Real-time progress and status display component
- **Navigation**: Responsive navigation with proper alignment and spacing
- **Chat Interface**: Production-ready chat with Vietnamese localization
- **Design Tokens**: Consistent colors, typography, and spacing system

### Accessibility Features

- **WCAG Compliance**: Proper contrast ratios and focus management
- **Keyboard Navigation**: Full keyboard accessibility for all interactions
- **Screen Reader Support**: Semantic markup and ARIA labels
- **Focus Indicators**: Clear visual focus states for all interactive elements

### Vietnamese Localization

- **Complete Translation**: All UI text translated to Vietnamese
- **Cultural Adaptation**: Interface adapted for Vietnamese user expectations
- **Consistent Terminology**: Standardized Vietnamese technical terms
- **RTL Considerations**: Prepared for potential right-to-left text support

## Real-time Communication Patterns

### Event-Driven Updates

- **Immediate Feedback**: UI updates instantly reflect backend state changes
- **Non-blocking Operations**: Frontend remains responsive during long operations
- **Progress Visualization**: Clear visual feedback for all operation phases
- **Error Recovery**: Graceful error handling with user-friendly retry options

### State Synchronization

- **Single Source of Truth**: Zustand store as central state authority
- **Event Consistency**: All state changes trigger appropriate UI updates
- **Race Condition Prevention**: Proper async operation sequencing
- **Memory Management**: Efficient cleanup of completed operations

## Performance Optimizations

### Frontend Performance

- **Virtual Scrolling**: Efficient rendering of large message lists
- **Lazy Loading**: Components loaded on-demand
- **Memoization**: React.memo and useMemo for expensive computations
- **Bundle Optimization**: Code splitting and tree shaking

### Async Operation Efficiency

- **Concurrent Processing**: Multiple operations can run simultaneously
- **Resource Pooling**: Efficient management of async resources
- **Cancellation Support**: Ability to abort unnecessary operations
- **Memory Cleanup**: Automatic cleanup of completed async operations

## Development Workflow Enhancements

### Hot Reload & Development Experience

- **Instant Updates**: Changes reflect immediately in development
- **Error Boundaries**: Graceful error handling in development
- **Debug Panels**: Isolated debug information that doesn't interfere with UI
- **Performance Monitoring**: Built-in performance tracking and optimization

### Testing Infrastructure

- **Component Testing**: Unit tests for React components
- **Async Testing**: Specialized tests for async operations
- **Integration Testing**: End-to-end testing of complete user flows
- **Performance Testing**: Automated performance regression testing
