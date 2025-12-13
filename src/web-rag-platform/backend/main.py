"""
FastAPI backend for Web Search RAG Platform
Integrates with existing Python RAG pipeline and provides API endpoints for the frontend
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
import sys
import subprocess
import json
from pathlib import Path

# Add the parent directory to the Python path to import existing modules
sys.path.append(str(Path(__file__).parent.parent.parent))

app = FastAPI(
    title="Web Search RAG Platform API",
    description="Backend API for RAG platform with web crawling, PDF processing, and query capabilities",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class CrawlJobRequest(BaseModel):
    url: str
    name: Optional[str] = None

class CrawlJobStatus(BaseModel):
    id: str
    url: str
    status: str
    progress: float
    pages_found: int
    pdfs_found: int
    last_run: str
    error_message: Optional[str] = None

class QueryRequest(BaseModel):
    query: str
    max_results: int = 5

class QueryResult(BaseModel):
    id: str
    content: str
    source: str
    relevance: float
    document_title: str
    page_number: Optional[int] = None
    similarity: float

class PDFProcessingStatus(BaseModel):
    id: str
    name: str
    status: str
    size: str
    upload_date: str
    source_url: str
    markdown_url: Optional[str] = None
    pages: int
    language: str
    quality: str

# Global state for crawl jobs (in production, use a proper database)
crawl_jobs: Dict[str, Dict[str, Any]] = {}

@app.get("/")
async def root():
    return {"message": "Web Search RAG Platform API", "version": "1.0.0"}

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "web_crawler": "available",
            "pdf_processor": "available",
            "vector_database": "available",
            "rag_search": "available"
        }
    }

# Crawl Control Endpoints
@app.post("/api/crawl/start")
async def start_crawl_job(job_request: CrawlJobRequest):
    """Start a new web crawling job"""
    job_id = str(len(crawl_jobs) + 1)
    
    # Create job record
    job = {
        "id": job_id,
        "url": job_request.url,
        "name": job_request.name or f"Crawl Job {job_id}",
        "status": "running",
        "progress": 0.0,
        "pages_found": 0,
        "pdfs_found": 0,
        "last_run": "Starting...",
        "error_message": None
    }
    
    crawl_jobs[job_id] = job
    
    # Start the actual crawling process in background
    background_tasks = BackgroundTasks()
    background_tasks.add_task(run_crawl_job, job_id, job_request.url)
    
    return {"job_id": job_id, "message": "Crawl job started"}

@app.get("/api/crawl/jobs")
async def get_crawl_jobs():
    """Get all crawl jobs"""
    return {"jobs": list(crawl_jobs.values())}

@app.get("/api/crawl/jobs/{job_id}")
async def get_crawl_job(job_id: str):
    """Get specific crawl job status"""
    if job_id not in crawl_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return crawl_jobs[job_id]

@app.post("/api/crawl/jobs/{job_id}/pause")
async def pause_crawl_job(job_id: str):
    """Pause a running crawl job"""
    if job_id not in crawl_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    crawl_jobs[job_id]["status"] = "paused"
    return {"message": "Job paused"}

@app.post("/api/crawl/jobs/{job_id}/stop")
async def stop_crawl_job(job_id: str):
    """Stop a running crawl job"""
    if job_id not in crawl_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    crawl_jobs[job_id]["status"] = "stopped"
    crawl_jobs[job_id]["progress"] = 0.0
    return {"message": "Job stopped"}

async def run_crawl_job(job_id: str, url: str):
    """Background task to run the actual crawling"""
    try:
        # Update job status
        crawl_jobs[job_id]["status"] = "running"
        crawl_jobs[job_id]["last_run"] = "Starting crawl..."
        
        # Import and run the existing bs4_gspread.py module
        import sys
        from pathlib import Path
        
        # Add the src directory to Python path for imports
        src_path = Path(__file__).parent.parent / "src"
        sys.path.insert(0, str(src_path))
        
        from crawl.bs4_gspread import main as run_crawl
        
        # Update job status to indicate we're running
        crawl_jobs[job_id]["last_run"] = "Running crawl..."
        
        # Call the actual crawl function
        result = run_crawl(url)
        
        if result["success"]:
            # Update job status with actual results
            crawl_jobs[job_id]["status"] = "completed"
            crawl_jobs[job_id]["progress"] = 100.0
            crawl_jobs[job_id]["pages_found"] = result["pages_found"]
            crawl_jobs[job_id]["pdfs_found"] = result["pdfs_found"]
            crawl_jobs[job_id]["last_run"] = result["message"]
        else:
            # Handle crawl failure
            crawl_jobs[job_id]["status"] = "error"
            crawl_jobs[job_id]["error_message"] = result["error"]
            crawl_jobs[job_id]["last_run"] = f"Crawl failed: {result['error']}"
        
    except Exception as e:
        crawl_jobs[job_id]["status"] = "error"
        crawl_jobs[job_id]["error_message"] = str(e)
        crawl_jobs[job_id]["last_run"] = f"Error: {str(e)}"

# PDF Processing Endpoints
@app.get("/api/pdfs")
async def get_pdf_files():
    """Get all PDF files and their processing status"""
    # This would typically read from your actual file system
    # For now, return sample data
    sample_pdfs = [
        {
            "id": "1",
            "name": "ban-tin-biwase-thang-11-nam-2025.pdf",
            "size": "2.4 MB",
            "status": "completed",
            "upload_date": "2025-12-13 18:30:00",
            "source_url": "https://biwase.com.vn/ban-tin-biwase-thang-11",
            "markdown_url": "/api/download/ban-tin-biwase-thang-11-nam-2025.md",
            "pages": 8,
            "language": "Vietnamese",
            "quality": "high"
        },
        {
            "id": "2",
            "name": "ban-tin-biwase-thang-10-nam-2025.pdf",
            "size": "2.1 MB",
            "status": "processing",
            "upload_date": "2025-12-13 18:25:00",
            "source_url": "https://biwase.com.vn/ban-tin-biwase-thang-10",
            "pages": 7,
            "language": "Vietnamese",
            "quality": "high"
        }
    ]
    return {"files": sample_pdfs}

@app.post("/api/pdfs/process")
async def process_pdfs(file_ids: List[str]):
    """Process selected PDF files"""
    return {"message": f"Processing {len(file_ids)} PDF files"}

@app.post("/api/pdfs/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload a new PDF file"""
    # Save the uploaded file
    upload_dir = Path("../src/biwase_data/pdfs_all")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = upload_dir / file.filename
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    return {"message": "File uploaded successfully", "filename": file.filename}

# RAG Query Endpoints
@app.post("/api/rag/query")
async def rag_query(query_request: QueryRequest) -> List[QueryResult]:
    """Perform RAG query and return results"""
    # This would integrate with your actual RAG pipeline
    # For now, return sample results
    
    sample_results = [
        QueryResult(
            id="1",
            content="The Vietnamese economy showed strong growth in Q3 2025, with GDP increasing by 6.8% year-over-year.",
            source="https://biwase.com.vn/ban-tin-biwase-thang-11",
            relevance=0.95,
            document_title="Bản tin Biwase tháng 11 năm 2025",
            page_number=3,
            similarity=0.92
        ),
        QueryResult(
            id="2",
            content="Foreign direct investment reached $15.2 billion in the first nine months of 2025.",
            source="https://biwase.com.vn/ban-tin-biwase-thang-11",
            relevance=0.88,
            document_title="Bản tin Biwase tháng 11 năm 2025",
            page_number=5,
            similarity=0.87
        )
    ]
    
    return sample_results[:query_request.max_results]

@app.get("/api/rag/stats")
async def get_rag_stats():
    """Get RAG system statistics"""
    return {
        "total_documents": 127,
        "processed_pdfs": 89,
        "text_chunks": 2847,
        "vector_size": 768
    }

@app.get("/api/rag/history")
async def get_query_history():
    """Get recent query history"""
    return {
        "queries": [
            {
                "id": "1",
                "query": "Tình hình kinh tế Việt Nam Q3 2025",
                "timestamp": "2025-12-13 20:30:00",
                "results_count": 8,
                "response_time": "1.2s"
            }
        ]
    }

# File download endpoints
@app.get("/api/download/{filename}")
async def download_file(filename: str):
    """Download processed files"""
    file_path = Path(f"../src/biwase_data/pdfs_smart/{filename}")
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(path=file_path, filename=filename)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
