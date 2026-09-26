import React from "react";

// evidence items come straight from the backend's vector_store.search() -
// `score` is a real cosine-similarity value (FAISS IndexFlatIP, or the
// numpy fallback), not a mocked number.
export default function RAGEvidence({ query, evidence }) {
  if (!evidence || evidence.length === 0) return null;

  return (
    <div className="mt-5 pt-4 border-t border-border">
      <p className="case-tag text-teal-600 mb-2">RAG EVIDENCE</p>
      <p className="case-tag text-ink-500 mb-3">QUERY: "{query}"</p>
      <div className="space-y-2">
        {evidence.map((e, i) => {
          const pct = Math.max(0, Math.min(100, Math.round(e.score * 100)));
          return (
            <div key={i} className="bg-canvas/40 rounded-lg p-3 border border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-ink-900 font-medium">{String(i + 1).padStart(2, "0")}  {e.source}</span>
                <span className="case-tag text-teal-600">{pct}% match</span>
              </div>
              <div className="h-1 bg-slate-200 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-teal-500" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-ink-500 text-xs line-clamp-2">{e.text.slice(0, 140)}...</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
