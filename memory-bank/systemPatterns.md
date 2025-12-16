# System Patterns & Architecture

## Overall Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Chat Interface | Debug View | Tools | PDF Manager   │   │
│  │ (chat/page.tsx, components, hooks)                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↕ (HTTP/REST)
┌─────────────────────────────────────────────────────────────┐
│                   Backend (FastAPI)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ API Routes:                                          │   │
│  │ • /api/chat - Chat with RAG                         │   │
│  │ • /api/query - Search knowledge base               │   │
│  │ • /api/pdfs - PDF management                       │   │
│  │ • /api/crawl - Web crawling                        │   │
│  │ • /api/health - Health check                       │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Processing Layer:                                    │   │
│  │ • PDF parsing (PyPDF2)                             │   │
│  │ • Embeddings (Sentence Transformers)               │   │
│  │ • Web crawling (Playwright, BeautifulSoup4)        │   │
│  │ • RAG (LangChain integration)                       │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Storage Layer:                                       │   │
│  │ • Vector DB (Qdrant/ChromaDB)                      │   │
│  │ • PDF storage (web/backend/store_pdfs/)            │   │
│  │ • JSON metadata                                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Key Technical Decisions

1. **Separation of Concerns**: Frontend handles UI, backend handles all processing
2. **RESTful API**: Clear, stateless endpoints for all operations
3. **Async Processing**: Background tasks for long-running operations (crawling, embedding generation)
4. **Vector Embeddings**: Sentence Transformers for semantic similarity
5. **Component-Based UI**: React components with TailwindCSS for responsive design
6. **State Management**: Zustand for frontend state, REST for backend persistence
7. **Type Safety**: TypeScript on frontend, Pydantic on backend

## Component Relationships

### Frontend Structure

- **Pages**: `app/page.tsx`, `app/chat/page.tsx`, `app/rag/page.tsx`, `app/pdfs/page.tsx`, `app/archive/page.tsx`
- **Components**: Reusable UI components (Navigation, ThemeToggle, VirtualizedMessageList, etc.)
- **Hooks**: Custom hooks (useActivityLogger, useMediaQuery)
- **Lib**: Utilities, colors, async store management

### Backend Structure

- **main.py**: FastAPI application, route definitions, request/response models
- **bs4_gspread.py**: Web crawling functionality
- **store_pdfs/**: Directory for storing processed PDFs

## Design Patterns in Use

1. **Chat Message Flow**:
   - User input → API request → Backend processing → Stream response → Display in UI

2. **Document Processing**:
   - PDF upload → Parse → Generate embeddings → Store in vector DB → Indexed for search

3. **RAG Query**:
   - Query → Generate embedding → Vector search → Retrieve top-k documents → Pass to LLM → Generate response

4. **Multi-Tab Interface**:
   - Chat (main interaction) | Debug (internal state) | Tools (manual operations)

## Critical Implementation Paths

1. **Chat Message Handling** ([web/src/app/chat/page.tsx](web/src/app/chat/page.tsx))
   - Manages message state, sends to backend, displays responses
   - Handles streaming responses and error states

2. **Backend API Processing** ([web/backend/main.py](web/backend/main.py))
   - Routes incoming requests
   - Orchestrates RAG pipeline (retrieval + generation)
   - Manages background tasks

3. **PDF Processing**
   - Upload endpoint receives files
   - Parse with PyPDF2
   - Generate embeddings with Sentence Transformers
   - Store in Qdrant/ChromaDB

4. **Web Crawling** ([web/backend/bs4_gspread.py](web/backend/bs4_gspread.py))
   - Crawl pages with Playwright
   - Parse HTML with BeautifulSoup4
   - Extract and download PDFs
   - Store metadata
