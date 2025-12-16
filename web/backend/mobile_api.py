"""
Mobile-optimized API endpoints for Web Search RAG Platform
Provides lightweight endpoints with pagination, compression, and offline support
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import json

router = APIRouter(prefix="/api/mobile", tags=["mobile"])

# ============================================================================
# Mobile-Optimized Models
# ============================================================================

class MobileMessage(BaseModel):
    """Lightweight message model for mobile"""
    id: str
    type: str  # "user" | "assistant"
    content: str
    timestamp: str
    sources: Optional[List[str]] = None


class MobileConversation(BaseModel):
    """Lightweight conversation model"""
    id: str
    title: str
    lastMessage: str = Field(..., alias="last_message")
    timestamp: str
    messageCount: int = Field(..., alias="message_count")

    class Config:
        populate_by_name = True


class MobileChatRequest(BaseModel):
    """Mobile chat request with session support"""
    message: str
    conversationId: Optional[str] = Field(None, alias="conversation_id")
    includeHistory: bool = Field(True, alias="include_history")

    class Config:
        populate_by_name = True


class MobileChatResponse(BaseModel):
    """Optimized chat response for mobile"""
    id: str
    response: str
    conversationId: str = Field(..., alias="conversation_id")
    sources: List[str] = []
    timestamp: str
    messageCount: int = Field(..., alias="message_count")

    class Config:
        populate_by_name = True


class MobileQuery(BaseModel):
    """Mobile search query with pagination"""
    query: str
    limit: int = Field(10, ge=1, le=50)  # Max 50 results for mobile
    offset: int = Field(0, ge=0)


class MobileQueryResult(BaseModel):
    """Lightweight query result"""
    id: str
    title: str
    content: str
    source: str
    relevance: float = Field(..., ge=0.0, le=1.0)


class MobileQueryResponse(BaseModel):
    """Paginated query response"""
    results: List[MobileQueryResult]
    total: int
    hasMore: bool = Field(..., alias="has_more")
    offset: int

    class Config:
        populate_by_name = True


class MobilePDFItem(BaseModel):
    """Lightweight PDF metadata"""
    id: str
    name: str
    size: int  # Bytes
    uploadedAt: str = Field(..., alias="uploaded_at")
    pageCount: int = Field(..., alias="page_count")


class MobilePDFResponse(BaseModel):
    """Paginated PDF list"""
    pdfs: List[MobilePDFItem]
    total: int
    hasMore: bool = Field(..., alias="has_more")
    offset: int

    class Config:
        populate_by_name = True


class SyncData(BaseModel):
    """Data for offline-first synchronization"""
    conversationId: str = Field(..., alias="conversation_id")
    messages: List[Dict[str, Any]]
    lastSync: str = Field(..., alias="last_sync")


class SyncResponse(BaseModel):
    """Response from sync endpoint"""
    success: bool
    synced: int
    conflicts: List[Dict[str, Any]] = []
    lastSync: str = Field(..., alias="last_sync")

    class Config:
        populate_by_name = True


# ============================================================================
# Mobile API Endpoints
# ============================================================================

@router.get("/health", summary="Mobile Health Check")
async def mobile_health():
    """
    Quick health check for mobile app
    Minimal response for low-bandwidth scenarios
    """
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }


@router.post(
    "/chat",
    response_model=MobileChatResponse,
    summary="Send Chat Message (Mobile)",
    description="Optimized chat endpoint for mobile with lightweight response"
)
async def mobile_chat(request: MobileChatRequest):
    """
    Mobile-optimized chat endpoint
    - Smaller response payload
    - Session/conversation support
    - Optional history inclusion
    """
    try:
        # Generate conversation ID if not provided
        conversation_id = request.conversationId or str(datetime.utcnow().timestamp())
        
        # Simulate response (replace with actual RAG logic)
        response = {
            "id": f"msg_{int(datetime.utcnow().timestamp())}",
            "response": f"Received: {request.message}",
            "conversation_id": conversation_id,
            "sources": [],
            "timestamp": datetime.utcnow().isoformat(),
            "message_count": 1
        }
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/conversations",
    response_model=List[MobileConversation],
    summary="List Conversations (Mobile)",
    description="Get list of conversations with pagination"
)
async def mobile_get_conversations(
    limit: int = Query(10, ge=1, le=50),
    offset: int = Query(0, ge=0)
):
    """
    Retrieve conversations for mobile
    - Paginated results (max 50)
    - Lightweight metadata only
    - Sorted by most recent first
    """
    try:
        # Simulate data (replace with actual database query)
        conversations = [
            {
                "id": f"conv_{i}",
                "title": f"Conversation {i+1}",
                "last_message": "Last message preview...",
                "timestamp": datetime.utcnow().isoformat(),
                "message_count": 5
            }
            for i in range(limit)
        ]
        return conversations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/conversations/{conversation_id}/messages",
    response_model=List[MobileMessage],
    summary="Get Conversation Messages (Mobile)",
    description="Retrieve paginated messages from a conversation"
)
async def mobile_get_messages(
    conversation_id: str,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    Retrieve messages from a conversation
    - Paginated for efficient loading
    - Recent messages first
    - Lightweight payload
    """
    try:
        # Simulate data (replace with actual database query)
        messages = [
            {
                "id": f"msg_{i}",
                "type": "user" if i % 2 == 0 else "assistant",
                "content": f"Message {i+1}",
                "timestamp": datetime.utcnow().isoformat(),
                "sources": []
            }
            for i in range(limit)
        ]
        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/search",
    response_model=MobileQueryResponse,
    summary="Search Knowledge Base (Mobile)",
    description="Optimized search with pagination for mobile"
)
async def mobile_search(request: MobileQuery):
    """
    Search endpoint optimized for mobile
    - Paginated results
    - Max 50 results per request
    - Lightweight metadata
    """
    try:
        # Simulate search results (replace with actual RAG search)
        results = [
            {
                "id": f"result_{i}",
                "title": f"Result {i+1}",
                "content": f"Snippet of content {i+1}...",
                "source": f"document_{i}.pdf",
                "relevance": 0.95 - (i * 0.05)
            }
            for i in range(min(request.limit, 10))
        ]
        
        total = 100  # Replace with actual count
        has_more = (request.offset + request.limit) < total
        
        return {
            "results": results,
            "total": total,
            "has_more": has_more,
            "offset": request.offset
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/pdfs",
    response_model=MobilePDFResponse,
    summary="List PDFs (Mobile)",
    description="Get paginated list of PDF documents"
)
async def mobile_get_pdfs(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    sort: str = Query("recent", regex="^(recent|name|size)$")
):
    """
    Retrieve PDF list for mobile
    - Paginated results
    - Optional sorting (recent, name, size)
    - Lightweight metadata
    """
    try:
        # Simulate PDF list (replace with actual database query)
        pdfs = [
            {
                "id": f"pdf_{i}",
                "name": f"Document_{i+1}.pdf",
                "size": 1024 * (i + 1),  # In bytes
                "uploaded_at": datetime.utcnow().isoformat(),
                "page_count": 10 + i
            }
            for i in range(limit)
        ]
        
        total = 50  # Replace with actual count
        has_more = (offset + limit) < total
        
        return {
            "pdfs": pdfs,
            "total": total,
            "has_more": has_more,
            "offset": offset
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/sync",
    response_model=SyncResponse,
    summary="Sync Offline Data (Mobile)",
    description="Synchronize cached data with server"
)
async def mobile_sync(data: SyncData):
    """
    Offline-first synchronization endpoint
    - Sync locally cached messages
    - Detect conflicts
    - Update last sync timestamp
    """
    try:
        synced_count = len(data.messages)
        
        # Simulate sync (replace with actual database operations)
        response = {
            "success": True,
            "synced": synced_count,
            "conflicts": [],
            "last_sync": datetime.utcnow().isoformat()
        }
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/stats",
    summary="Quick Stats (Mobile)",
    description="Get quick statistics for mobile dashboard"
)
async def mobile_get_stats():
    """
    Return lightweight statistics
    - Document count
    - Message count
    - Last activity
    """
    return {
        "totalDocuments": 50,
        "totalMessages": 100,
        "totalSearches": 500,
        "lastActivity": datetime.utcnow().isoformat(),
        "storageUsed": 52428800  # In bytes
    }


@router.post(
    "/cache-stats",
    summary="Report Cache Stats (Mobile)",
    description="Mobile app reports its local cache statistics"
)
async def mobile_report_cache_stats(stats: Dict[str, Any]):
    """
    Receive cache statistics from mobile app
    - Local storage usage
    - Cached message count
    - Last sync time
    """
    return {
        "received": True,
        "message": "Cache stats recorded"
    }


# ============================================================================
# Utility Endpoints for Mobile
# ============================================================================

@router.get(
    "/version",
    summary="API Version (Mobile)",
    description="Check API version for compatibility"
)
async def mobile_get_version():
    """Return API version for client compatibility checks"""
    return {
        "version": "1.0.0",
        "minClientVersion": "1.0.0",
        "features": [
            "chat",
            "search",
            "offline-sync",
            "pdf-management"
        ]
    }


@router.post(
    "/feedback",
    summary="Submit Feedback (Mobile)",
    description="Mobile app submit feedback/bug reports"
)
async def mobile_submit_feedback(feedback: Dict[str, Any]):
    """
    Collect feedback from mobile app
    - Bug reports
    - Feature requests
    - Performance metrics
    """
    return {
        "success": True,
        "message": "Feedback received",
        "id": f"feedback_{int(datetime.utcnow().timestamp())}"
    }
