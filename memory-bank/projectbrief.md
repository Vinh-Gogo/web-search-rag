# Web Search RAG Platform - Project Brief

## Project Overview
A Retrieval-Augmented Generation (RAG) system that uses web-crawled content as knowledge base, starting with Biwase newsletter PDFs. The platform provides intelligent querying and chat capabilities over Vietnamese economic and business data.

## Core Requirements

### Primary Functionality
- **Web Crawling**: Automated discovery and extraction of PDF documents from Vietnamese business websites (starting with Biwase newsletters)
- **PDF Processing**: Convert PDF documents to searchable text chunks with metadata preservation
- **Vector Database**: Store document embeddings for semantic search using Qdrant and ChromaDB
- **RAG Queries**: Perform intelligent retrieval-augmented generation over the knowledge base
- **Chat Interface**: Conversational AI interface for querying the knowledge base
- **Multi-stage Crawling**: Systematic approach to discover content (pages → articles → PDFs)

### Technical Architecture
- **Frontend**: Next.js 15 web application with modern React patterns
- **Backend**: FastAPI Python server handling data processing and AI operations
- **Database**: Vector databases (Qdrant, ChromaDB) for document embeddings
- **Processing Pipeline**: PDF → Text → Chunks → Embeddings → Vector Search → LLM Generation

### Key Features
- Vietnamese language support for economic/business content
- Activity logging and analytics dashboard
- Responsive web interface with dark/light themes
- File upload and processing capabilities
- Real-time crawling progress tracking
- Query history and conversation management

## Success Criteria
- Successfully crawl and process Biwase newsletter PDFs
- Provide accurate answers to Vietnamese economic questions
- Maintain conversation context in chat interface
- Handle PDF processing at scale (thousands of documents)
- Provide real-time feedback during crawling operations

## Scope Boundaries
- Focus on Vietnamese business/economic content initially
- Start with PDF documents, expandable to other formats
- Web-based interface only (no mobile apps)
- Single-user system (no multi-tenancy initially)

## Quality Standards
- Clean, modern UI following web design best practices
- Robust error handling and user feedback
- Efficient processing pipeline for large documents
- Accurate Vietnamese text processing and embeddings
- Responsive performance for real-time interactions
