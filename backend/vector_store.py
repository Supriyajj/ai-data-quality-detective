"""
vector_store.py
Thin wrapper around FAISS for the knowledge-base index. Falls back to a
plain numpy cosine-similarity search if faiss isn't installed - same
interface either way, so rag.py never needs to know which backend is live.
"""
from __future__ import annotations
import numpy as np

try:
    import faiss
    _HAS_FAISS = True
except Exception:
    _HAS_FAISS = False


class VectorStore:
    def __init__(self, dim: int):
        self.dim = dim
        self.documents: list[str] = []
        self.sources: list[str] = []
        self._vectors: np.ndarray | None = None
        if _HAS_FAISS:
            self._index = faiss.IndexFlatIP(dim)  # inner product == cosine, since vectors are normalized
        else:
            self._index = None

    def add(self, vectors: np.ndarray, documents: list[str], sources: list[str]) -> None:
        vectors = vectors.astype(np.float32)
        if _HAS_FAISS:
            self._index.add(vectors)
        else:
            self._vectors = vectors if self._vectors is None else np.vstack([self._vectors, vectors])
        self.documents.extend(documents)
        self.sources.extend(sources)

    def search(self, query_vector: np.ndarray, k: int = 2) -> list[dict]:
        query_vector = query_vector.astype(np.float32).reshape(1, -1)
        k = min(k, len(self.documents))
        if k == 0:
            return []

        if _HAS_FAISS:
            scores, idxs = self._index.search(query_vector, k)
            scores, idxs = scores[0], idxs[0]
        else:
            sims = (self._vectors @ query_vector.T).flatten()
            idxs = np.argsort(-sims)[:k]
            scores = sims[idxs]

        return [
            {"text": self.documents[i], "source": self.sources[i], "score": float(scores[j])}
            for j, i in enumerate(idxs) if i != -1
        ]

    def backend_name(self) -> str:
        return "faiss.IndexFlatIP" if _HAS_FAISS else "fallback-numpy-cosine"
