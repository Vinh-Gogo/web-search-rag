# Web Search RAG Platform Project Brief

## Project Overview

A comprehensive Retrieval-Augmented Generation (RAG) system that crawls, processes, and makes searchable web content from Biwase newsletter PDFs. The platform provides intelligent querying capabilities through both direct search and conversational AI chat interfaces.

## Core Objectives

- **Web Crawling**: Automated extraction of PDF newsletters from Biwase website
- **Document Processing**: Convert PDFs to searchable text/markdown format
- **RAG Implementation**: Enable semantic search and question-answering over processed content
- **User Interface**: Web-based dashboard for content management and interaction
- **Activity Tracking**: Comprehensive logging and analytics of user interactions

## Key Features

1. **Multi-stage Crawling Pipeline**:
   - Page discovery from pagination
   - Article extraction from pages
   - PDF link collection from articles
   - Batch PDF downloading

2. **Document Processing**:
   - PDF text extraction and cleaning
   - Markdown conversion for better readability
   - Metadata preservation (source URLs, dates, etc.)

3. **RAG Capabilities**:
   - Semantic search over processed documents
   - Relevance scoring and ranking
   - Source attribution and citation

4. **Chat Interface**:
   - Conversational AI responses
   - Context-aware answers based on document knowledge
   - Multi-turn conversation support

5. **Activity Dashboard**:
   - Real-time usage statistics
   - User interaction analytics
   - Performance monitoring

## Technical Architecture

- **Backend**: FastAPI (Python) with async endpoints
- **Frontend**: Next.js (React/TypeScript)
- **Data Processing**: Python libraries (BeautifulSoup, transformers, sentence-transformers)
- **Vector Database**: Qdrant for embeddings
- **Storage**: Local file system for PDFs and processed content

## Success Criteria

- Successfully crawl and process Biwase newsletter PDFs
- Provide accurate, relevant answers to user queries
- Maintain response times under 2 seconds for queries
- Support concurrent users through the web interface
- Comprehensive activity logging for analytics

## Current Status

- Project structure established
- Dependencies installed and configured
- Basic API endpoints implemented
- Frontend scaffolding in place
- Crawling logic developed

## Next Steps

- Complete PDF processing pipeline
- Implement vector embeddings and search
- Connect frontend to backend APIs
- Add comprehensive error handling
- Deploy and test end-to-end functionality
