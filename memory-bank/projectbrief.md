# Project Brief: Web Search RAG

## Overview

Web Search RAG is a Retrieval-Augmented Generation (RAG) system that combines web-crawled content with AI to provide intelligent search and chat capabilities. The system processes PDFs (currently starting with Biwase newsletter PDFs) and uses them as a knowledge base for intelligent retrieval and generation.

## Core Objectives

1. **Web Crawling**: Automatically crawl websites, articles, and PDFs to build knowledge base
2. **Document Processing**: Parse and process PDFs to extract structured content
3. **Intelligent Retrieval**: Use embeddings and vector similarity to find relevant documents
4. **RAG Chat Interface**: Provide a chat interface that answers questions using retrieved documents
5. **Multi-Modal Support**: Support text queries, file uploads, and web search capabilities

## Key Requirements

- Process and store PDF documents in a knowledge base
- Generate embeddings for semantic search
- Provide REST API for all operations
- Offer web-based chat interface
- Support web crawling for continuous knowledge base expansion
- Maintain conversation history and debug information
- Support multiple interaction modes (chat, debug, tools)

## Success Criteria

- Chat interface responds to queries with relevant sources
- Web crawling successfully retrieves and processes PDFs
- Vector embeddings enable accurate document retrieval
- System handles concurrent requests efficiently
- Clear separation between frontend (Next.js) and backend (FastAPI)

## Tech Stack

- **Frontend**: Next.js 15.5.9, React 18.3.1, TypeScript, TailwindCSS, Zustand
- **Backend**: FastAPI, Python 3.8+, PyTorch, Sentence Transformers
- **Vector DB**: Qdrant or ChromaDB
- **RAG Libraries**: LangChain, Sentence Transformers
- **Infrastructure**: Docker (Dockerfile.backend, Dockerfile.frontend), Docker Compose

## Project Constraints

- Backend runs on `http://localhost:8080`
- Frontend runs on `http://localhost:3000`
- PDF storage in `web/backend/store_pdfs/`
- Support Windows and Unix-like environments
