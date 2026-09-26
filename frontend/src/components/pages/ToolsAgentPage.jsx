import React from "react";
import EmbeddingSpace3D from "../EmbeddingSpace3D";
import AgentActivity from "../AgentActivity";

const TOOLS = [
  {
    name: "analyze_column",
    subtitle: "Pandas",
    description: "Calculates exact statistics - mean, median, min, max, missing count, outlier count - directly from the uploaded dataset.",
  },
  {
    name: "search_quality_knowledge",
    subtitle: "FAISS + Embeddings",
    description: "Semantic search over the RAG knowledge base to find the passage most relevant to the question or detected issue.",
  },
];

export default function ToolsAgentPage({ embeddingData, highlightedSources, lastAgentRun }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="status-dot bg-emerald-500 pulse" />
        <span className="case-tag text-ink-500">AI INVESTIGATION AGENT · ONLINE</span>
      </div>
      <p className="text-ink-500 text-sm max-w-2xl">
        The agent can use tools to investigate the dataset before generating an answer.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TOOLS.map((t) => (
          <div key={t.name} className="card card-hover p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm font-semibold text-ink-900">{t.name}()</span>
              <span className="case-tag text-emerald-600 flex items-center gap-1">
                <span className="status-dot bg-emerald-500" /> READY
              </span>
            </div>
            <p className="case-tag text-ink-500 mb-2">{t.subtitle}</p>
            <p className="text-ink-500 text-sm">{t.description}</p>
          </div>
        ))}
      </div>

      <AgentActivity run={lastAgentRun} />

      <div className="card p-6">
        <p className="case-tag text-ink-500 mb-1">RAG KNOWLEDGE SPACE</p>
        <p className="text-ink-700 text-sm mb-4">
          Each point is a chunk of the knowledge base, embedded and projected to 3D. Running an
          investigation on the AI Analysis page highlights the source it retrieved from.
        </p>
        <EmbeddingSpace3D data={embeddingData} highlightedSources={highlightedSources} />
      </div>
    </div>
  );
}
