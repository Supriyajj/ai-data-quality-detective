import React from "react";
import { SEVERITY } from "../utils/severity";

function SeverityBadge({ level }) {
  const styles = {
    CRITICAL: "text-alert bg-alert/10",
    HIGH: "text-amber-600 bg-amber-400/10",
    MEDIUM: "text-blue-600 bg-blue-400/10",
  };
  return (
    <span className={`case-tag px-2 py-0.5 rounded ${styles[level]}`}>{level}</span>
  );
}

export default function IssuesTable({ report, onInspect }) {
  if (!report) return null;
  const columns = Object.keys(report.dtypes);

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-canvas/40 text-ink-500 case-tag">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Severity</th>
              <th className="text-left px-5 py-3 font-medium">Column</th>
              <th className="text-left px-5 py-3 font-medium">Type</th>
              <th className="text-left px-5 py-3 font-medium">Missing</th>
              <th className="text-left px-5 py-3 font-medium">Invalid</th>
              <th className="text-left px-5 py-3 font-medium">Outliers</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {columns.map((col) => {
              const missing = report.missing[col] || 0;
              const invalid = report.invalid[col];
              const outlier = report.outliers[col];
              const hasIssue = missing > 0 || !!invalid || !!outlier;
              const level = invalid ? "CRITICAL" : missing ? "HIGH" : outlier ? "MEDIUM" : null;
              return (
                <tr key={col} className="hover:bg-primary-500/[0.04]">
                  <td className="px-5 py-3">{level ? <SeverityBadge level={level} /> : <span className="text-emerald-600 text-xs">Clean</span>}</td>
                  <td className="px-5 py-3 font-medium text-ink-900">{col}</td>
                  <td className="px-5 py-3 font-mono text-xs text-ink-500">{report.dtypes[col]}</td>
                  <td className="px-5 py-3 text-ink-700">{missing || "-"}</td>
                  <td className="px-5 py-3 text-ink-700">{invalid ? invalid.count : "-"}</td>
                  <td className="px-5 py-3 text-ink-700">{outlier ? outlier.count : "-"}</td>
                  <td className="px-5 py-3">
                    {hasIssue && (
                      <button
                        onClick={() => onInspect(col, invalid ? "invalid" : outlier ? "outliers" : "missing")}
                        className="text-primary-600 hover:text-primary-500 text-xs font-medium underline underline-offset-2"
                      >
                        Investigate
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            <tr className="hover:bg-primary-500/[0.04]">
              <td className="px-5 py-3">
                {report.duplicates.count > 0 ? <SeverityBadge level="CRITICAL" /> : <span className="text-emerald-600 text-xs">Clean</span>}
              </td>
              <td className="px-5 py-3 font-medium text-ink-900">Duplicate rows</td>
              <td className="px-5 py-3 text-ink-500">-</td>
              <td colSpan={3} className="px-5 py-3 text-ink-700">{report.duplicates.count} rows</td>
              <td className="px-5 py-3">
                {report.duplicates.count > 0 && (
                  <button
                    onClick={() => onInspect(null, "duplicates")}
                    className="text-primary-600 hover:text-primary-500 text-xs font-medium underline underline-offset-2"
                  >
                    Investigate
                  </button>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
