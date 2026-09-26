import React from "react";
import ReportDownload from "../ReportDownload";

export default function ReportPage({ dataset, score, report }) {
  return (
    <div className="space-y-6">
      <div className="card p-8">
        <p className="case-tag text-primary-600 mb-1">AI DATA QUALITY DETECTIVE</p>
        <p className="case-tag text-ink-500 mb-4">DATA QUALITY INVESTIGATION</p>
        <h3 className="text-ink-900 text-lg font-medium mb-6">{dataset.filename}</h3>

        {score && report ? (
          <>
            <div className="grid grid-cols-3 gap-6 mb-6 pb-6 border-b border-border">
              <div>
                <div className="text-3xl font-semibold text-ink-900">{score.score}/100</div>
                <div className="case-tag text-ink-500">QUALITY SCORE</div>
              </div>
              <div>
                <div className="text-3xl font-semibold text-ink-900">{dataset.rows.toLocaleString()}</div>
                <div className="case-tag text-ink-500">RECORDS</div>
              </div>
              <div>
                <div className="text-3xl font-semibold text-ink-900">
                  {score.issue_counts.critical + score.issue_counts.warning}
                </div>
                <div className="case-tag text-ink-500">ISSUE GROUPS</div>
              </div>
            </div>

            <p className="case-tag text-ink-500 mb-3">KEY FINDINGS</p>
            <div className="space-y-2 mb-6 text-sm">
              {Object.entries(report.invalid).map(([col, v]) => (
                <Finding key={col} label={`Invalid values`} detail={`${col} — ${v.count} records`} color="text-alert" />
              ))}
              {Object.entries(report.missing).map(([col, count]) => (
                <Finding key={col} label={`Missing values`} detail={`${col} — ${count} records`} color="text-amber-600" />
              ))}
              {report.duplicates.count > 0 && (
                <Finding label="Duplicates" detail={`${report.duplicates.count} records`} color="text-alert" />
              )}
              {Object.entries(report.outliers).map(([col, v]) => (
                <Finding key={col} label={`Outliers`} detail={`${col} — ${v.count} records`} color="text-blue-600" />
              ))}
            </div>
          </>
        ) : (
          <p className="text-ink-500 text-sm mb-6">Analysis still running...</p>
        )}

        <ReportDownload datasetId={dataset.dataset_id} />
      </div>
      <p className="text-ink-500 text-sm">
        The full HTML report includes every check result plus any AI explanations generated on the
        AI Analysis page during this session.
      </p>
    </div>
  );
}

function Finding({ label, detail, color }) {
  return (
    <div className="flex items-center gap-2">
      <span className={color}>⚠</span>
      <span className="text-ink-700">{label}</span>
      <span className="text-ink-500">— {detail}</span>
    </div>
  );
}
