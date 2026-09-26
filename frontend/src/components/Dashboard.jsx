import React, { useEffect, useState } from "react";
import { analyzeDataset, getEmbeddingSpace, openPipelineSocket } from "../api/client";
import QualityOrb3D from "./QualityOrb3D";
import PipelineViz3D from "./PipelineViz3D";
import EmbeddingSpace3D from "./EmbeddingSpace3D";
import IssuesTable from "./IssuesTable";
import ExplanationPanel from "./ExplanationPanel";
import ChatPanel from "./ChatPanel";
import ReportDownload from "./ReportDownload";

export default function Dashboard({ dataset }) {
  const [report, setReport] = useState(null);
  const [score, setScore] = useState(null);
  const [stageStatus, setStageStatus] = useState({});
  const [embeddingData, setEmbeddingData] = useState(null);
  const [highlightedSources, setHighlightedSources] = useState([]);
  const [inspectTarget, setInspectTarget] = useState(null);

  // Kick off analysis + the live pipeline animation together.
  useEffect(() => {
    let cancelled = false;

    analyzeDataset(dataset.dataset_id).then((result) => {
      if (cancelled) return;
      setReport(result.report);
      setScore(result.score);
    });

    const ws = openPipelineSocket(dataset.dataset_id, (msg) => {
      setStageStatus((prev) => ({ ...prev, [msg.stage]: true }));
    });

    getEmbeddingSpace().then(setEmbeddingData).catch(() => {});

    return () => { cancelled = true; ws.close(); };
  }, [dataset.dataset_id]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="case-tag text-teal-400">CASE FILE</p>
          <h1 className="font-display text-2xl">{dataset.filename}</h1>
          <p className="text-paper/60 text-sm">
            {dataset.rows.toLocaleString()} rows &middot; {dataset.columns} columns
          </p>
        </div>
        {score && <ReportDownload datasetId={dataset.dataset_id} />}
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-1 flex flex-col items-center">
          {score ? <QualityOrb3D score={score.score} /> : <p className="text-paper/50 text-sm">Scoring...</p>}
          {score && <p className="case-tag text-paper/50 mt-2 text-center">{score.label}</p>}
        </div>
        <div className="md:col-span-2 grid grid-cols-3 gap-4">
          {score && (
            <>
              <StatCard label="Critical" value={score.issue_counts.critical} tone="critical" />
              <StatCard label="Warning" value={score.issue_counts.warning} tone="warning" />
              <StatCard label="Passed" value={score.issue_counts.passed} tone="ok" />
            </>
          )}
        </div>
      </section>

      <section>
        <SectionTitle>AI pipeline — live run</SectionTitle>
        <PipelineViz3D stageStatus={stageStatus} />
      </section>

      <section>
        <SectionTitle>Column-level findings</SectionTitle>
        {report ? (
          <IssuesTable report={report} onInspect={(column, issueType) => setInspectTarget({ column, issueType })} />
        ) : (
          <p className="text-paper/50 text-sm">Running checks...</p>
        )}
      </section>

      <ExplanationPanel
        datasetId={dataset.dataset_id}
        target={inspectTarget}
        onEvidence={setHighlightedSources}
      />

      <section>
        <SectionTitle>RAG knowledge space</SectionTitle>
        <p className="text-paper/60 text-sm mb-3">
          Each point is a chunk of the knowledge base, projected to 3D. Running an investigation above
          highlights the source it retrieved from.
        </p>
        <EmbeddingSpace3D data={embeddingData} highlightedSources={highlightedSources} />
      </section>

      <section>
        <SectionTitle>Chat with your dataset</SectionTitle>
        <ChatPanel datasetId={dataset.dataset_id} />
      </section>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 className="font-display text-lg mb-3 text-paper/90">{children}</h2>;
}

function StatCard({ label, value, tone }) {
  const color = tone === "critical" ? "text-alert" : tone === "warning" ? "text-amber-500" : "text-teal-400";
  return (
    <div className="rounded-lg border border-ink-700/60 bg-ink-900/40 px-4 py-5 text-center">
      <div className={`text-3xl font-display ${color}`}>{value}</div>
      <div className="case-tag text-paper/50 mt-1">{label}</div>
    </div>
  );
}
