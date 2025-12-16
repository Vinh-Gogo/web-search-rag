# System Patterns: Web Search RAG Platform

## System Architecture

### High-Level Architecture

```bash
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Data Layer    │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   (Files/DB)    │
│                 │    │                 │    │                 │
│ - React UI      │    │ - REST Endpoints│    │ - PDF Storage   │
│ - TypeScript    │    │ - Async Tasks   │    │ - Vector DB     │
│ - Activity Logs │    │ - Crawling      │    │ - Metadata      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Relationships

#### Crawling Pipeline

```bash
Web Crawler → PDF Downloader → Document Processor → Vector Indexer
     ↓              ↓              ↓              ↓
  Raw URLs    Local PDFs    Clean Text    Searchable Embeddings
```

#### Query Pipeline

```bash
User Query → Query Processor → Vector Search → Result Ranker → Response Formatter
     ↓              ↓              ↓              ↓              ↓
  Natural Lang  Structured Query  Similar Docs   Relevance Score  Formatted Answer
```

## Key Technical Decisions

### Backend Framework: FastAPI

- **Rationale**: High performance, automatic API documentation, async support
- **Benefits**: Fast development, type safety with Pydantic, excellent concurrency
- **Trade-offs**: Python ecosystem dependency, GIL limitations for CPU-intensive tasks

### Frontend Framework: Next.js

- **Rationale**: Full-stack React framework, excellent developer experience
- **Benefits**: SSR/SSG capabilities, TypeScript support, large ecosystem
- **Trade-offs**: Opinionated structure, learning curve for advanced features

### Data Storage Strategy

- **PDFs**: Local filesystem storage (`store_pdfs/` directory)
- **Processed Content**: Local filesystem with structured directories
- **Vector Database**: Qdrant for embeddings, local deployment
- **Metadata**: JSON files and in-memory structures (production: database)

### Processing Pipeline Design

- **Modular Components**: Separate concerns for crawling, processing, indexing
- **Async Processing**: Non-blocking operations for better responsiveness
- **Error Resilience**: Graceful failure handling with logging
- **Configurable Stages**: Each pipeline stage can be run independently

## Design Patterns

### Repository Pattern

- **Data Access Layer**: Abstracted file system operations
- **Interface Consistency**: Uniform API for different storage types
- **Testability**: Easy mocking for unit tests

### Strategy Pattern

- **Crawling Strategies**: Different approaches for different websites
- **Processing Strategies**: Multiple PDF processing algorithms
- **Query Strategies**: Various search and ranking methods

### Observer Pattern

- **Activity Logging**: Components notify logging system of events
- **Progress Tracking**: Real-time updates during long-running operations
- **Event-Driven Architecture**: Loose coupling between components

### Factory Pattern

- **Crawler Factory**: Creates appropriate crawler based on URL/domain
- **Processor Factory**: Instantiates correct processor for file type
- **Response Factory**: Generates formatted responses based on query type

## Critical Implementation Paths

### Crawling Flow

1. **Page Discovery**: Extract pagination links from base URL
2. **Article Collection**: Gather all article URLs from pagination pages
3. **PDF Extraction**: Find PDF download links in each article
4. **Batch Download**: Download PDFs with progress tracking
5. **Validation**: Verify downloads and handle failures

### Query Processing Flow

1. **Query Parsing**: Understand user intent and extract keywords
2. **Vector Search**: Find semantically similar documents
3. **Relevance Ranking**: Score and order results by relevance
4. **Context Assembly**: Gather supporting information and sources
5. **Response Generation**: Format answer with citations

### Document Processing Flow

1. **PDF Parsing**: Extract text content from PDF files
2. **Text Cleaning**: Remove artifacts, normalize formatting
3. **Chunking**: Split into semantically meaningful segments
4. **Embedding Generation**: Create vector representations
5. **Indexing**: Store in vector database with metadata

## Component Interactions

### API Layer Contracts

- **Request/Response Models**: Pydantic models for type safety
- **Error Handling**: Consistent error response format
- **Pagination**: Standardized pagination for list endpoints
- **Authentication**: Future-proofed for API key authentication

### Data Flow Patterns

- **Streaming**: Large file downloads use streaming responses
- **Batching**: Bulk operations process items in configurable batches
- **Caching**: Frequently accessed data cached in memory
- **Background Tasks**: Long-running operations run asynchronously

## Performance Considerations

### Optimization Strategies

- **Async Operations**: Non-blocking I/O for concurrent requests
- **Connection Pooling**: Reused connections for external API calls
- **Memory Management**: Efficient handling of large PDF files
- **Query Optimization**: Indexed searches and result limiting

### Scalability Patterns

- **Horizontal Scaling**: Stateless design allows multiple instances
- **Load Balancing**: API Gateway can distribute requests
- **Database Sharding**: Vector database can be distributed
- **CDN Integration**: Static assets served via CDN

## Error Handling Patterns

### Graceful Degradation

- **Fallback Responses**: Default data when services unavailable
- **Partial Success**: Return available results even if some fail
- **User-Friendly Messages**: Clear error messages without technical details

### Logging and Monitoring

- **Structured Logging**: JSON format with consistent fields
- **Error Tracking**: Comprehensive error information for debugging
- **Performance Metrics**: Response times and resource usage tracking

## Security Considerations

### Input Validation

- **URL Sanitization**: Prevent malicious URL injection
- **File Type Checking**: Only allow PDF uploads/downloads
- **Query Sanitization**: Prevent injection attacks

### Access Control

- **CORS Configuration**: Restrict cross-origin requests
- **Rate Limiting**: Prevent abuse of API endpoints
- **API Keys**: Future authentication mechanism

## Testing Patterns

### Unit Testing

- **Mock External Dependencies**: Isolate component testing
- **Test Data Factories**: Consistent test data generation
- **Assertion Libraries**: Comprehensive validation of behavior

### Integration Testing

- **API Endpoint Testing**: Full request/response cycles
- **Database Integration**: Test data persistence and retrieval
- **End-to-End Testing**: Complete user workflows

## Deployment Patterns

### Containerization

- **Docker Images**: Consistent deployment across environments
- **Multi-Stage Builds**: Optimized production images
- **Orchestration**: Docker Compose for local development

### Environment Management

- **Configuration Files**: Environment-specific settings
- **Secret Management**: Secure handling of API keys and credentials
- **Health Checks**: Automated monitoring of service health
