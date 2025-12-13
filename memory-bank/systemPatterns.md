# System Patterns

## Architecture Overview

```
┌─────────────────────────────────────┐
│   Smart PDF Crawler (4 Methods)    │  ✅ Implemented
│  - Pattern-based                   │
│  - Deep crawl                      │
│  - Hybrid (recommended)            │
│  - LLM-powered (Jina.ai + Qwen)   │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────┐
│   PDF Storage       │
│  (biwase_data/pdfs) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  PDF Processor      │  ← To be implemented
│ (text extraction)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Vector Database    │  ← To be implemented
│   (embeddings)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   RAG Interface     │  ← To be implemented
│  (query/response)   │
└─────────────────────┘
```

## Key Technical Decisions

### Crawler Design
- **Pattern-based URLs:** Predictable URL structure allows generating all possible PDF URLs
- **No web scraping needed:** Direct PDF access via known pattern
- **Year/month iteration:** Systematic coverage of all time periods
- **File existence check:** Avoids re-downloading existing files

### Data Organization
```
biwase_data/
└── pdfs/
    ├── ban-tin-biwase-t1-2020--a4.pdf
    ├── ban-tin-biwase-t2-2020--a4.pdf
    └── ...
```

## Design Patterns

### BiwaseCrawler Class
- **Single Responsibility:** Handles only PDF download logic
- **Configuration:** Base URL, output directory, year range
- **State Management:** Tracks success/failure statistics
- **Error Handling:** Graceful degradation for missing files

### URL Generation Strategy
```python
Pattern: ban-tin-biwase-t{month}-{year}--a4.pdf
Base: https://biwase.com.vn/Data/Sites/1/media/filescan/ban-tin-biwase
Result: {base}/{pattern}
```

## Component Relationships

### Current Components
1. **crawler_biwase.py:** Pattern-based (fast, simple)
2. **deep_crawler.py:** Article-based discovery (22 PDFs)
3. **hybrid_crawler.py:** Combined approach (30 PDFs) ⭐ Recommended
4. **smart_pdf_crawler.py:** LLM-powered universal crawler
   - Jina.ai Reader integration
   - Qwen3-1.7B for link analysis
   - Works on any website

### Critical Implementation Paths

#### Download Flow
```
run() 
  → generate_pdf_urls() [creates list]
  → loop through PDFs
    → download_pdf() 
      → check if exists
      → fetch from URL
      → validate PDF format
      → save to disk
      → return status
  → display summary
```

#### Status Types
- `success`: New download completed
- `exists`: File already present
- `not_found`: 404 from server
- `error`: Network or other error

## Future Patterns (Planned)

### PDF Processing
- Extract text with PyPDF2 or pdfplumber
- Clean and normalize text
- Split into chunks with overlap

### Vector Embeddings
- Use sentence-transformers or OpenAI embeddings
- Store in ChromaDB, Pinecone, or FAISS
- Enable semantic similarity search

### RAG Pipeline
- Query → Embed → Search → Retrieve → Augment → Generate
- Context window management
- Source citation tracking
