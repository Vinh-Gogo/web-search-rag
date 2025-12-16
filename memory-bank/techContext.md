# Technical Context

## Technology Stack

### Frontend

- **Framework**: Next.js 15.5.9 (App Router)
- **Language**: TypeScript 5
- **UI**: React 18.3.1 with TailwindCSS 4
- **Styling**: TailwindCSS with PostCSS
- **Animation**: Framer Motion 12.23.26
- **Icons**: Lucide React 0.561.0
- **State Management**: Zustand 5.0.9
- **UI Utilities**: clsx, class-variance-authority, tailwind-merge
- **Toast Notifications**: Sonner 2.0.7
- **Virtual Lists**: React Window 2.2.3
- **Theme**: Next-themes 0.4.6
- **CMS Integration**: Payload CMS 3.68.3

### Backend

- **Framework**: FastAPI 0.104.1
- **Server**: Uvicorn 0.24.0 with standard extras
- **Language**: Python 3.8+
- **Data Validation**: Pydantic 2.5.0
- **File Handling**: Python-multipart 0.0.6, aiofiles 23.2.1
- **HTTP**: Requests 2.31.0
- **Web Parsing**: BeautifulSoup4 4.12.2
- **Browser Automation**: Playwright 1.40.0
- **ML/Embeddings**:
  - PyTorch 2.0.0+
  - Transformers 4.40.0+
  - Accelerate 0.20.0+
  - Sentence Transformers 2.3.1
- **RAG**: LangChain 0.1.0
- **Vector DB**:
  - Qdrant Client 1.7.0
  - ChromaDB 0.4.22
- **PDF Processing**: PyPDF2 3.0.1, python-docx 1.1.0

### Infrastructure

- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Port Configuration**:
  - Backend: `8080` (API on `http://localhost:8080`)
  - Frontend: `3000` (on `http://localhost:3000`)

## Development Setup

### Prerequisites

- Node.js 18+ (frontend)
- Python 3.8+ (backend)
- Git

### Backend Environment

```bash
cd web/backend
python -m venv venv
# Windows: venv\Scripts\activate
# Unix: source venv/bin/activate
pip install -r requirements.txt
playwright install  # Required for web crawling
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8080
```

### Frontend Environment

```bash
cd web
npm install
npm run dev  # Runs on http://localhost:3000
```

### API Documentation

- Swagger UI: `http://localhost:8080/docs`
- Health Check: `http://localhost:8080/api/health`

## Key Technical Constraints

1. **CORS Configuration**: Backend allows `http://localhost:3000` and `http://127.0.0.1:3000`
2. **File Storage**: PDFs stored in `web/backend/store_pdfs/`
3. **Vector Database**: Requires initialization and connection configuration
4. **Embeddings Model**: Uses Sentence Transformers (default model TBD, likely `all-MiniLM-L6-v2`)
5. **Memory**: Large PDF collections and embeddings require adequate RAM
6. **GPU Support**: PyTorch can leverage GPU if available (optional with accelerate)

## Dependency Management

### Frontend (package.json)

- Next.js App Router for file-based routing
- TailwindCSS with PostCSS for styling
- Zustand for lightweight state management
- React Window for efficient list rendering

### Backend (requirements.txt)

- FastAPI with Uvicorn for async API
- LangChain for RAG orchestration
- Sentence Transformers for embeddings
- Qdrant or ChromaDB for vector storage
- Playwright for browser automation
- PyPDF2 for PDF extraction

## Tool Usage Patterns

### Development

- `npm run dev` - Start frontend in dev mode with hot reload
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues
- `npm run type-check` - TypeScript validation
- `npm run build` - Production build

### Backend

- `uvicorn main:app --reload` - Development mode with auto-reload
- `uvicorn main:app` - Production mode
- Swagger UI at `/docs` for API testing

### Containerization

- `docker-compose up` - Build and start both services
- Services: `backend` (FastAPI), `frontend` (Next.js)

## Known Technical Patterns

1. **Async Streaming**: Backend streams responses for long-running operations
2. **Error Handling**: Pydantic models validate all inputs, HTTPException for API errors
3. **Background Tasks**: FastAPI background tasks for non-blocking operations
4. **Client-Side State**: Zustand stores for UI state, REST for persistence
5. **Type Inference**: TypeScript inference from React props and hooks
