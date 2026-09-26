import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// Consistent color-per-category, matching the app's semantic mapping.
const CATEGORY_COLOR = {
  Missing: "#22D3EE",
  Duplicates: "#8B5CF6",
  Invalid: "#FB7185",
  Outliers: "#FBBF24",
};

export default function IssuesByCategory({ report }) {
  const data = useMemo(() => {
    if (!report) return [];
    const missingTotal = Object.values(report.missing).reduce((a, b) => a + b, 0);
    const invalidTotal = Object.values(report.invalid).reduce((a, b) => a + b.count, 0);
    const outlierTotal = Object.values(report.outliers).reduce((a, b) => a + b.count, 0);
    return [
      { name: "Missing", value: missingTotal },
      { name: "Duplicates", value: report.duplicates.count },
      { name: "Invalid", value: invalidTotal },
      { name: "Outliers", value: outlierTotal },
    ];
  }, [report]);

  if (!report) return null;

  return (
    <div className="card card-hover card-3d p-6">
      <p className="case-tag text-ink-500 mb-1">ISSUES BY CATEGORY</p>
      <p className="text-ink-500 text-xs mb-4">Total affected cells / rows per check type</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
          <XAxis type="number" tick={{ fontSize: 10, fill: "#94A3B8" }} allowDecimals={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#CBD5E1" }} width={80} />
          <Tooltip contentStyle={{ background: "#0E172A", border: "1px solid rgba(148,163,184,0.15)", borderRadius: 8 }} labelStyle={{ color: "#F8FAFC" }} itemStyle={{ color: "#CBD5E1" }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((d) => <Cell key={d.name} fill={CATEGORY_COLOR[d.name]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
