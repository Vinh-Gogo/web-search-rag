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

# Global state (in production, use proper database)
pdf_files: Dict[str, Dict[str, Any]] = {}
query_history: List[Dict[str, Any]] = []
conversations: Dict[str, List[Dict[str, Any]]] = {}

def crawl_biwase_pdfs(base_url='https://biwase.com.vn/tin-tuc/ban-tin-biwase'):
    """
    Crawl Biwase newsletter pages and extract PDF links
    """
    # Create output directory
    output_dir = Path("src/biwase_data/pdfs_all")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Initialize data structures
    pages_num = []
    news = []
    pdfs = []
    
    try:
        print(f"Starting crawl from: {base_url}")
        
        # Get initial page
        html = requests.get(base_url).content
        soup = BeautifulSoup(html.decode('utf-8'), 'html.parser')

        # Get all <a class="ModulePager" href=...> links
        for pager in soup.find_all('a', class_='ModulePager'):
            href = pager.get('href')
            if href:
                pages_num.append(href)

        print(f"Found {len(pages_num)} pagination pages")
        pages_found = len(pages_num)

        # Process each pagination page
        for page in pages_num:
            time.sleep(1)  # Reduced rate limiting for API
            print(f"Processing page: {page}")
            
            try:
                html = requests.get(page).content
                soup = BeautifulSoup(html.decode('utf-8'), 'html.parser')
                
                # Get all <a class="img-scale" href=...> links
                for a in soup.find_all('a', class_='img-scale'):
                    href = a.get('href')
                    if href:
                        news.append(href)
            except Exception as e:
                print(f"Error processing page {page}: {e}")
                continue

        # Remove duplicates
        news = list(set(news))
        print(f"Found {len(news)} unique news articles")

        # Process each news article to find PDF links
        for new in news:
            time.sleep(1)  # Reduced rate limiting for API
            print(f"Processing news article: {new}")
            
            try:
                html = requests.get(new).content
                soup = BeautifulSoup(html.decode('utf-8'), 'html.parser')

                # Get all <iframe src=...> links
                for iframe in soup.find_all('iframe'):
                    iframe_src = iframe.get('src')
                    if iframe_src:
                        src = f"https://biwase.com.vn/{iframe_src}"
                        pdfs.append(src)
            except Exception as e:
                print(f"Error processing news article {new}: {e}")
                continue

        # Unique PDFs only
        pdfs = list(set(pdfs))
        pdfs_found = len(pdfs)
        print(f"Total PDFs found in {len(news)} news: {pdfs_found}")

        return {
            "success": True,
            "pages_found": pages_found,
            "pdfs_found": pdfs_found,
            "pdf_urls": pdfs,  # Return the actual PDF URLs
            "message": f"Successfully crawled and found {pdfs_found} PDFs from {pages_found} pages"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "pages_found": 0,
            "pdfs_found": 0,
            "pdf_urls": [],
            "message": f"Crawl failed: {e}"
        }

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

# PDF Processing Endpoints
@app.get("/api/pdfs")
async def get_pdf_files():
    """Get all PDF files and their processing status"""
    # Return sample data that matches frontend expectations
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
        },
        {
            "id": "3",
            "name": "ban-tin-biwase-thang-9-nam-2025.pdf",
            "size": "1.8 MB",
            "status": "error",
            "upload_date": "2025-12-13 18:20:00",
            "source_url": "https://biwase.com.vn/ban-tin-biwase-thang-9",
            "pages": 0,
            "language": "Vietnamese",
            "quality": "medium"
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
            raise HTTPException(status_code=500, detail=result["error"])
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve PDF links: {str(e)}")

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
        output_dir = Path("../src/biwase_data/pdfs_all")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        downloaded_count = 0
        total_urls = len(request.pdf_urls)
        
        for pdf_url in request.pdf_urls:
            try:
                response = requests.get(pdf_url)
                filename = pdf_url.split('/')[-1]
                file_path = output_dir / filename
                
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

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
