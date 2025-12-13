# Technical Context

## Technologies Used

### Current Stack
- **Python 3.x:** Primary programming language
- **requests:** HTTP client for downloading PDFs and API calls
- **beautifulsoup4:** HTML parsing for deep crawl
- **pathlib:** Modern path handling
- **torch:** PyTorch for LLM inference
- **transformers:** Hugging Face transformers (Qwen models)

### Dependencies (requirements.txt)
```txt
requests==2.31.0
beautifulsoup4==4.12.2
torch>=2.0.0
transformers>=4.40.0
accelerate>=0.20.0
```

## Development Setup

### Running the Crawlers
```bash
# Method 1: Hybrid (Recommended for Biwase)
python src/hybrid_crawler.py

# Method 2: Deep Crawl
python src/deep_crawler.py

# Method 3: Pattern-based
python src/crawler_biwase.py 2020 2025

# Method 4: Smart LLM Crawler (Universal)
python src/smart_pdf_crawler.py <URL>
python src/smart_pdf_crawler.py https://biwase.com.vn/tin-tuc/ban-tin-biwase
python src/smart_pdf_crawler.py <URL> --no-llm --max-pages 5
```

### Output Structure
```
biwase_data/
├── pdfs_all/          # Hybrid/Deep crawler output (29 PDFs)
│   ├── BanTinBiwaseNam2019.pdf
│   ├── ban-tin-biwase-t1-2024-a4.pdf
│   ├── BAN-TIN-BIWASE-T9-2022-A4.pdf
│   └── ... (annual + monthly, 2019-2025)
├── pdfs_smart/        # Smart LLM crawler output
│   └── (discovered PDFs)
└── download_summary.txt
```

## Technical Constraints

### PDF Validation
- Must start with `%PDF` magic bytes
- Validates actual PDF content, not just extension

### Network
- 60-second timeout per request
- 0.2-second delay between requests (rate limiting)
- Handles 404 errors gracefully

### File System
- Creates directories if they don't exist
- Skips existing files to avoid re-downloads
- Reports file sizes in MB

## Tool Usage Patterns

### Error Handling Strategy
```python
try:
    # Download attempt
    response = requests.get(url, timeout=60)
    if response.status_code == 404:
        return ('not_found', 0)
    response.raise_for_status()
except:
    return ('error', 0)
```

### Status Return Pattern
All operations return tuple: `(status_string, size_float)`
- Consistent interface for all outcomes
- Size in MB for successful downloads

## New Technologies Integrated

### Jina.ai Reader API
- **URL:** `https://r.jina.ai/<target_url>`
- **Purpose:** Clean content extraction from any webpage
- **Benefits:** Handles JavaScript, returns markdown
- **Usage:** Smart crawler primary content source

### LLM Integration (Qwen3-1.7B)
- **Model:** Qwen/Qwen3-1.7B
- **Purpose:** Intelligent PDF link extraction
- **Approach:** Analyzes content semantically
- **Fallback:** Rule-based regex if LLM unavailable

## Future Technical Needs

### PDF Processing
- **PyPDF2** or **pdfplumber:** Text extraction
- **langchain:** Document splitting and chunking
- **tiktoken:** Token counting for chunk sizing

### Vector Database
- **ChromaDB:** Simple local vector store
- **FAISS:** Fast similarity search
- **Pinecone:** Managed cloud option

### LLM Integration
- **OpenAI API:** GPT models for generation
- **sentence-transformers:** Local embeddings
- **langchain:** RAG pipeline orchestration

### Additional Tools
- **streamlit:** Web interface
- **gradio:** Alternative UI option
- **pytest:** Testing framework
