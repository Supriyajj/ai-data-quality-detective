import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import UploadPage from "./components/pages/UploadPage";
import OverviewPage from "./components/pages/OverviewPage";
import ColumnsPage from "./components/pages/ColumnsPage";
import AnalysisPage from "./components/pages/AnalysisPage";
import PipelinePage from "./components/pages/PipelinePage";
import ToolsAgentPage from "./components/pages/ToolsAgentPage";
import ChatPage from "./components/pages/ChatPage";
import ReportPage from "./components/pages/ReportPage";
import SettingsPage from "./components/pages/SettingsPage";
import { analyzeDataset, getEmbeddingSpace, openPipelineSocket, getHealth } from "./api/client";

const PAGE_TITLES = {
  dashboard: "Data Quality Command Center",
  upload: "Start New Investigation",
  columns: "Investigation",
  analysis: "AI Analysis",
  pipeline: "AI Pipeline",
  tools: "AI Investigation Agent",
  chat: "Ask Your Dataset",
  report: "Investigation Report",
  settings: "Settings",
};

export default function App() {
  const [dataset, setDataset] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");

  // Analysis state, lifted here so it survives switching tabs and the
  // pipeline WebSocket keeps running in the background regardless of which
  // page is currently visible.
  const [report, setReport] = useState(null);
  const [score, setScore] = useState(null);
  const [stageStatus, setStageStatus] = useState({});
  const [embeddingData, setEmbeddingData] = useState(null);
  const [highlightedSources, setHighlightedSources] = useState([]);
  const [inspectTarget, setInspectTarget] = useState(null);
  const [lastAgentRun, setLastAgentRun] = useState(null); // most recent chat tool_calls, for the Agent Activity log
  const [health, setHealth] = useState(null);

  useEffect(() => {
    getHealth().then(setHealth).catch(() => setHealth(null));
  }, []);

  useEffect(() => {
    if (!dataset) return;
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
  }, [dataset]);

  function handleUploaded(result) {
    setDataset(result);
    setReport(null);
    setScore(null);
    setStageStatus({});
    setInspectTarget(null);
    setHighlightedSources([]);
    setLastAgentRun(null);
    setActiveTab("dashboard");
  }

  function handleReset() {
    setDataset(null);
    setActiveTab("upload");
  }

  function handleInspect(column, issueType) {
    setInspectTarget({ column, issueType });
    setActiveTab("analysis");
  }

  function renderPage() {
    switch (activeTab) {
      case "upload":
        return <UploadPage onUploaded={handleUploaded} />;
      case "dashboard":
        return dataset && (
          <OverviewPage dataset={dataset} report={report} score={score} onOpenInvestigation={() => setActiveTab("columns")} />
        );
      case "columns":
        return dataset && <ColumnsPage report={report} onInspect={handleInspect} />;
      case "analysis":
        return dataset && (
          <AnalysisPage datasetId={dataset.dataset_id} target={inspectTarget} onEvidence={setHighlightedSources} />
        );
      case "pipeline":
        return dataset && <PipelinePage stageStatus={stageStatus} />;
      case "tools":
        return dataset && (
          <ToolsAgentPage embeddingData={embeddingData} highlightedSources={highlightedSources} lastAgentRun={lastAgentRun} />
        );
      case "chat":
        return dataset && <ChatPage datasetId={dataset.dataset_id} onAgentRun={setLastAgentRun} />;
      case "report":
        return dataset && <ReportPage dataset={dataset} report={report} score={score} />;
      case "settings":
        return <SettingsPage dataset={dataset} onReset={handleReset} health={health} />;
      default:
        return null;
    }
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar
        active={activeTab}
        onNavigate={setActiveTab}
        hasDataset={!!dataset}
        datasetName={dataset?.filename}
        llmOnline={!!health && health.llm_provider !== "none"}
      />
      <main className="flex-1 min-w-0">
        <header className="px-8 py-6 border-b border-border sticky top-0 z-10 bg-canvas/70 backdrop-blur-md">
          <p className="case-tag text-primary-600 mb-1">WORKSPACE / {activeTab.toUpperCase()}</p>
          <h2 className="text-xl font-semibold text-ink-900 tracking-tight">{PAGE_TITLES[activeTab]}</h2>
        </header>
        <div className="p-8">{renderPage()}</div>
      </main>
    </div>
  );
}
