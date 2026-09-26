import React from "react";
import QualityOrb3D from "../QualityOrb3D";
import QualityBreakdown from "../QualityBreakdown";
import IssuesByCategory from "../IssuesByCategory";
import SeverityChart from "../SeverityChart";
import ColumnRiskChart from "../ColumnRiskChart";

function KPICard({ label, value, icon, accent }) {
  return (
    <div className="card card-hover card-3d p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="case-tag text-ink-500">{label}</span>
        <span className={`${accent} text-lg drop-shadow-[0_0_8px_currentColor]`}>{icon}</span>
      </div>
      <div className="text-2xl font-semibold text-ink-900">{value}</div>
    </div>
  );
}

export default function OverviewPage({ dataset, report, score, onOpenInvestigation }) {
  const issueGroups = score
    ? [report.missing, report.invalid, report.outliers].filter((g) => Object.keys(g).length > 0).length +
      (report.duplicates.count > 0 ? 1 : 0)
    : null;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div
        className="card p-8 relative overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle at 75% 30%, rgba(139,92,246,0.22), transparent 45%), radial-gradient(circle at 20% 80%, rgba(34,211,238,0.15), transparent 40%)",
        }}
      >
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary-500/20 blur-3xl animate-drift pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-teal-400/15 blur-3xl animate-drift-slow pointer-events-none" />
        <p className="case-tag text-primary-600 mb-3 relative">✦ AI-POWERED DATA INVESTIGATION</p>
        <h1 className="text-2xl md:text-3xl font-semibold text-ink-900 mb-2 max-w-lg relative drop-shadow-[0_2px_12px_rgba(139,92,246,0.25)]">
          Your dataset has a story. Let AI investigate it.
        </h1>
        <p className="text-ink-500 max-w-md mb-5 text-sm relative">
          Detect hidden data-quality problems, investigate evidence, retrieve relevant knowledge, and
          generate recommendations.
        </p>
        <div className="flex gap-3 mb-5 relative">
          <button onClick={onOpenInvestigation} className="px-5 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 shadow-glow-lg hover:-translate-y-0.5 transition-transform">
            Open Investigation
          </button>
        </div>
        <div className="flex flex-wrap gap-2 relative">
          {["Missing Values", "Duplicates", "Outliers", "Invalid Values"].map((b) => (
            <span key={b} className="case-tag px-3 py-1.5 rounded-full bg-primary-500/[0.06] border border-primary-500/15 text-ink-700">
              ✓ {b}
            </span>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="QUALITY" value={score ? `${score.score}/100` : "-"} icon="◈" accent="text-primary-600" />
        <KPICard label="RECORDS" value={dataset.rows.toLocaleString()} icon="▤" accent="text-blue-600" />
        <KPICard label="ISSUE GROUPS" value={issueGroups ?? "-"} icon="⚠" accent="text-amber-600" />
        <KPICard label="AI ENGINE" value="READY" icon="●" accent="text-emerald-600" />
      </div>

      {/* Charts grid */}
      {report && score ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex items-center justify-center card card-hover card-3d p-6">
              <div className="text-center">
                <p className="case-tag text-ink-500 mb-3">DATA HEALTH</p>
                <QualityOrb3D score={score.score} />
                <p className="case-tag text-ink-500 mt-3">{score.label}</p>
              </div>
            </div>
            <QualityBreakdown report={report} score={score} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IssuesByCategory report={report} />
            <SeverityChart report={report} />
          </div>
          <ColumnRiskChart report={report} />

          {/* Current investigation summary */}
          <div className="card p-6">
            <p className="case-tag text-ink-500 mb-3">CURRENT INVESTIGATION</p>
            <h3 className="text-ink-900 font-medium mb-4">{dataset.filename}</h3>
            <div className="flex flex-wrap gap-6 text-sm mb-4">
              <span className="text-ink-500">{dataset.rows.toLocaleString()} rows</span>
              <span className="text-ink-500">{dataset.columns} columns</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              <MiniStat label="Missing" value={Object.values(report.missing).reduce((a, b) => a + b, 0)} color="text-teal-600" />
              <MiniStat label="Duplicates" value={report.duplicates.count} color="text-primary-600" />
              <MiniStat label="Invalid" value={Object.values(report.invalid).reduce((a, b) => a + b.count, 0)} color="text-alert" />
              <MiniStat label="Outliers" value={Object.values(report.outliers).reduce((a, b) => a + b.count, 0)} color="text-amber-600" />
            </div>
            <button onClick={onOpenInvestigation} className="text-primary-600 hover:text-primary-500 text-sm font-medium">
              Open Investigation →
            </button>
          </div>
        </>
      ) : (
        <div className="card p-8 text-center text-ink-500 text-sm">Running analysis...</div>
      )}
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div>
      <div className={`text-xl font-semibold ${color}`}>{value}</div>
      <div className="case-tag text-ink-500">{label}</div>
    </div>
  );
}
