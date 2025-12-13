# Product Context

## Why This Project Exists
To create a Retrieval-Augmented Generation (RAG) system that can intelligently search and answer questions based on web-crawled content, starting with Biwase company newsletters.

## Problems It Solves
1. **Data Collection:** Automates gathering of newsletter PDFs from Biwase website
2. **Knowledge Access:** Makes historical newsletter content searchable and accessible
3. **Information Retrieval:** Enables intelligent Q&A over large document collections
4. **Content Organization:** Systematically organizes PDF newsletters by year/month

## How It Should Work

### Current: Data Collection Phase ✅ COMPLETE
**4 Crawler Methods Available:**
1. **Pattern-based** (Method 3): Fast, predictable URL generation
2. **Deep crawler** (Method 2): Article page scraping with pagination
3. **Hybrid** (Method 1): Combines both approaches - 30 PDFs found ⭐
4. **Smart LLM** (Method 4): Jina.ai + Qwen for universal PDF discovery

**Results:**
- 29 PDFs downloaded (38 MB, 2019-2025)
- Annual reports discovered (e.g., BanTinBiwaseNam2019.pdf)
- Multiple naming patterns handled automatically
- Stored in `biwase_data/pdfs_all/`

### Future: RAG System
1. Extract text content from downloaded PDFs
2. Split content into meaningful chunks
3. Generate embeddings for semantic search
4. Store in vector database
5. Enable natural language queries
6. Return relevant information with source citations

## User Experience Goals
- **Simple:** Single command to download all newsletters ✅
- **Efficient:** Skip existing files, handle errors gracefully ✅
- **Informative:** Clear progress reporting and summaries ✅
- **Reliable:** Robust error handling and rate limiting ✅
- **Extensible:** Smart LLM crawler works on ANY website ✅
- **Intelligent:** Automatic pattern discovery and link detection ✅
