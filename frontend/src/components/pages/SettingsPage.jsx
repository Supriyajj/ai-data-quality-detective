import React from "react";

export default function SettingsPage({ dataset, onReset, health }) {
  return (
    <div className="space-y-6 max-w-xl">
      <div className="card p-6">
        <p className="case-tag text-ink-500 mb-3">CURRENT DATASET</p>
        {dataset ? (
          <dl className="space-y-2 text-sm">
            <Row label="Filename" value={dataset.filename} />
            <Row label="Rows" value={dataset.rows.toLocaleString()} />
            <Row label="Columns" value={dataset.columns} />
            <Row label="Dataset ID" value={<span className="font-mono text-xs">{dataset.dataset_id}</span>} />
          </dl>
        ) : (
          <p className="text-ink-500 text-sm">No dataset loaded yet.</p>
        )}
      </div>

      <div className="card p-6">
        <p className="case-tag text-ink-500 mb-3">AI BACKEND STATUS</p>
        {health ? (
          <dl className="space-y-2 text-sm">
            <Row label="API status" value={<span className="text-emerald-600">{health.status}</span>} />
            <Row label="LLM provider" value={health.llm_provider === "none" ? "offline mode" : health.llm_provider} />
            <Row label="Embedding backend" value={<span className="font-mono text-xs">{health.embedding_backend}</span>} />
          </dl>
        ) : (
          <p className="text-alert text-sm">Could not reach the backend at /api/health.</p>
        )}
      </div>

      {dataset && (
        <button
          onClick={onReset}
          className="px-5 py-2.5 rounded-lg border border-ink-900/10 bg-ink-900/[0.03] text-ink-700 text-sm font-medium hover:bg-ink-900/[0.06]"
        >
          Start over with a new dataset
        </button>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-border pb-2">
      <dt className="text-ink-500">{label}</dt>
      <dd className="text-ink-900 font-medium">{value}</dd>
    </div>
  );
}
