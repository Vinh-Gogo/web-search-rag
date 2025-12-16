# Product Context

## Why This Project Exists
The Web Search RAG platform solves the problem of information retrieval and synthesis from multiple sources. Traditional search returns links; this system understands content and provides direct answers.

## Problems Solved

1. **Information Overload**: Users struggle to find relevant information across PDFs and web content
2. **Manual Synthesis**: Require manual effort to combine information from multiple sources
3. **Context Loss**: Search results lack contextual understanding of relationships between documents
4. **Knowledge Management**: Organizations need scalable ways to query accumulated knowledge

## How It Should Work

### User Journey

1. **Upload/Index Phase**: System crawls websites or accepts PDF uploads
2. **Processing Phase**: Backend processes documents, creates embeddings, stores in vector database
3. **Query Phase**: User asks a question in chat interface
4. **Retrieval Phase**: System retrieves semantically similar documents
5. **Generation Phase**: AI generates answer based on retrieved context
6. **Response Phase**: User sees answer with source citations

### Core User Interactions

- **Chat Mode**: Ask questions, receive AI-generated answers with sources
- **Debug Mode**: View internal processing, embeddings, retrieved documents
- **Tools Mode**: Manual operations like crawling, PDF processing
- **PDF Management**: Upload, browse, delete documents
- **Search**: Quick search across knowledge base

## User Experience Goals

1. **Intuitive Chat Interface**: Natural conversation with AI assistant
2. **Transparency**: Visible sources and retrieval process
3. **Control**: Users can manage knowledge base and see processing details
4. **Responsiveness**: Fast responses even with large knowledge base
5. **Accessibility**: Works on desktop and mobile with responsive design
6. **Feedback**: Clear indication of processing state and errors

## Value Proposition

- **Accuracy**: Answers grounded in actual documents (no hallucinations)
- **Speed**: Fast semantic search across large document collections
- **Transparency**: Source citations for verification
- **Flexibility**: Works with any domain-specific documents
- **Scalability**: Can grow with organization's knowledge base
