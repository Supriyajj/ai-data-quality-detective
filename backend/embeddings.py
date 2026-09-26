"""
embeddings.py
Text -> vector. Uses a local sentence-transformers MiniLM model when it's
installed (real semantic embeddings). Falls back to a deterministic
bag-of-words hashing embedding so the RAG pipeline still runs end-to-end
without a ~90MB model download, e.g. in this project's own dev sandbox.
"""
from __future__ import annotations
import hashlib
import re
import numpy as np

_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
_FALLBACK_DIM = 256

try:
    from sentence_transformers import SentenceTransformer
    _model = SentenceTransformer(_MODEL_NAME)
    _HAS_ST = True
except Exception:
    _model = None
    _HAS_ST = False

_WORD_RE = re.compile(r"[a-zA-Z']+")


def _hash_embed(text: str, dim: int = _FALLBACK_DIM) -> np.ndarray:
    """Deterministic hashing-trick embedding: good enough to demonstrate the
    RAG mechanics (same text -> same vector, similar text -> nearby vector)
    without needing model weights."""
    vec = np.zeros(dim, dtype=np.float32)
    for word in _WORD_RE.findall(text.lower()):
        h = int(hashlib.md5(word.encode()).hexdigest(), 16)
        vec[h % dim] += 1.0
    norm = np.linalg.norm(vec)
    return vec / norm if norm > 0 else vec


def embed(texts: list[str]) -> np.ndarray:
    if _HAS_ST:
        return np.asarray(_model.encode(texts, normalize_embeddings=True), dtype=np.float32)
    return np.stack([_hash_embed(t) for t in texts])


def embedding_dim() -> int:
    return 384 if _HAS_ST else _FALLBACK_DIM


def backend_name() -> str:
    return _MODEL_NAME if _HAS_ST else "fallback-hashing-embedding"
