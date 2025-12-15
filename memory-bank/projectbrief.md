# Project Brief: Web Search RAG Platform

## Project Name
Web Search RAG Platform (Web-Search-RAG)

## Core Mission
Build a Retrieval-Augmented Generation (RAG) system that uses web-crawled content as a knowledge base, specifically focused on processing Biwase newsletter PDFs to enable intelligent document search and question-answering capabilities.

## Project Goals

### Primary Objectives
1. **Automated Web Crawling**: Scrape and collect PDF documents from Biwase newsletter pages
2. **Document Processing**: Convert PDFs to searchable, structured data (markdown format)
3. **RAG Search System**: Implement vector-based semantic search over processed documents
4. **AI-Powered Chat**: Provide conversational interface for querying document knowledge base
5. **User-Friendly Interface**: Create intuitive web interface for all platform features

### Target Users
- Internal users needing to search through Biwase newsletters
- Researchers analyzing historical newsletter content
- Knowledge workers requiring quick access to specific information from large document sets

## Scope

### In Scope
- Web crawling for PDF discovery and download
- PDF processing and text extraction
- Vector database for semantic search
- RAG-based query system
- Chat interface with context-aware responses
- Document management and tracking
- Archive/history of queries and conversations

### Out of Scope (Current Phase)
- Multi-language support beyond Vietnamese
- Real-time collaborative features
- Advanced analytics dashboards
- Integration with external document sources beyond Biwase
- Mobile native applications

## Success Criteria
1. Successfully crawl and download 100% of available Biwase newsletter PDFs
2. Process PDFs with >90% text extraction accuracy
3. Provide relevant search results with <2 second response time
4. Enable natural language queries through chat interface
5. Maintain comprehensive audit trail of all operations

## Technical Constraints
- Must run locally for development (localhost setup)
- Backend: Python-based (FastAPI framework)
- Frontend: Next.js with TypeScript
- Must be containerizable with Docker
- Windows development environment compatibility

## Key Stakeholders
- Development Team: Building and maintaining the platform
- End Users: Accessing and searching document knowledge base
- Content Owners: Biwase organization (source of newsletters)

## Project Timeline
- Phase 1: Core crawling and PDF processing (Current)
- Phase 2: RAG implementation and search
- Phase 3: Chat interface and AI integration
- Phase 4: Optimization and deployment

## Risks and Mitigation
- **Risk**: Website structure changes breaking crawler
  - **Mitigation**: Modular crawler design, error handling, manual fallback
- **Risk**: Large PDF files causing processing issues
  - **Mitigation**: Streaming processing, chunk-based handling
- **Risk**: Vector database performance at scale
  - **Mitigation**: Efficient indexing, caching strategies
