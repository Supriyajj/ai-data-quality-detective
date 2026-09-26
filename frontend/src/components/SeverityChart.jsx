import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { severityCounts } from "../utils/severity";

export default function SeverityChart({ report }) {
  const data = useMemo(() => severityCounts(report), [report]);
  if (!report) return null;

  return (
    <div className="card card-hover card-3d p-6">
      <p className="case-tag text-ink-500 mb-1">ISSUE SEVERITY</p>
      <p className="text-ink-500 text-xs mb-4">What to investigate first</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#CBD5E1" }} />
          <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} allowDecimals={false} />
          <Tooltip contentStyle={{ background: "#0E172A", border: "1px solid rgba(148,163,184,0.15)", borderRadius: 8 }} labelStyle={{ color: "#F8FAFC" }} itemStyle={{ color: "#CBD5E1" }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((d) => <Cell key={d.name} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
