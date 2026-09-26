import React from "react";
import ExplanationPanel from "../ExplanationPanel";

export default function AnalysisPage({ datasetId, target, onEvidence }) {
  return (
    <div className="space-y-4">
      <p className="text-ink-500 text-sm">
        Explanations here are grounded in the exact statistics detected plus knowledge retrieved via
        RAG - never invented. Retrieval scores are real cosine-similarity values, shown below each answer.
      </p>
      <ExplanationPanel datasetId={datasetId} target={target} onEvidence={onEvidence} />
    </div>
  );
}
