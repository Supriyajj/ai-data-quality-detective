import React from "react";
import IssuesTable from "../IssuesTable";

export default function ColumnsPage({ report, onInspect }) {
  if (!report) {
    return <div className="card p-8 text-center text-ink-500 text-sm">Running checks...</div>;
  }
  return (
    <div className="space-y-4">
      <p className="text-ink-500 text-sm">
        Every column checked against five ground-truth pandas rules. Click "Investigate" on any flagged
        row to open an AI-generated, RAG-backed explanation on the AI Analysis page.
      </p>
      <IssuesTable report={report} onInspect={onInspect} />
    </div>
  );
}
