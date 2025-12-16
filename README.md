# Web Search RAG Project

A Retrieval-Augmented Generation (RAG) system that uses web-crawled content as knowledge base, starting with Biwase newsletter PDFs.

![alt text](/asset/image.png)

![alt text](/asset/page-chat-rag.png)

## Prerequisites

Before running the project, ensure you have the following installed:

- **Node.js** (version 18 or higher) - [Download](https://nodejs.org/)
- **Python** (version 3.8 or higher) - [Download](https://python.org/)
- **Git** - [Download](https://git-scm.com/)

## Project Structure

```
web-search-rag/
├── web/                          # Next.js Frontend
│   ├── src/
│   │   ├── app/                  # Next.js App Router pages
│   │   ├── components/           # React components
│   │   └── lib/                  # Utilities and configurations
│   ├── backend/                  # FastAPI Backend
│   │   ├── main.py              # Main API server
│   │   ├── bs4_gspread.py       # Crawling functionality
│   │   └── store_pdfs/          # PDF storage directory
│   └── package.json             # Frontend dependencies
├── asset/                        # Project assets
├── requirements.txt              # Root Python requirements (if any)
└── README.md
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Vinh-Gogo/web-search-rag.git
cd web-search-rag
```

### 2. Backend Setup (Python/FastAPI)

The backend handles data processing, web crawling, and AI operations.

1. **Navigate to backend directory:**

   ```bash
   cd web/backend
   ```

2. **Create and activate virtual environment:**

   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python -m venv venv
   source venv/bin/activate
   ```

3. **Install Python dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Install Playwright browsers (for web crawling):**

   ```bash
   playwright install
   ```

5. **Start the backend server:**

   ```bash
   python -m uvicorn main:app --reload --host 127.0.0.1 --port 8080
   ```

   The backend API will be available at: `http://localhost:8080`
   - API documentation: `http://localhost:8080/docs` (Swagger UI)
   - Health check: `http://localhost:8080/api/health`

### 3. Frontend Setup (Next.js)

The frontend provides the web interface for interacting with the RAG system.

1. **Open a new terminal and navigate to web directory:**

   ```bash
   cd web
   ```

2. **Install Node.js dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

   The frontend will be available at: `http://localhost:3000` (or `http://localhost:3001` if 3000 is busy)

### 4. Access the Application

Once both servers are running:

- **Frontend**: Open `http://localhost:3000` in your browser
- **Backend API**: Available at `http://localhost:8080`

## Development Workflow

### Running Both Services

For development, you need both frontend and backend running simultaneously:

1. **Terminal 1 - Backend:**

   ```bash
   cd web/backend
   # Activate venv (venv\Scripts\activate on Windows)
   python -m uvicorn main:app --reload --host 127.0.0.1 --port 8080
   ```

2. **Terminal 2 - Frontend:**

   ```bash
   cd web
   npm run dev
   ```

### Available Scripts

**Frontend scripts** (in `web/` directory):

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

**Backend scripts** (in `web/backend/` directory):

- `python -m uvicorn main:app --reload` - Start development server
- No build step required (Python interpreted)

## Key Features

### 🕷️ Web Crawling

- Multi-stage crawling system for Biwase newsletters
- Automatic PDF discovery and download
- Progress tracking and error handling

### 📄 PDF Processing

- Text extraction from PDF documents
- Chunking for optimal retrieval
- Vietnamese language support

### 🧠 RAG System

- Vector embeddings using Sentence Transformers
- Similarity search with Qdrant/ChromaDB
- Conversational AI with context awareness

### 💬 Chat Interface

- Real-time conversation with knowledge base
- Source attribution for answers
- Conversation history

### 📊 Activity Dashboard

- Usage analytics and logging
- Performance metrics
- User activity tracking

## Troubleshooting

### Common Issues

**Backend server won't start:**

- Ensure Python virtual environment is activated
- Check if port 8080 is available
- Verify all dependencies are installed: `pip install -r requirements.txt`

**Frontend compilation errors:**

- Run `npm install` to ensure all dependencies are installed
- Check Node.js version: `node --version` (should be 18+)
- Clear Next.js cache: `rm -rf .next` (Unix) or `rmdir /s .next` (Windows)

**API connection errors (404/500):**

- Ensure backend server is running on port 8080
- Check CORS configuration if accessing from different ports
- Verify API endpoints in browser: `http://localhost:8080/api/health`

**Crawling failures:**

- Install Playwright browsers: `playwright install`
- Check internet connection for web scraping
- Verify target website structure hasn't changed

### Performance Notes

- **Memory**: Backend requires 4GB+ RAM for embedding generation
- **Storage**: PDFs are stored locally in `web/backend/store_pdfs/`
- **Network**: Crawling operations require internet access
- **GPU**: Optional - CUDA support for faster AI processing

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and test thoroughly
4. Commit with descriptive messages
5. Push to your fork and create a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
