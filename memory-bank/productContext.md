# Product Context: Web Search RAG Platform

## Why This Product Exists

### The Problem

Users need to access and query information from Vietnamese financial newsletters (specifically Biwase) but face significant barriers:

- **Information Scatter**: Newsletters are published monthly as PDFs on websites, making them hard to search and reference
- **Manual Processing**: Users must manually download, read, and search through PDFs to find relevant information
- **Time-Intensive Research**: Finding specific data points or trends requires reading entire documents
- **Limited Accessibility**: No centralized, searchable database of historical newsletter content
- **Language Barriers**: Content is in Vietnamese, requiring specialized processing for non-native speakers

### The Solution

A comprehensive RAG platform that:

- **Automatically crawls** Biwase newsletter PDFs from their website
- **Processes and indexes** the content for semantic search
- **Provides intelligent querying** through both search and chat interfaces
- **Preserves context and sources** for accurate information retrieval
- **Offers analytics** on usage patterns and content insights

## How It Should Work

### User Journey

1. **Content Discovery**: System automatically crawls and downloads new Biwase newsletters
2. **Processing Pipeline**: PDFs are converted to searchable text with metadata preservation
3. **Knowledge Base Building**: Content is indexed in a vector database for semantic search
4. **Query Interface**: Users can ask questions in natural language or perform direct searches
5. **Intelligent Responses**: System provides relevant answers with source citations
6. **Analytics Dashboard**: Users can track system usage and content insights

### Core User Personas

#### Financial Analyst

- **Needs**: Quick access to economic data, market trends, and policy changes
- **Pain Points**: Time spent manually searching PDFs, missing important updates
- **Value Proposition**: Instant answers to complex queries about Vietnamese economy

#### Researcher/Student

- **Needs**: Historical data and trend analysis from newsletters
- **Pain Points**: Difficulty accessing and cross-referencing old content
- **Value Proposition**: Comprehensive searchable archive with semantic understanding

#### Business Professional

- **Needs**: Market intelligence and investment insights
- **Pain Points**: Language barriers and scattered information sources
- **Value Proposition**: AI-powered translation and summarization capabilities

## User Experience Goals

### Intuitive Interface

- Clean, modern web interface accessible at localhost:3000
- Responsive design that works on desktop and mobile
- Clear navigation between different functionalities

### Powerful Yet Simple

- Natural language queries ("What was GDP growth in Q3 2025?")
- Direct search capabilities for precise information needs
- Chat interface for conversational exploration

### Trust and Transparency

- Source citations for all answers
- Confidence scores for search results
- Clear indication of data freshness and coverage

### Performance Expectations

- Query responses within 2 seconds
- Support for concurrent users
- Reliable crawling and processing pipeline

## Success Metrics

### User Satisfaction

- Query accuracy rate > 90%
- User engagement (queries per session)
- Feature adoption rates

### Technical Performance

- System uptime > 99%
- Average response time < 2 seconds
- Crawling success rate > 95%

### Content Coverage

- Complete archive of Biwase newsletters
- Up-to-date content (monthly updates)
- Comprehensive metadata preservation

## Market Context

### Competitive Landscape

- General web crawlers (lack domain specificity)
- PDF search tools (no semantic understanding)
- Manual research processes (time-intensive)

### Differentiation

- **Domain Expertise**: Specialized for Vietnamese financial content
- **AI-Powered**: Semantic search and conversational interfaces
- **Automated Pipeline**: Continuous content updates
- **Source Integrity**: Maintains original context and citations

## Future Vision

### Short Term (3-6 months)

- Complete Biwase newsletter archive
- Enhanced chat capabilities
- Multi-language support

### Long Term (6-12 months)

- Expansion to other Vietnamese financial publications
- Advanced analytics and reporting
- API access for third-party integrations
- Mobile application development
