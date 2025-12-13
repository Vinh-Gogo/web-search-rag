# Active Context

## Current Work Focus
Smart PDF Crawler implementation complete. System now uses Jina.ai Reader API + LLM to intelligently discover and download PDFs from any URL.

## Recent Changes
- ✅ Implemented Smart PDF Crawler with Jina.ai integration
- ✅ Created hybrid crawler combining deep crawl + pattern testing
- ✅ Downloaded 29+ PDFs (annual reports + monthly newsletters)
- ✅ Set up venv, .gitignore, requirements.txt
- ✅ Organized src/ directory structure
- ✅ Discovered additional PDFs via multiple strategies

## Next Steps

### Immediate
1. Test Smart PDF Crawler on different websites
2. Begin PDF text extraction (Phase 2)
3. Design document chunking strategy

### Short Term
1. Implement PDF text extraction with OCR support
2. Set up vector database (ChromaDB or FAISS)
3. Create embedding generation pipeline
4. Build basic retrieval testing

### Medium Term
1. Implement PDF text extraction
2. Design chunking strategy for RAG
3. Select and integrate vector database
4. Build basic search/retrieval interface

## Active Decisions and Considerations

### Crawler Approach
- **✅ Implemented:** Pattern-based URL generation (simple, fast)
- **✅ Implemented:** Deep crawl with BeautifulSoup (comprehensive)
- **✅ Implemented:** Hybrid crawler (combines both strategies)
- **✅ NEW:** Smart LLM-powered crawler with Jina.ai
- **Decision:** Multiple crawlers available for different use cases

### Data Processing Pipeline
- **Question:** What's the best way to extract text from PDFs?
- **Options:** PyPDF2, pdfplumber, Apache Tika
- **Consider:** Quality vs. speed tradeoffs

### Vector Database Choice
- **Local options:** ChromaDB, FAISS
- **Cloud options:** Pinecone, Weaviate
- **Decision factors:** Scale, cost, ease of use

## Important Patterns and Preferences

### Code Style
- Class-based organization (`BiwaseCrawler`)
- Type hints for function signatures
- Clear status reporting with tuples
- Pathlib for file operations (modern Python)

### User Experience
- Clear progress output with year/month breakdown
- Summary statistics at end
- File size reporting in MB
- Skip existing files (efficient)

## Learnings and Project Insights

### Biwase URL Pattern
- Consistent naming: `ban-tin-biwase-t{month}-{year}--a4.pdf`
- Base URL: `https://biwase.com.vn/Data/Sites/1/media/filescan/ban-tin-biwase`
- Not all months have newsletters (404s are normal)

### Implementation Notes
- PDF validation via magic bytes (`%PDF`) prevents false positives
- Rate limiting (0.2s delay) is good practice
- Command-line args allow flexible year ranges
- File existence check saves bandwidth

### Crawler Evolution
- Started with pattern-based (Method 3)
- Added deep crawl (Method 2)
- Created hybrid approach (Method 1)
- **NEW:** Smart crawler with Jina.ai + LLM
- Total: 4 different crawler strategies available

### Key Achievement
- **30 PDFs discovered** vs initial 22
- Found annual report (BanTinBiwaseNam2019.pdf)
- Discovered multiple naming variations
- Automatic pattern detection working
