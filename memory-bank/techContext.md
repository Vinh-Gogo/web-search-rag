# Technical Context: Web Search RAG Platform

## Technology Stack

### Frontend
- **Framework**: Next.js 15.5.9
- **Language**: TypeScript 5
- **UI Library**: React 18.3.1
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React 0.561.0
- **Utilities**: 
  - `clsx` & `tailwind-merge` for conditional classes
  - `class-variance-authority` for component variants
- **CMS**: PayloadCMS 3.68.3 (installed but not yet configured)

### Backend
- **Framework**: FastAPI (Python)
- **Language**: Python 3.x
- **Web Scraping**: BeautifulSoup4
- **HTTP Client**: requests library
- **Data Validation**: Pydantic
- **ASGI Server**: Uvicorn

### Development Environment
- **OS**: Windows 11
- **Shell**: Git Bash / CMD
- **Package Managers**: 
  - npm (Node.js packages)
  - pip (Python packages)
- **Virtual Environment**: Python venv
- **IDE**: Visual Studio Code

### Infrastructure
- **Containerization**: Docker (Dockerfiles present, docker-compose.yml configured)
- **Local Development**:
  - Frontend: http://localhost:3000
  - Backend: http://localhost:8080
- **Version Control**: Git (GitHub repository)

## Dependencies

### Frontend Dependencies (package.json)
```json
{
  "dependencies": {
    "@payloadcms/next": "^3.68.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.561.0",
    "next": "^15.5.9",
    "payload": "^3.68.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^3.4.0",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.0.10",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

### Backend Dependencies (requirements.txt)
```
fastapi
uvicorn
beautifulsoup4
requests
pydantic
python-multipart  # For file uploads
```

## Development Setup

### Initial Setup Process

#### 1. Repository Setup
```bash
# Clone repository
git clone https://github.com/Vinh-Gogo/web-search-rag.git
cd web-search-rag
```

#### 2. Python Environment
```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd src/web-rag-platform

# Install Node dependencies
npm install

# Run development server
npm run dev
```

#### 4. Backend Setup
```bash
# Navigate to backend directory
cd src/web-rag-platform/backend

# Ensure virtual environment is activated
# Run FastAPI server
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8080
```

### Running the Application

**Terminal 1 (Backend)**:
```bash
cd src/web-rag-platform/backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8080
```

**Terminal 2 (Frontend)**:
```bash
cd src/web-rag-platform
npm run dev
```

**Access**: Open browser to http://localhost:3000

## Project Structure

### Directory Layout
```
web-search-rag/
├── .gitignore
├── README.md
├── requirements.txt                 # Python dependencies
├── asset/
│   └── image.png                   # Project screenshot
├── src/
│   ├── biwase_data/                # Data storage
│   │   ├── pdfs_all/              # Raw downloaded PDFs
│   │   └── pdfs_smart/            # Processed markdown files
│   ├── crawl/                     # Standalone crawler scripts
│   │   └── bs4_gspread.py
│   └── web-rag-platform/          # Main application
│       ├── .gitignore
│       ├── package.json           # Node dependencies
│       ├── tsconfig.json          # TypeScript config
│       ├── next.config.ts         # Next.js config
│       ├── eslint.config.mjs      # ESLint config
│       ├── postcss.config.mjs     # PostCSS config
│       ├── tailwind.config.ts     # Tailwind config (if exists)
│       ├── docker-compose.yml     # Docker orchestration
│       ├── Dockerfile.backend     # Backend container
│       ├── Dockerfile.frontend    # Frontend container
│       ├── backend/               # Python FastAPI
│       │   ├── main.py           # API entry point
│       │   ├── bs4_gspread.py    # Crawler module
│       │   ├── requirements.txt   # Backend-specific deps
│       │   ├── logs/             # Log files
│       │   └── src/              # Additional backend code
│       ├── public/               # Static assets
│       │   ├── *.svg             # Icons
│       └── src/                  # Frontend source
│           ├── app/              # Next.js app directory
│           │   ├── layout.tsx    # Root layout
│           │   ├── page.tsx      # Home/Crawl page
│           │   ├── globals.css   # Global styles
│           │   ├── archive/      # Archive page
│           │   ├── chat/         # Chat page
│           │   ├── pdfs/         # PDF management
│           │   └── rag/          # RAG search page
│           ├── components/       # Shared components
│           │   └── Navigation.tsx
│           └── lib/              # Utilities
│               └── utils.ts      # Helper functions
└── memory-bank/                  # Documentation (new)
    ├── projectbrief.md
    ├── productContext.md
    ├── systemPatterns.md
    ├── techContext.md
    ├── activeContext.md
    └── progress.md
```

## Configuration Files

### Next.js Configuration (next.config.ts)
- Configures Next.js build and runtime behavior
- TypeScript-based configuration
- Handles environment variables
- Sets up path aliases if needed

### TypeScript Configuration (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### Docker Configuration

**docker-compose.yml**:
- Orchestrates frontend and backend containers
- Defines network connections
- Volume mappings for persistent data

**Dockerfile.backend**:
- Python base image
- Installs backend dependencies
- Exposes port 8080
- Runs uvicorn server

**Dockerfile.frontend**:
- Node.js base image
- Installs npm dependencies
- Builds Next.js application
- Exposes port 3000

## Technical Constraints

### Development Constraints
1. **Windows Environment**: Primary development on Windows 11
   - Path separators: Use forward slashes or Path objects
   - Shell commands: Test in both CMD and Git Bash
   
2. **Local Development Only**: No cloud services yet
   - All data stored locally
   - No external database connections
   - File system for persistence

3. **Port Availability**: 
   - Frontend requires port 3000
   - Backend requires port 8080
   - No conflicts with other services

### Runtime Constraints
1. **Memory**: PDF processing can be memory-intensive
2. **Storage**: Downloaded PDFs accumulate quickly
3. **Network**: Crawler respects rate limits (delays between requests)

## Tool Usage Patterns

### Development Workflow

**1. Start Development Session**:
```bash
# Terminal 1: Activate venv and start backend
cd src/web-rag-platform/backend
../../../venv/Scripts/activate  # Windows
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8080

# Terminal 2: Start frontend
cd src/web-rag-platform
npm run dev
```

**2. Make Changes**:
- Edit files in VS Code
- Hot reload active for both frontend and backend (--reload flag)
- Check browser for frontend changes
- Test API endpoints at http://localhost:8080/docs (FastAPI auto-docs)

**3. Test API**:
- Use FastAPI Swagger UI: http://localhost:8080/docs
- Or use curl/Postman for manual testing
- Frontend automatically calls APIs during interaction

**4. Version Control**:
```bash
git add .
git commit -m "descriptive message"
git push origin main
```

### Common Commands

**Frontend**:
```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # Run ESLint
```

**Backend**:
```bash
# Development mode (auto-reload)
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8080

# Production mode
python -m uvicorn main:app --host 0.0.0.0 --port 8080

# Run crawler standalone
python bs4_gspread.py
```

**Docker**:
```bash
docker-compose up --build    # Build and start all services
docker-compose down          # Stop all services
docker-compose logs -f       # Follow logs
```

## API Documentation

### Auto-Generated Docs
FastAPI automatically provides:
- Swagger UI: http://localhost:8080/docs
- ReDoc: http://localhost:8080/redoc
- OpenAPI JSON: http://localhost:8080/openapi.json

### CORS Configuration
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Future Technical Considerations

### Planned Technology Additions
1. **Vector Database**: ChromaDB, Pinecone, or Weaviate for embeddings
2. **LLM Integration**: OpenAI API, Anthropic, or local models (Ollama)
3. **PDF Processing**: PyMuPDF, pdfplumber, or Marker for extraction
4. **Database**: PostgreSQL or MongoDB for metadata
5. **Task Queue**: Celery or RQ for background jobs
6. **Monitoring**: Prometheus + Grafana for observability

### Scalability Considerations
1. **Async Processing**: Leverage FastAPI's async capabilities
2. **Caching**: Redis for frequently accessed data
3. **Load Balancing**: Multiple backend instances
4. **CDN**: For static assets in production
5. **Database Indexing**: Optimize query performance

### Migration Path
1. **From localStorage to Database**: Replace frontend localStorage with backend persistence
2. **From Mock Data to Real Data**: Connect all endpoints to actual data sources
3. **From Local to Cloud**: Deploy to AWS/GCP/Azure with proper CI/CD
