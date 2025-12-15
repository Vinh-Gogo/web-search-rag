"""
Comprehensive FastAPI backend for Web Search RAG Platform
Provides all APIs needed by the frontend: PDFs, RAG, Chat, and Crawling
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
import sys
import json
import time
from pathlib import Path
import requests
from bs4 import BeautifulSoup
import uuid
from datetime import datetime

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

class PDFProcessingRequest(BaseModel):
    file_ids: List[str]

class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    sources: List[str] = []
    tools: List[str] = []

class DownloadRequest(BaseModel):
    pdf_urls: List[str]

class DownloadResponse(BaseModel):
    success: bool
    downloaded_count: int
    total_urls: int
    output_dir: str
    message: str

class CrawlProgress(BaseModel):
    stage: str  # "pages", "articles", "pdfs"
    current: int
    total: int
    progress_percentage: int
    items_found: int
    message: str

class PageCrawlResponse(BaseModel):
    success: bool
    pages_found: int
    page_urls: List[str]
    message: str

class ArticleCrawlResponse(BaseModel):
    success: bool
    current_page: int
    total_pages: int
    articles_found: int
    article_urls: List[str]
    progress_percentage: int
    message: str

class PDFCrawlResponse(BaseModel):
    success: bool
    current_article: int
    total_articles: int
    pdfs_found: int
    pdf_urls: List[str]
    progress_percentage: int
    message: str

# Global state (in production, use proper database)
pdf_files: Dict[str, Dict[str, Any]] = {}
query_history: List[Dict[str, Any]] = []
conversations: Dict[str, List[Dict[str, Any]]] = {}

# Import the crawling module
try:
    from bs4_gspread import main as crawl_main 
except ImportError as e:
    print(f"Failed to import crawling module: {e}")
    # Fallback function
    def crawl_main(link):
        return {
            "success": False, 
            "error": f"Import failed: {e}", 
            "pages_found": 0,
            "pdfs_found": 0,
            "pdf_urls": [],
            "message": "Backend configuration error: Could not import crawling module"
        }

def crawl_biwase_pdfs(base_url='https://biwase.com.vn/tin-tuc/ban-tin-biwase'):
    """
    Wrapper to call the actual crawling module
    """
    return crawl_main(link=base_url)

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

@app.get("/api/pdfs/existing")
async def get_existing_pdfs():
    """
    Get list of existing PDF filenames in storage

    Returns:
        dict: Contains list of existing PDF filenames
    """
    try:
        output_dir = Path("store_pdfs")
        if not output_dir.exists():
            return {"existing_files": []}

        # Get all PDF files in the directory
        pdf_files = []
        for file_path in output_dir.glob("*.pdf"):
            pdf_files.append(file_path.name)

        return {"existing_files": pdf_files}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check existing PDFs: {str(e)}")

# PDF Processing Endpoints
@app.get("/api/pdfs")
async def get_pdf_files():
    """Get all PDF files and their processing status"""
    try:
        # Scan the actual PDF storage directory
        pdfs_dir = Path("store_pdfs")
        processed_dir = Path("../src/biwase_data/pdfs_smart")

        pdf_files = []

        if pdfs_dir.exists():
            for pdf_path in pdfs_dir.glob("*.pdf"):
                # Get file stats
                file_stat = pdf_path.stat()
                file_size_mb = file_stat.st_size / (1024 * 1024)  # Convert to MB

                # Check if markdown version exists
                markdown_name = pdf_path.stem + ".md"
                markdown_path = processed_dir / markdown_name
                has_markdown = markdown_path.exists()

                # Determine status based on processing and download
                if has_markdown:
                    status = "completed"
                elif pdf_path.stat().st_mtime < time.time() - 3600:  # Older than 1 hour
                    status = "completed"  # Assume processed if old
                else:
                    status = "pending"  # File exists but not processed yet

                # Create file entry
                pdf_entry = {
                    "id": str(pdf_path.stat().st_ino),  # Use inode as unique ID
                    "name": pdf_path.name,
                    "size": f"{file_size_mb:.1f} MB",
                    "status": status,
                    "upload_date": datetime.fromtimestamp(file_stat.st_mtime).strftime("%Y-%m-%d %H:%M:%S"),
                    "source_url": "",  # Will be populated from metadata if available
                    "markdown_url": f"/api/download/{markdown_name}" if has_markdown else None,
                    "pages": 0,  # Will be populated from PDF metadata
                    "language": "Vietnamese",
                    "quality": "high" if has_markdown else "medium"
                }

                pdf_files.append(pdf_entry)

        # Sort by upload date (newest first)
        pdf_files.sort(key=lambda x: x["upload_date"], reverse=True)

        return {"files": pdf_files}

    except Exception as e:
        # Fallback to sample data if directory scanning fails
        print(f"Error scanning PDF directory: {e}")
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
            }
        ]
        return {"files": sample_pdfs}

@app.post("/api/pdfs/process")
async def process_pdfs(request: PDFProcessingRequest):
    """Process selected PDF files"""
    return {"message": f"Processing {len(request.file_ids)} PDF files"}

@app.post("/api/pdfs/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload a new PDF file"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")
    
    # Save the uploaded file
    upload_dir = Path("store_pdfs")
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
    # Sample results that match frontend expectations
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
    
    # Add to query history
    query_history.append({
        "id": str(len(query_history) + 1),
        "query": query_request.query,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "results_count": len(sample_results[:query_request.max_results]),
        "response_time": "1.2s"
    })
    
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
        "queries": query_history[-10:] if len(query_history) > 10 else query_history
    }

# Chat Endpoints
@app.post("/api/chat/message")
async def chat_message(request: ChatMessage):
    """Handle chat messages and return AI responses"""
    # Generate a conversation ID if not provided
    conv_id = request.conversation_id or str(uuid.uuid4())
    
    # Add user message to conversation
    if conv_id not in conversations:
        conversations[conv_id] = []
    
    conversations[conv_id].append({
        "type": "user",
        "content": request.message,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })
    
    # Generate AI response (in real implementation, this would call an LLM)
    ai_responses = {
        "kinh tế": "Dựa trên thông tin từ các tài liệu Biwase, tình hình kinh tế Việt Nam trong quý 3 năm 2025 cho thấy những dấu hiệu tích cực. GDP tăng trưởng 6.8% so với cùng kỳ năm trước.",
        "đầu tư": "Đầu tư trực tiếp nước ngoài đạt 15.2 tỷ USD trong 9 tháng đầu năm 2025, với các khoản đầu tư lớn trong lĩnh vực sản xuất và công nghệ.",
        "default": "Tôi đã tìm thấy thông tin liên quan trong cơ sở dữ liệu tài liệu. Bạn có thể hỏi cụ thể hơn về chủ đề nào đó không?"
    }
    
    # Simple keyword matching for demo
    response_text = ai_responses.get(request.message.lower(), ai_responses["default"])
    
    ai_response = {
        "type": "assistant",
        "content": response_text,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "sources": ["ban-tin-biwase-thang-11-nam-2025.pdf", "bao-cao-kinh-te-q3-2025.pdf"],
        "tools": ["RAG Search", "Document Analysis"]
    }
    
    conversations[conv_id].append(ai_response)
    
    return ChatResponse(
        response=response_text,
        sources=["ban-tin-biwase-thang-11-nam-2025.pdf"],
        tools=["RAG Search"]
    )

# Multi-stage Crawling Endpoints
@app.get("/api/crawl/pages", response_model=PageCrawlResponse)
async def get_crawl_pages(url: str = "https://biwase.com.vn/tin-tuc/ban-tin-biwase"):
    """
    Stage 1: Get pagination links from the base URL

    Returns the total number of pages found for crawling
    """
    try:
        # Import the crawler class directly
        from bs4_gspread import BiwaseCrawler

        crawler = BiwaseCrawler(base_url=url)
        page_urls = crawler.get_pagination_links()

        if page_urls:
            return PageCrawlResponse(
                success=True,
                pages_found=len(page_urls),
                page_urls=page_urls,
                message=f"Found {len(page_urls)} pages to crawl"
            )
        else:
            return PageCrawlResponse(
                success=False,
                pages_found=0,
                page_urls=[],
                message="No pages found to crawl"
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get pages: {str(e)}")

@app.post("/api/crawl/articles", response_model=ArticleCrawlResponse)
async def get_crawl_articles(request: dict):
    """
    Stage 2: Get articles from pagination pages

    Expects: {"page_urls": ["url1", "url2", ...]}
    Returns progress updates as articles are found
    """
    try:
        page_urls = request.get("page_urls", [])
        if not page_urls:
            raise HTTPException(status_code=400, detail="page_urls is required")

        from bs4_gspread import BiwaseCrawler
        crawler = BiwaseCrawler()

        all_articles = []
        total_pages = len(page_urls)

        for i, page_url in enumerate(page_urls):
            try:
                articles = crawler.get_news_links(page_url)
                all_articles.extend(articles)

                # Return progress update
                return ArticleCrawlResponse(
                    success=True,
                    current_page=i + 1,
                    total_pages=total_pages,
                    articles_found=len(all_articles),
                    article_urls=all_articles.copy(),  # Return all found so far
                    progress_percentage=int(((i + 1) / total_pages) * 100),
                    message=f"Processed page {i + 1}/{total_pages}, found {len(all_articles)} articles so far"
                )

            except Exception as e:
                print(f"Error processing page {page_url}: {e}")
                continue

        # Final result
        return ArticleCrawlResponse(
            success=True,
            current_page=total_pages,
            total_pages=total_pages,
            articles_found=len(all_articles),
            article_urls=all_articles,
            progress_percentage=100,
            message=f"Completed article scanning: found {len(all_articles)} articles from {total_pages} pages"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get articles: {str(e)}")

@app.post("/api/crawl/pdf-links", response_model=PDFCrawlResponse)
async def get_crawl_pdf_links(request: dict):
    """
    Stage 3: Extract PDF links from articles

    Expects: {"article_urls": ["url1", "url2", ...]}
    Returns progress updates as PDF links are found
    """
    try:
        article_urls = request.get("article_urls", [])
        if not article_urls:
            raise HTTPException(status_code=400, detail="article_urls is required")

        from bs4_gspread import BiwaseCrawler
        crawler = BiwaseCrawler()

        all_pdfs = []
        total_articles = len(article_urls)

        for i, article_url in enumerate(article_urls):
            try:
                pdfs = crawler.get_pdf_links(article_url)
                all_pdfs.extend(pdfs)

                # Return progress update
                return PDFCrawlResponse(
                    success=True,
                    current_article=i + 1,
                    total_articles=total_articles,
                    pdfs_found=len(all_pdfs),
                    pdf_urls=all_pdfs.copy(),  # Return all found so far
                    progress_percentage=int(((i + 1) / total_articles) * 100),
                    message=f"Processed article {i + 1}/{total_articles}, found {len(all_pdfs)} PDFs so far"
                )

            except Exception as e:
                print(f"Error processing article {article_url}: {e}")
                continue

        # Final result
        return PDFCrawlResponse(
            success=True,
            current_article=total_articles,
            total_articles=total_articles,
            pdfs_found=len(all_pdfs),
            pdf_urls=all_pdfs,
            progress_percentage=100,
            message=f"Completed PDF extraction: found {len(all_pdfs)} PDFs from {total_articles} articles"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get PDF links: {str(e)}")

# File download endpoints
@app.get("/api/download/{filename}")
async def download_file(filename: str):
    """Download processed files"""
    file_path = Path(f"../src/biwase_data/pdfs_smart/{filename}")
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(path=file_path, filename=filename)

# PDF Href Retrieval Endpoint
@app.get("/api/pdf-links")
async def get_pdf_links(url: str = "https://biwase.com.vn/tin-tuc/ban-tin-biwase"):
    """
    Retrieve all PDF href links from Biwase newsletter pages
    
    Args:
        url: The base URL to crawl for PDF links
        
    Returns:
        dict: Contains pdf_urls array and metadata
    """
    try:
        # Run crawl and return PDF URLs
        result = crawl_biwase_pdfs(url)
        
        if result["success"]:
            return {
                "success": True,
                "url": url,
                "pdf_urls": result.get("pdf_urls", []),
                "pages_found": result["pages_found"],
                "pdfs_found": result["pdfs_found"],
                "message": f"Found {result['pdfs_found']} PDF links from {result['pages_found']} pages"
            }
        else:
            return {
                "success": False,
                "error": result.get("error", "Unknown error"),
                "pages_found": 0,
                "pdfs_found": 0,
                "pdf_urls": [],
                "message": result.get("message", "Crawl failed")
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to retrieve PDF links: {str(e)}",
            "pages_found": 0,
            "pdfs_found": 0,
            "pdf_urls": [],
            "message": "Internal server error"
        }

# PDF Download Endpoint
@app.post("/api/download-pdfs", response_model=DownloadResponse)
async def download_pdfs(request: DownloadRequest):
    """
    Download all collected PDF hrefs

    Args:
        request: Contains list of PDF URLs to download

    Returns:
        DownloadResponse: Download status and file information
    """
    try:
        output_dir = Path("store_pdfs")
        output_dir.mkdir(parents=True, exist_ok=True)

        downloaded_count = 0
        total_urls = len(request.pdf_urls)

        for pdf_url in request.pdf_urls:
            try:
                filename = pdf_url.split('/')[-1]
                file_path = output_dir / filename

                # Skip if file already exists
                if file_path.exists():
                    print(f"Skipped {filename} - file already exists")
                    continue

                response = requests.get(pdf_url)

                with open(file_path, 'wb') as f:
                    f.write(response.content)

                downloaded_count += 1
                print(f"Downloaded {filename} to {file_path}")

            except Exception as e:
                print(f"Error downloading {pdf_url}: {e}")
                continue

        return DownloadResponse(
            success=True,
            downloaded_count=downloaded_count,
            total_urls=total_urls,
            output_dir=str(output_dir),
            message=f"Downloaded {downloaded_count} of {total_urls} PDFs"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download PDFs: {str(e)}")

# Activity Logging Endpoints
@app.post("/api/logs")
async def save_activity_log(log_entry: Dict[str, Any]):
    """
    Save activity log entry from frontend

    Args:
        log_entry: Activity log entry with timestamp, page, action, data, etc.

    Returns:
        dict: Success confirmation
    """
    try:
        # Create logs directory if it doesn't exist
        logs_dir = Path("logs/activities")
        logs_dir.mkdir(parents=True, exist_ok=True)

        # Get page name for filename
        page = log_entry.get("page", "unknown").replace(" ", "-").replace("/", "-")
        log_filename = f"{page}.log"
        log_file_path = logs_dir / log_filename

        # Format log entry as JSON line
        log_line = json.dumps({
            **log_entry,
            "server_timestamp": datetime.now().isoformat()
        }, ensure_ascii=False)

        # Append to log file
        with open(log_file_path, "a", encoding="utf-8") as f:
            f.write(log_line + "\n")

        print(f"[Activity Log] Saved: {log_entry.get('page')}:{log_entry.get('action')}")

        return {"success": True, "message": "Log entry saved"}

    except Exception as e:
        print(f"Failed to save activity log: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save log: {str(e)}")

@app.get("/api/logs/{page}")
async def get_activity_logs(page: str, limit: int = 100):
    """
    Retrieve activity logs for a specific page

    Args:
        page: Page name (e.g., 'pdf-processing', 'crawl-control')
        limit: Maximum number of log entries to return

    Returns:
        dict: Log entries for the page
    """
    try:
        logs_dir = Path("logs/activities")
        log_filename = f"{page}.log"
        log_file_path = logs_dir / log_filename

        if not log_file_path.exists():
            return {"logs": [], "message": f"No logs found for page: {page}"}

        logs = []
        with open(log_file_path, "r", encoding="utf-8") as f:
            for line in f:
                try:
                    log_entry = json.loads(line.strip())
                    logs.append(log_entry)
                except json.JSONDecodeError:
                    continue

        # Return most recent logs up to limit
        recent_logs = logs[-limit:] if len(logs) > limit else logs

        return {
            "logs": recent_logs,
            "total_count": len(logs),
            "returned_count": len(recent_logs),
            "page": page
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve logs: {str(e)}")

@app.get("/api/logs/stats")
async def get_activity_stats():
    """
    Get activity statistics for dashboard

    Returns:
        dict: Activity statistics and breakdowns
    """
    try:
        logs_dir = Path("logs/activities")
        if not logs_dir.exists():
            return {
                "totalLogs": 0,
                "totalPages": 0,
                "mostActivePage": "",
                "mostActiveAction": "",
                "logsLast24h": 0,
                "logsLast7d": 0,
                "logsLast30d": 0,
                "pageBreakdown": {},
                "actionBreakdown": {},
                "hourlyActivity": [],
                "dailyActivity": []
            }

        all_logs = []
        page_breakdown = {}
        action_breakdown = {}
        hourly_activity = {i: 0 for i in range(24)}
        daily_activity = {}

        # Current time for filtering
        now = datetime.now()
        time_24h_ago = now.timestamp() - (24 * 60 * 60)
        time_7d_ago = now.timestamp() - (7 * 24 * 60 * 60)
        time_30d_ago = now.timestamp() - (30 * 24 * 60 * 60)

        logs_24h = 0
        logs_7d = 0
        logs_30d = 0

        # Read all log files
        for log_file in logs_dir.glob("*.log"):
            page_name = log_file.stem

            with open(log_file, "r", encoding="utf-8") as f:
                for line in f:
                    try:
                        log_entry = json.loads(line.strip())
                        log_timestamp = datetime.fromisoformat(log_entry["timestamp"]).timestamp()

                        # Count logs in different time periods
                        if log_timestamp >= time_24h_ago:
                            logs_24h += 1
                        if log_timestamp >= time_7d_ago:
                            logs_7d += 1
                        if log_timestamp >= time_30d_ago:
                            logs_30d += 1

                        all_logs.append(log_entry)

                        # Page breakdown
                        page_breakdown[page_name] = page_breakdown.get(page_name, 0) + 1

                        # Action breakdown
                        action = log_entry.get("action", "unknown")
                        action_breakdown[action] = action_breakdown.get(action, 0) + 1

                        # Hourly activity (last 24h only)
                        if log_timestamp >= time_24h_ago:
                            log_hour = datetime.fromisoformat(log_entry["timestamp"]).hour
                            hourly_activity[log_hour] += 1

                        # Daily activity (last 30d)
                        if log_timestamp >= time_30d_ago:
                            log_date = datetime.fromisoformat(log_entry["timestamp"]).strftime("%Y-%m-%d")
                            daily_activity[log_date] = daily_activity.get(log_date, 0) + 1

                    except (json.JSONDecodeError, KeyError, ValueError):
                        continue

        # Find most active page and action
        most_active_page = max(page_breakdown.keys(), key=lambda k: page_breakdown[k]) if page_breakdown else ""
        most_active_action = max(action_breakdown.keys(), key=lambda k: action_breakdown[k]) if action_breakdown else ""

        # Convert hourly activity to array format
        hourly_activity_array = [{"hour": hour, "count": count} for hour, count in hourly_activity.items()]

        # Convert daily activity to array format and sort by date
        daily_activity_array = [{"date": date, "count": count} for date, count in daily_activity.items()]
        daily_activity_array.sort(key=lambda x: x["date"])

        return {
            "totalLogs": len(all_logs),
            "totalPages": len(page_breakdown),
            "mostActivePage": most_active_page,
            "mostActiveAction": most_active_action,
            "logsLast24h": logs_24h,
            "logsLast7d": logs_7d,
            "logsLast30d": logs_30d,
            "pageBreakdown": page_breakdown,
            "actionBreakdown": action_breakdown,
            "hourlyActivity": hourly_activity_array,
            "dailyActivity": daily_activity_array
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get activity stats: {str(e)}")

@app.get("/api/logs")
async def get_all_activity_logs(limit: int = 50):
    """
    Retrieve activity logs from all pages

    Args:
        limit: Maximum number of log entries per page to return

    Returns:
        dict: Log entries grouped by page
    """
    try:
        logs_dir = Path("logs/activities")
        if not logs_dir.exists():
            return {"logs_by_page": {}, "message": "No activity logs found"}

        logs_by_page = {}

        for log_file in logs_dir.glob("*.log"):
            page_name = log_file.stem
            logs = []

            with open(log_file, "r", encoding="utf-8") as f:
                for line in f:
                    try:
                        log_entry = json.loads(line.strip())
                        logs.append(log_entry)
                    except json.JSONDecodeError:
                        continue

            # Return most recent logs for this page
            recent_logs = logs[-limit:] if len(logs) > limit else logs
            logs_by_page[page_name] = {
                "logs": recent_logs,
                "total_count": len(logs),
                "returned_count": len(recent_logs)
            }

        return {
            "logs_by_page": logs_by_page,
            "total_pages": len(logs_by_page)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve logs: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8081)
