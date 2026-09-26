"""
rag.py
Loads the knowledge/ text files, chunks them, embeds them into a
VectorStore, and retrieves the most relevant chunk(s) for a detected issue
or a user question. Also exposes a 3D-projected view of the embedding space
for the frontend's EmbeddingSpace3D visualizer.
"""
from __future__ import annotations
import os
import numpy as np
from . import embeddings as emb_module
from .vector_store import VectorStore

_KNOWLEDGE_DIR = os.path.join(os.path.dirname(__file__), "..", "knowledge")


def _chunk(text: str, max_chars: int = 400) -> list[str]:
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks: list[str] = []
    for p in paragraphs:
        if len(p) <= max_chars:
            chunks.append(p)
        else:
            for i in range(0, len(p), max_chars):
                chunks.append(p[i:i + max_chars])
    return chunks


class KnowledgeBase:
    """Loaded once at process start; cheap enough to rebuild per-user-session
    if you later need multi-tenant isolation."""

    def __init__(self, knowledge_dir: str = _KNOWLEDGE_DIR):
        self.store = VectorStore(dim=emb_module.embedding_dim())
        chunks: list[str] = []
        sources: list[str] = []
        for fname in sorted(os.listdir(knowledge_dir)):
            if not fname.endswith(".txt"):
                continue
            with open(os.path.join(knowledge_dir, fname), encoding="utf-8") as f:
                text = f.read()
            for c in _chunk(text):
                chunks.append(c)
                sources.append(fname)
        if chunks:
            vectors = emb_module.embed(chunks)
            self.store.add(vectors, chunks, sources)

    def retrieve(self, query: str, k: int = 2) -> list[dict]:
        query_vec = emb_module.embed([query])[0]
        return self.store.search(query_vec, k=k)

    def embedding_space_3d(self, extra_queries: list[str] | None = None) -> dict:
        """Projects every stored chunk (+ optional live queries) down to 3D
        with PCA, for the EmbeddingSpace3D component. Pure numpy - no sklearn
        dependency needed for a 3-component PCA."""
        vectors = self.store._vectors
        if vectors is None:
            # rebuild from documents if faiss backend doesn't expose raw vectors
            vectors = emb_module.embed(self.store.documents)

        extra_vecs = emb_module.embed(extra_queries) if extra_queries else np.empty((0, vectors.shape[1]))
        all_vecs = np.vstack([vectors, extra_vecs]) if len(extra_vecs) else vectors

        centered = all_vecs - all_vecs.mean(axis=0, keepdims=True)
        # SVD-based PCA, 3 components
        _, _, vt = np.linalg.svd(centered, full_matrices=False)
        coords = centered @ vt[:3].T

        n_docs = len(self.store.documents)
        points = [
            {"x": float(coords[i][0]), "y": float(coords[i][1]), "z": float(coords[i][2]),
             "label": self.store.documents[i][:80], "source": self.store.sources[i], "type": "knowledge"}
            for i in range(n_docs)
        ]
        for j, q in enumerate(extra_queries or []):
            i = n_docs + j
            points.append({"x": float(coords[i][0]), "y": float(coords[i][1]), "z": float(coords[i][2]),
                            "label": q[:80], "source": "query", "type": "query"})
        return {"points": points, "embedding_backend": emb_module.backend_name()}


# module-level singleton, built once when the FastAPI app starts
knowledge_base = KnowledgeBase()
