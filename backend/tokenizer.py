"""
tokenizer.py
Exposes tokenization for the "AI Pipeline" explainer page in the frontend.
Uses tiktoken when available (matches what real LLM APIs use); falls back
to a simple whitespace/punctuation split so the demo still works offline.
"""
from __future__ import annotations
import re

try:
    import tiktoken
    _ENC = tiktoken.get_encoding("cl100k_base")
    _HAS_TIKTOKEN = True
except Exception:
    _ENC = None
    _HAS_TIKTOKEN = False

_WORD_RE = re.compile(r"\w+|[^\w\s]")


def tokenize(text: str) -> dict:
    if _HAS_TIKTOKEN:
        ids = _ENC.encode(text)
        tokens = [_ENC.decode([i]) for i in ids]
        return {"tokens": tokens, "token_ids": ids, "count": len(ids), "method": "tiktoken/cl100k_base"}

    tokens = _WORD_RE.findall(text)
    # fake but stable "ids" so the frontend viz has something to show
    ids = [abs(hash(t)) % 50000 for t in tokens]
    return {"tokens": tokens, "token_ids": ids, "count": len(tokens), "method": "fallback-regex"}
