# Technology Context - Web Search RAG Platform

## Technology Stack

### Frontend Technologies

#### Core Framework
- **Next.js 15.5.9**: React framework with App Router, server components, and built-in optimizations
- **React 18.3.1**: UI library with concurrent features and hooks
- **TypeScript 5**: Type-safe JavaScript with strict type checking

#### UI & Styling
- **Tailwind CSS 4**: Utility-first CSS framework with custom design system
- **Tailwind CSS Animate**: Animation utilities for smooth transitions
- **Framer Motion 12.23.26**: Animation library for complex UI transitions
- **Lucide React 0.561.0**: Modern icon library with consistent design
- **Class Variance Authority**: Component variant management
- **clsx**: Conditional CSS class merging utility

#### State Management & Data
- **Zustand 5.0.9**: Lightweight state management with TypeScript support
- **Sonner 2.0.7**: Toast notification system
- **React Window 2.2.3**: Virtual scrolling for performance with large lists

#### Development Tools
- **ESLint 9**: Code linting with Next.js configuration
- **PostCSS 4**: CSS processing with Tailwind integration
- **TypeScript Compiler**: Type checking and compilation
- **Next.js Type Check**: Development-time type validation

### Backend Technologies

#### Core Framework
- **FastAPI 0.104.1**: Modern Python web framework with automatic API documentation
- **Uvicorn 0.24.0**: ASGI server for FastAPI with standard optimizations
- **Pydantic 2.5.0**: Data validation and serialization

#### Data Processing & AI/ML
- **PyTorch 2.0.0+**: Deep learning framework for AI models
- **Transformers 4.40.0+**: Hugging Face library for NLP models
- **Accelerate 0.20.0+**: Distributed training and inference optimization
- **Sentence Transformers 2.3.1**: Text embedding generation for Vietnamese
- **LangChain 0.1.0**: Framework for LLM application development

#### Vector Databases
- **Qdrant Client 1.7.0**: Production vector database for similarity search
- **ChromaDB 0.4.22**: Development vector database with simple setup

#### Web Scraping & Processing
- **BeautifulSoup4 4.12.2**: HTML parsing and web scraping
- **Playwright 1.40.0**: Browser automation for dynamic content
- **Requests 2.31.0**: HTTP library for API calls
- **PyPDF2 3.0.1**: PDF text extraction and manipulation
- **python-docx 1.1.0**: Microsoft Word document processing

#### Utilities
- **python-multipart 0.0.6**: File upload handling for FastAPI
- **aiofiles 23.2.1**: Asynchronous file operations

### Development Environment

#### Version Control
- **Git**: Distributed version control with GitHub remote repository
- **GitHub**: Code hosting and collaboration platform

#### Package Management
- **npm**: Node.js package manager for frontend dependencies
- **pip**: Python package manager for backend dependencies
- **venv**: Python virtual environment for dependency isolation

#### Development Tools
- **Visual Studio Code**: Primary IDE with TypeScript and Python support
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting (implied by ESLint configuration)

### Infrastructure & Deployment

#### Local Development
- **Frontend Server**: Next.js dev server (default port 3000, fallback to 3001)
- **Backend Server**: Uvicorn/FastAPI (port 8080)
- **CORS Configuration**: Configured for localhost development

#### File Storage
- **PDF Storage**: Local file system (`store_pdfs/` directory)
- **Processed Data**: Local file system (`web/src/biwase_data/pdfs_smart/`)
- **Logs**: Local JSON-based logging (`logs/activities/`)

#### Environment Configuration
- **Frontend**: `.env.local` for environment variables
- **Backend**: Environment variables for API keys and configuration

## Development Setup

### Prerequisites
- **Node.js**: Version compatible with Next.js 15 (LTS recommended)
- **Python**: 3.8+ for backend dependencies
- **Git**: For version control

### Frontend Setup
```bash
cd web
npm install
npm run dev  # Starts on localhost:3000 or :3001
```

### Backend Setup
```bash
cd web/backend
python -m venv venv
# Windows: venv\Scripts\activate
# Unix: source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8080
```

### Development Scripts
- **Frontend**:
  - `npm run dev`: Start development server
  - `npm run build`: Production build
  - `npm run start`: Start production server
  - `npm run lint`: Run ESLint
  - `npm run type-check`: Run TypeScript compiler

- **Backend**:
  - `python -m uvicorn main:app --reload`: Start development server
  - No build process (interpreted language)

## Technical Constraints

### Performance Limitations
- **Memory**: Embedding generation requires significant RAM (4GB+ recommended)
- **Processing Time**: PDF processing can be CPU-intensive
- **Network**: Crawling operations depend on target website responsiveness
- **Storage**: Vector databases grow with document volume

### Compatibility Constraints
- **Browser Support**: Modern browsers with ES2020+ support
- **Python Version**: 3.8+ required for async/await syntax
- **Node Version**: Compatible with Next.js 15 requirements

### External Dependencies
- **Hugging Face Models**: Requires internet access for model downloads
- **Vector Databases**: Qdrant/ChromaDB running locally or accessible
- **Target Websites**: Crawling depends on website structure stability

## Tool Usage Patterns

### IDE Configuration
- **VS Code Extensions**: TypeScript, Python, ESLint, Tailwind CSS IntelliSense
- **Settings**: Format on save, type checking enabled
- **Debugging**: Chrome DevTools for frontend, Python debugger for backend

### Code Organization
- **Frontend**: Feature-based organization in `src/` directory
- **Backend**: Modular structure with clear separation of concerns
- **Shared**: Common utilities and configurations

### Testing Strategy
- **Frontend**: Component testing with React Testing Library (planned)
- **Backend**: API testing with pytest (planned)
- **Integration**: End-to-end testing with Playwright (planned)

### Deployment Strategy
- **Frontend**: Static export or server deployment
- **Backend**: Containerized with Docker
- **Database**: Persistent storage for vector databases
- **CI/CD**: GitHub Actions for automated testing and deployment

## Known Technical Debt

### Immediate Issues
- **Syntax Errors**: Multiple JSX syntax errors in `chat/page.tsx`
- **API Endpoints**: Some backend endpoints returning 404
- **CORS Issues**: Potential cross-origin request problems
- **Error Handling**: Incomplete error boundaries in frontend

### Architecture Improvements Needed
- **State Management**: More structured global state patterns
- **API Layer**: Consistent error handling and response formats
- **Component Architecture**: Better separation of concerns
- **Performance**: Virtual scrolling implementation incomplete

### Development Process Improvements
- **Testing**: Lack of automated test suite
- **Documentation**: API documentation incomplete
- **Type Safety**: Some TypeScript any types need proper typing
- **Code Quality**: ESLint rules need stricter enforcement
