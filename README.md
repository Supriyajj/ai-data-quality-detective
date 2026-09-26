# AI Data Quality Detective

Upload a CSV. Pandas runs five ground-truth data-quality checks. A small
RAG pipeline (local embeddings + FAISS + a knowledge base) and a two-tool
agent explain what was found, grounded in real statistics and retrieved
knowledge - not LLM guesswork. A React + React Three Fiber frontend renders
the pipeline itself as a live 3D animation, and the RAG retrieval as a
navigable 3D embedding space.

## Architecture

```
React + R3F  <--REST + WebSocket-->  FastAPI  -->  pandas analyzer
   (frontend)                        (backend)      tokenizer
                                                      embeddings -> FAISS
                                                      RAG retrieval
                                                      2-tool agent -> LLM
```

## Project layout

```
ai-data-quality-detective/
├── backend/
│   ├── main.py            FastAPI app: upload / analyze / explain / chat / report / ws
│   ├── analyzer.py        pandas checks: missing, duplicates, dtypes, invalid, outliers
│   ├── quality_score.py   heuristic 0-100 score from the checks above
│   ├── tokenizer.py       tiktoken (falls back to regex split offline)
│   ├── embeddings.py      sentence-transformers MiniLM (falls back to hashing embedding)
│   ├── vector_store.py    FAISS (falls back to numpy cosine search)
│   ├── rag.py             loads knowledge/*.txt, chunks, retrieves, 3D-projects
│   ├── agent.py           2-tool agent: analyze_column + search_quality_knowledge
│   ├── llm.py             Anthropic/OpenAI dispatch (falls back to a template if no key)
│   └── report.py          builds the downloadable HTML report
├── knowledge/              knowledge base the RAG layer retrieves from
├── data/sample.csv         a small CSV with deliberate issues, for a quick test
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Hero3D.jsx            landing-page particle field (R3F)
│       │   ├── PipelineViz3D.jsx     live 3D pipeline graph, driven by the WebSocket
│       │   ├── EmbeddingSpace3D.jsx  3D scatter of the RAG knowledge base
│       │   ├── QualityOrb3D.jsx      3D quality-score gauge
│       │   ├── Dashboard.jsx / IssuesTable.jsx / ExplanationPanel.jsx
│       │   ├── ChatPanel.jsx         chat with the dataset (agent-backed)
│       │   └── UploadPanel.jsx / ReportDownload.jsx
│       └── api/client.js  fetch + WebSocket wrappers for the FastAPI routes
└── requirements.txt
```

Every backend AI component (embeddings, vector search, tokenizer) has a
graceful offline fallback, so the whole pipeline runs end-to-end even
without downloading model weights or an LLM API key - useful the first time
you run it, before you've decided which real models to wire in.

## Running it

### 1. Backend

```bash
cd ai-data-quality-detective
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # fill in ANTHROPIC_API_KEY or OPENAI_API_KEY (optional)
uvicorn backend.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173, drop in `data/sample.csv`, and watch the
pipeline run.

### Without an LLM key

The app still works end to end: `llm.py` returns a clearly labeled
"[Offline mode]" template explanation built from the same retrieved
knowledge, so the RAG mechanics are still visible. Add a key to
`ANTHROPIC_API_KEY` or `OPENAI_API_KEY` (and set `LLM_PROVIDER` to match)
for real generated explanations.

## Development phases (suggested order if extending)

1. Backend checks + REST API (`analyzer.py`, `main.py` upload/analyze routes)
2. Frontend dashboard consuming that API, no 3D yet
3. Tokenization + embeddings + FAISS (`tokenizer.py`, `embeddings.py`, `vector_store.py`)
4. RAG explanations (`rag.py`, `/api/explain`)
5. Agent + chat (`agent.py`, `/api/chat`)
6. 3D layer: `Hero3D`, `QualityOrb3D`, `PipelineViz3D`, `EmbeddingSpace3D`
7. Report download, polish, deploy

## Deployment

- **Frontend**: static build (`npm run build`) to Vercel or Netlify.
- **Backend**: FastAPI needs a real server process (not static hosting) -
  Render, Railway, or Fly.io all work. Set `FRONTEND_ORIGIN` to your deployed
  frontend URL for CORS, and set your LLM API key as a platform secret, never
  committed to the repo.
- FAISS here is in-memory and rebuilt from `knowledge/*.txt` on startup - no
  persistent vector DB needed unless you outgrow a single knowledge base.

## What was deliberately left out (v1)

Fine-tuning, training a custom model, a multi-agent architecture, multiple
vector databases, real-time data streaming, and complex auth - all listed as
explicit non-goals to keep this a finishable, demoable portfolio project.
Add them later if the project needs to grow.
