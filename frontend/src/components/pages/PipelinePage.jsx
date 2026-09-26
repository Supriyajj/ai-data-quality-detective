import React from "react";
import PipelineViz3D from "../PipelineViz3D";

export default function PipelinePage({ stageStatus }) {
  return (
    <div className="space-y-4">
      <div className="card p-6">
        <p className="case-tag text-ink-500 mb-1">HOW THE DETECTIVE THINKS</p>
        <p className="text-ink-700 text-sm mb-4">
          Each node is a real backend stage; the glowing packet advances as your dataset actually
          completes each step over a live WebSocket connection - not a timed animation.
        </p>
        <PipelineViz3D stageStatus={stageStatus} />
        <div className="flex flex-wrap gap-4 mt-4 text-xs">
          <Legend color="#34D399" label="Data" />
          <Legend color="#3B82F6" label="Processing" />
          <Legend color="#22D3EE" label="RAG / Retrieval" />
          <Legend color="#8B5CF6" label="LLM" />
          <Legend color="#D946EF" label="Insight" />
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span className="flex items-center gap-1.5 text-ink-500">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} /> {label}
    </span>
  );
}
