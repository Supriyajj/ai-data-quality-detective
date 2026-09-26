import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { columnRiskIndex } from "../utils/severity";

function riskColor(value) {
  if (value >= 60) return "#FB7185";
  if (value >= 30) return "#FBBF24";
  return "#34D399";
}

export default function ColumnRiskChart({ report }) {
  const data = useMemo(() => columnRiskIndex(report), [report]);
  if (!report) return null;

  return (
    <div className="card card-hover card-3d p-6">
      <p className="case-tag text-ink-500 mb-1">COLUMN RISK INDEX</p>
      <p className="text-ink-500 text-xs mb-4">Which columns need attention first</p>
      <ResponsiveContainer width="100%" height={Math.max(180, data.length * 32)}>
        <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#94A3B8" }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#CBD5E1" }} width={100} />
          <Tooltip contentStyle={{ background: "#0E172A", border: "1px solid rgba(148,163,184,0.15)", borderRadius: 8 }} labelStyle={{ color: "#F8FAFC" }} itemStyle={{ color: "#CBD5E1" }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((d) => <Cell key={d.name} fill={riskColor(d.value)} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
