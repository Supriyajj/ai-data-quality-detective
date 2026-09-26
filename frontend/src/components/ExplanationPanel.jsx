import React, { useState } from "react";
import { explainIssue } from "../api/client";
import RAGEvidence from "./RAGEvidence";

const SEVERITY_BY_TYPE = { invalid: "CRITICAL", duplicates: "CRITICAL", missing: "HIGH", outliers: "MEDIUM" };
const SEVERITY_COLOR = { CRITICAL: "text-alert border-l-alert", HIGH: "text-amber-600 border-l-amber-400", MEDIUM: "text-blue-600 border-l-blue-400" };

export default function ExplanationPanel({ datasetId, target, onEvidence }) {
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  if (!target) {
    return (
      <div className="card p-8 text-center">
        <p className="text-ink-500 text-sm">
          Select a flagged row from <span className="text-ink-700 font-medium">Investigation</span> and
          click "Investigate" to open an AI analysis here.
        </p>
      </div>
    );
  }

  const { column, issueType } = target;
  const severity = SEVERITY_BY_TYPE[issueType] || "MEDIUM";
  const query = issueType === "duplicates" ? "duplicate rows" : `${issueType} in column ${column}`;

  async function investigate() {
    setBusy(true);
    try {
      const r = await explainIssue(datasetId, issueType, column);
      setResult(r);
      onEvidence?.(r.evidence?.map((e) => e.source) || []);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`card p-6 border-l-4 ${SEVERITY_COLOR[severity]}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">✦</span>
        <span className="case-tag text-ink-500">AI INVESTIGATION</span>
      </div>
      <h3 className="text-ink-900 font-medium mb-1">
        {issueType === "duplicates" ? "Duplicate rows" : `${issueType} values — ${column}`}
      </h3>
      <span className={`case-tag ${SEVERITY_COLOR[severity].split(" ")[0]}`}>{severity}</span>

      {!result ? (
        <button
          onClick={investigate}
          disabled={busy}
          className="mt-4 px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 disabled:opacity-50"
        >
          {busy ? "Investigating..." : "Run AI Investigation"}
        </button>
      ) : (
        <>
          <div className="mt-4">
            <p className="case-tag text-ink-500 mb-1">AI EXPLANATION</p>
            <p className="text-sm text-ink-700 whitespace-pre-line leading-relaxed">{result.explanation}</p>
          </div>
          <RAGEvidence query={query} evidence={result.evidence} />
        </>
      )}
    </div>
  );
}
