"""
main.py
FastAPI application tying together analyzer -> quality_score -> tokenizer ->
embeddings/RAG -> agent -> llm -> report, and serving the React/R3F frontend
over a REST + WebSocket API.

Run with:
    uvicorn backend.main:app --reload --port 8000
(run from the project root, one level above this file)
"""
from __future__ import annotations
import asyncio
import io
import os
import uuid
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

from . import analyzer
from . import quality_score as qs_module
from . import tokenizer as tokenizer_module
from . import rag as rag_module
from . import agent as agent_module
from . import llm as llm_module
from . import report as report_module

load_dotenv()

app = FastAPI(title="AI Data Quality Detective API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- In-memory session store -------------------------------------------------
# Fine for a single-user portfolio demo. Swap for Redis/DB for multi-user.
_DATASETS: dict[str, dict[str, Any]] = {}

PIPELINE_STAGES = [
    "upload", "missing_values", "duplicates", "data_types",
    "invalid_values", "outliers", "quality_score",
    "tokenization", "embeddings", "vector_search", "llm_explanation", "done",
]


def _get_dataset(dataset_id: str) -> dict[str, Any]:
    ds = _DATASETS.get(dataset_id)
    if ds is None:
        raise HTTPException(404, f"Unknown dataset_id '{dataset_id}'. Upload a CSV first.")
    return ds


# --- Upload -------------------------------------------------------------------
@app.post("/api/upload")
async def upload_csv(file: UploadFile = File(...)):
    content = await file.read()
    try:
        df = analyzer.load_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(400, f"Could not parse CSV: {e}")

    dataset_id = str(uuid.uuid4())
    _DATASETS[dataset_id] = {"df": df, "filename": file.filename}
    return {
        "dataset_id": dataset_id,
        "filename": file.filename,
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "column_names": list(df.columns),
        "size_bytes": len(content),
    }


# --- Core analysis --------------------------------------------------------
@app.post("/api/analyze/{dataset_id}")
async def analyze(dataset_id: str):
    ds = _get_dataset(dataset_id)
    df = ds["df"]

    report = analyzer.full_report(df)
    score_info = qs_module.compute_quality_score(report)

    ds["report"] = report
    ds["score"] = score_info
    return {"report": report, "score": score_info}


@app.get("/api/columns/{dataset_id}/{column}")
async def column_detail(dataset_id: str, column: str):
    ds = _get_dataset(dataset_id)
    return analyzer.analyze_column(ds["df"], column)


# --- AI explanation for a specific issue -----------------------------------
class ExplainRequest(BaseModel):
    issue_type: str    # "missing" | "duplicates" | "invalid" | "outliers"
    column: str | None = None


@app.post("/api/explain/{dataset_id}")
async def explain_issue(dataset_id: str, req: ExplainRequest):
    ds = _get_dataset(dataset_id)
    report = ds.get("report")
    if report is None:
        raise HTTPException(400, "Run /api/analyze first.")

    if req.issue_type == "duplicates":
        detail = report["duplicates"]
        description = f"The dataset has {detail['count']} duplicate rows."
        query = "duplicate rows"
    else:
        section = report.get(req.issue_type, {})
        if not req.column or req.column not in section:
            raise HTTPException(400, f"No '{req.issue_type}' issue found for column '{req.column}'.")
        detail = section[req.column]
        description = f"Column '{req.column}' has a {req.issue_type} issue: {detail}"
        query = f"{req.issue_type} in column {req.column}"

    retrieved = rag_module.knowledge_base.retrieve(query, k=2)
    explanation = llm_module.generate_explanation(description, retrieved)

    ds.setdefault("explanations", {})[req.column or "duplicates"] = explanation
    return {"explanation": explanation, "evidence": retrieved, "detail": detail}


# --- Tokenization / embedding-space demo pages -----------------------------
class TokenizeRequest(BaseModel):
    text: str


@app.post("/api/tokenize")
async def tokenize(req: TokenizeRequest):
    return tokenizer_module.tokenize(req.text)


@app.get("/api/embedding-space")
async def embedding_space(query: str | None = None):
    extra = [query] if query else None
    return rag_module.knowledge_base.embedding_space_3d(extra_queries=extra)


# --- Chat (agent) -----------------------------------------------------------
class ChatRequest(BaseModel):
    message: str


@app.post("/api/chat/{dataset_id}")
async def chat(dataset_id: str, req: ChatRequest):
    ds = _get_dataset(dataset_id)
    report = ds.get("report") or analyzer.full_report(ds["df"])
    result = agent_module.run_agent(req.message, ds["df"], report)
    return result


# --- Report download ---------------------------------------------------------
@app.get("/api/report/{dataset_id}", response_class=HTMLResponse)
async def get_report(dataset_id: str):
    ds = _get_dataset(dataset_id)
    report = ds.get("report")
    score_info = ds.get("score")
    if report is None or score_info is None:
        raise HTTPException(400, "Run /api/analyze first.")
    html = report_module.build_html_report(
        ds["filename"], report, score_info, ds.get("explanations", {})
    )
    return HTMLResponse(content=html)


# --- WebSocket: drives the 3D pipeline visualizer in real time -------------
@app.websocket("/ws/pipeline/{dataset_id}")
async def pipeline_ws(websocket: WebSocket, dataset_id: str):
    await websocket.accept()
    try:
        ds = _get_dataset(dataset_id)
        df = ds["df"]

        for stage in PIPELINE_STAGES:
            await asyncio.sleep(0.35)  # paced so the animation is visible; tune freely
            payload = {"stage": stage, "status": "done"}

            if stage == "missing_values":
                payload["detail"] = analyzer.missing_values(df)
            elif stage == "duplicates":
                payload["detail"] = analyzer.duplicate_rows(df)
            elif stage == "invalid_values":
                payload["detail"] = analyzer.invalid_values(df)
            elif stage == "outliers":
                payload["detail"] = analyzer.outliers_iqr(df)
            elif stage == "quality_score":
                report = analyzer.full_report(df)
                score_info = qs_module.compute_quality_score(report)
                ds["report"], ds["score"] = report, score_info
                payload["detail"] = score_info

            await websocket.send_json(payload)

    except WebSocketDisconnect:
        pass
    except HTTPException as e:
        await websocket.send_json({"stage": "error", "detail": e.detail})
    finally:
        try:
            await websocket.close()
        except Exception:
            pass


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "embedding_backend": rag_module.knowledge_base.store.backend_name(),
        "llm_provider": llm_module.PROVIDER,
    }
