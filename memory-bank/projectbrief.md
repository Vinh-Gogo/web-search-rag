# Project Brief: Web Search RAG

## Project Name
Web Search RAG (Retrieval-Augmented Generation)

## Current State
Repository with Biwase newsletter PDF crawler implementation.

## Core Requirements
1. Web crawling capability to gather data from Biwase newsletter website
2. PDF extraction and download functionality
3. Data processing pipeline for RAG system (to be developed)
4. Search and retrieval capabilities (to be developed)

## Goals
- Build a RAG system that uses web-crawled data as knowledge base
- Start with Biwase newsletter PDFs as initial data source
- Enable intelligent search and retrieval from crawled content

## Scope
**Phase 1 (Current):** Web crawler for Biwase newsletters
- ✅ Pattern-based PDF URL generation
- ✅ Deep crawl with article discovery
- ✅ Hybrid multi-strategy crawler
- ✅ Smart LLM-powered crawler with Jina.ai
- ✅ 30+ PDFs downloaded (2019-2025)

**Phase 2 (Planned):** RAG system development
- PDF content extraction and processing
- Vector embedding and storage
- Search and retrieval interface
- Question-answering capabilities

## Key Constraints
- Must handle PDF files effectively
- Pattern: `ban-tin-biwase-t{month}-{year}--a4.pdf`
- URL base: `https://biwase.com.vn/Data/Sites/1/media/filescan/ban-tin-biwase`
