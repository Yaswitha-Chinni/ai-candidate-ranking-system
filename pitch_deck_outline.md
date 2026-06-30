# Redrob.AI Candidate Ranking System - Pitch Deck Outline

## Slide 1: Title Slide
- **Title**: Intelligent Candidate Discovery & Ranking
- **Subtitle**: AI-powered recruitment pipeline for unbiased, highly accurate talent sourcing.
- **Visual**: Redrob.AI Logo & sleek dashboard screenshot.

## Slide 2: The Problem
- Manual screening is slow and biased.
- Keyword matching misses context and semantic relationships.
- Recruiters waste hours matching JD requirements to unstructured candidate data.

## Slide 3: The Solution
- **Semantic Understanding**: Uses state-of-the-art embeddings (`BAAI/bge-large-en-v1.5`) to understand the *meaning* behind resumes, not just keywords.
- **Generative AI Analysis**: Leverages Google Gemini 1.5 Pro to read JDs and explain candidate fit in plain English.
- **Hybrid Scoring Engine**: Balances AI semantics with hard constraints (Skills, Experience, Education, Behavioral Signals).

## Slide 4: System Architecture
- **Frontend**: React, Recharts, Vite (Glassmorphism UI).
- **Backend**: FastAPI, PyMuPDF, ReportLab.
- **AI/ML Layer**:
  - LLM: Google Gemini
  - Vector DB: ChromaDB
  - Embeddings: SentenceTransformers

## Slide 5: The Hybrid Scoring Engine
- Semantic Similarity (40%) - Contextual match
- Skill Match (20%) - Hard requirements
- Experience (15%) - Longevity and relevance
- Education & Projects (20%) - Academic/practical validation
- Behavioral Signals (5%) - Platform engagement

## Slide 6: Key Features & Demo
- Upload JD (PDF/DOCX) -> Auto-extraction of requirements.
- Upload Dataset -> Auto-normalization & ChromaDB caching.
- Recruiter Dashboard -> Visual analytics, Expandable candidate cards.
- **Exporting** -> Competition-compliant CSV & Professional PDF Reports.

## Slide 7: Scalability & Performance
- **ChromaDB Caching**: Embeddings are never generated twice for the same candidate.
- **Batch Processing**: Heavy operations are batched.
- **Modular Design**: Swap embedding models or LLM providers with zero core code changes.

## Slide 8: Future Roadmap
- Integration with external ATS systems (Workday, Greenhouse).
- Conversational Chatbot to query the candidate pool ("Find me someone with 5 years of Python in Toronto").
- Automated Outreach drafting using Gemini.
