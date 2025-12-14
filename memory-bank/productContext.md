# Product Context: Web Search RAG

## Why This Project Exists
Traditional web search often returns outdated or irrelevant results. Large language models have knowledge cutoffs and hallucinate information. This project addresses these limitations by creating a RAG system that:

- Maintains fresh, up-to-date knowledge through continuous web crawling
- Provides factual, source-verifiable answers
- Enables domain-specific expertise (starting with financial newsletters)
- Reduces LLM hallucinations by grounding responses in retrieved content

## Problems Solved
1. **Stale Information**: Search engines and LLMs have knowledge gaps or outdated data
2. **Lack of Source Verification**: Users can't easily verify information sources
3. **Domain-Specific Knowledge**: General models lack deep expertise in specific areas
4. **Scalability Issues**: Manual research is time-consuming and not scalable

## How It Should Work
1. **Data Collection**: Automated web crawling collects relevant content (starting with Biwase newsletters)
2. **Content Processing**: Extract and chunk text from various formats (PDFs, web pages)
3. **Knowledge Storage**: Store processed content in a vector database for semantic search
4. **Query Processing**: Accept natural language questions and retrieve relevant context
5. **Response Generation**: Use retrieved context to generate accurate, cited answers

## User Experience Goals
- **Intuitive Interface**: Simple question-input system with clear, sourced answers
- **High Accuracy**: Responses based on verifiable web content, not model hallucinations
- **Fast Responses**: Efficient retrieval and generation pipeline
- **Source Transparency**: Clear citations, "Documents Found" badges, and interactive content previews
- **Extensibility**: Easy addition of new data sources and domains

## Target Users
- Researchers needing current, factual information
- Professionals in finance/investment (initial focus on Biwase newsletters)
- Knowledge workers requiring up-to-date industry insights
- Developers building similar RAG applications

## Value Proposition
A reliable, automated system for maintaining and querying fresh web knowledge, starting with financial newsletter expertise, with clear expansion paths to other domains.
