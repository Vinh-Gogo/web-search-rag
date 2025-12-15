# Active Context: Web Search RAG Platform

## Current Work Focus

### Primary Objective
Establishing the Memory Bank documentation system to enable consistent project understanding across sessions.

### Recent Activity
**Session Date**: December 15, 2025

**Completed**:
1. ✅ Created Memory Bank directory structure
2. ✅ Documented project brief and requirements
3. ✅ Documented product context and user workflows
4. ✅ Documented system architecture and patterns
5. ✅ Documented technical stack and setup procedures
6. ✅ Currently documenting active context
7. ✅ **Personal Archive Page Enhancement**: Updated to dynamically load 52 PDF files from filesystem
   - Removed hardcoded data arrays
   - Integrated with `/api/pdfs` endpoint for real file data
   - Added loading states and error handling
   - Implemented real-time statistics calculation

## Current Project State

### What's Working
1. **Web Crawling System**:
   - Crawler successfully discovers PDF links from Biwase website
   - API endpoint `/api/pdf-links` functional and tested
   - Frontend displays found PDFs with metadata
   - Error handling in place for network issues

2. **Frontend Structure**:
   - Complete navigation system across 5 main pages
   - Responsive UI with Tailwind CSS
   - Component architecture established
   - API integration patterns working

3. **Backend API**:
   - FastAPI server running on port 8080
   - All endpoint stubs defined and documented
   - CORS configured for local development
   - Auto-generated API documentation available

4. **Development Environment**:
   - Dual-server setup (frontend + backend) working
   - Hot reload active on both services
   - Git repository configured and connected

### What's In Progress
1. **PDF Processing Pipeline**: Defined but not yet implemented
   - Need to implement actual PDF download functionality
   - Need to add PDF-to-markdown conversion
   - Need to integrate with file system properly

2. **RAG Search System**: Partially mocked
   - Endpoint returns sample data
   - No real vector database integration yet
   - No embedding generation implemented

3. **Chat Interface**: UI complete, logic partial
   - Frontend chat interface functional
   - Backend maintains conversation state (in-memory)
   - No actual LLM integration yet
   - No RAG-enhanced responses yet

## Next Steps

### Immediate Priorities
1. **Complete Memory Bank Documentation**:
   - ✅ projectbrief.md
   - ✅ productContext.md
   - ✅ systemPatterns.md
   - ✅ techContext.md
   - 🔄 activeContext.md (current)
   - ⏳ progress.md

2. **Implement PDF Download**:
   - Connect `/api/download-pdfs` endpoint to actual file operations
   - Test with real Biwase PDF URLs
   - Verify file storage in `src/biwase_data/pdfs_all/`

3. **PDF Processing**:
   - Research and select PDF extraction library (PyMuPDF vs pdfplumber)
   - Implement PDF-to-markdown conversion
   - Store processed files in `src/biwase_data/pdfs_smart/`

### Medium-Term Goals
1. **Vector Database Integration**:
   - Choose vector DB (ChromaDB recommended for local development)
   - Implement text chunking strategy
   - Generate embeddings (sentence-transformers or OpenAI)
   - Build indexing pipeline

2. **RAG Implementation**:
   - Connect query endpoint to vector DB
   - Implement semantic search
   - Add relevance scoring
   - Return actual document chunks with sources

3. **LLM Integration**:
   - Select LLM provider (OpenAI API vs local Ollama)
   - Implement prompt templates
   - Add RAG context to prompts
   - Handle streaming responses

## Active Decisions and Considerations

### Decision Points

#### 1. PDF Processing Library Choice
**Options**:
- **PyMuPDF (fitz)**: Fast, good for layout
- **pdfplumber**: Better for tables and structured data
- **Marker**: AI-powered, excellent quality but slower

**Recommendation**: Start with PyMuPDF for speed, add pdfplumber if table extraction needed

#### 2. Vector Database Selection
**Options**:
- **ChromaDB**: Easy local setup, Python-native
- **Pinecone**: Managed cloud service, scalable
- **Weaviate**: Open source, feature-rich
- **FAISS**: Facebook's library, fast but lower-level

**Recommendation**: ChromaDB for MVP due to simplicity and local-first approach

#### 3. LLM Provider
**Options**:
- **OpenAI API**: High quality, cost per token
- **Anthropic Claude**: Strong reasoning, conversation
- **Ollama Local**: Free, private, requires GPU
- **Google Gemini**: Competitive pricing

**Recommendation**: Start with OpenAI for reliability, add Ollama option later for privacy

#### 4. State Management Strategy
**Current**: In-memory dictionaries (conversations, query_history, pdf_files)
**Issue**: Data lost on server restart
**Solution Needed**: 
- Short-term: JSON file persistence
- Long-term: PostgreSQL or MongoDB

### Open Questions
1. **How to handle duplicate PDFs?** Check file hash or filename?
2. **Chunking strategy?** Fixed size vs semantic splitting?
3. **Embedding model?** all-MiniLM-L6-v2 vs text-embedding-ada-002?
4. **How many vector dimensions?** 384 (MiniLM) vs 1536 (OpenAI)?
5. **Document update strategy?** Re-index all or incremental updates?

## Important Patterns and Preferences

### Code Style
- **Frontend**: TypeScript strict mode, functional components, hooks
- **Backend**: Python type hints, Pydantic models, async where beneficial
- **Naming**: camelCase (TypeScript), snake_case (Python)
- **Comments**: Docstrings for functions, inline for complex logic

### Error Handling Philosophy
- Always return structured responses with `success` flag
- Include error messages in user-friendly format
- Log detailed errors server-side
- Never expose internal errors to frontend

### API Design Principles
- RESTful conventions
- Consistent response structure
- Clear endpoint naming (`/api/resource/action`)
- Pydantic models for validation
- Auto-generated documentation

### UI/UX Patterns
- Loading states for async operations
- Error messages with actionable guidance
- Success confirmations
- Consistent color coding (blue=action, green=success, red=error)
- Icon + text for clarity

## Project Insights and Learnings

### Key Insights
1. **Two-phase implementation is working**: Frontend with mock data allows parallel development
2. **FastAPI auto-docs are invaluable**: Swagger UI speeds up API testing
3. **Hot reload essential**: Both frontend and backend auto-reload save significant time
4. **CORS configuration tricky**: Must include both localhost and 127.0.0.1
5. **Path handling critical on Windows**: Use forward slashes or Path objects consistently

### Technical Learnings
1. **Next.js App Router**: File-based routing is intuitive once understood
2. **Tailwind CSS**: Utility-first approach speeds up styling significantly
3. **BeautifulSoup**: Simple but effective for structured HTML parsing
4. **FastAPI Background Tasks**: Good for long-running operations without blocking

### Pitfalls to Avoid
1. **Don't block main thread**: Use async or background tasks for crawling
2. **Don't trust external HTML structure**: Website changes break scrapers
3. **Don't store sensitive data in localStorage**: Use secure backend storage
4. **Don't forget CORS**: Frontend calls will fail mysteriously
5. **Don't skip input validation**: Always validate user inputs server-side

## Environment Notes

### Development Environment
- **OS**: Windows 11
- **IDE**: Visual Studio Code
- **Python**: 3.x with venv at project root
- **Node**: Latest LTS version
- **Git**: Repository connected to GitHub

### Known Issues
1. **Path resolution**: Windows paths need careful handling
2. **Port conflicts**: Ensure 3000 and 8080 are available
3. **Virtual environment**: Must be activated before running backend
4. **CORS**: Sometimes needs browser cache clear after changes

### Dependencies to Watch
- **Next.js 15**: Recently released, some features may have breaking changes
- **Tailwind CSS 4**: Major version, CSS-first approach different
- **PayloadCMS**: Installed but unused, consider removing if not needed
- **FastAPI**: Stable, but keep updated for security patches

## Communication Patterns

### With Users
- Be clear about what's implemented vs mocked
- Show progress transparently (progress bars, status indicators)
- Provide actionable error messages
- Include source citations for all RAG responses

### In Code
- Comment complex algorithms
- Document API contracts with Pydantic models
- Use type hints consistently
- Write docstrings for public functions

### In Documentation
- Keep Memory Bank files updated after significant changes
- Document decisions with rationale
- Track open questions
- Note both successes and failures for learning
