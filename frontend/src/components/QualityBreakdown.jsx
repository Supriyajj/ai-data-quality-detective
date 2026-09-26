import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function QualityBreakdown({ report, score }) {
  const data = useMemo(() => {
    if (!report) return [];
    const totalCells = report.shape.rows * report.shape.columns;
    const missingTotal = Object.values(report.missing).reduce((a, b) => a + b, 0);
    const invalidTotal = Object.values(report.invalid).reduce((a, b) => a + b.count, 0);
    const outlierTotal = Object.values(report.outliers).reduce((a, b) => a + b.count, 0);
    const affectedCells = missingTotal + invalidTotal + outlierTotal + report.duplicates.count;
    const cleanPct = Math.max(0, Math.round(((totalCells - affectedCells) / totalCells) * 100));
    return [
      { name: "Clean", value: cleanPct },
      { name: "Issues", value: 100 - cleanPct },
    ];
  }, [report]);

  if (!report || !score) return null;

  return (
    <div className="card card-hover card-3d p-6">
      <p className="case-tag text-ink-500 mb-1">DATA QUALITY BREAKDOWN</p>
      <p className="text-ink-500 text-xs mb-4">Share of cells with no detected issue vs. at least one</p>
      <div className="relative">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={78} startAngle={90} endAngle={-270}>
              <Cell fill="#34D399" />
              <Cell fill="#8B5CF6" />
            </Pie>
            <Tooltip contentStyle={{ background: "#0E172A", border: "1px solid rgba(148,163,184,0.15)", borderRadius: 8 }} labelStyle={{ color: "#F8FAFC" }} itemStyle={{ color: "#CBD5E1" }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 top-0 flex flex-col items-center justify-center pointer-events-none" style={{ height: 180 }}>
          <span className="text-2xl font-semibold text-ink-900">{data[0]?.value ?? 0}%</span>
          <span className="case-tag text-ink-500">clean</span>
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-2">
        <span className="flex items-center gap-1.5 text-xs text-ink-700"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Clean</span>
        <span className="flex items-center gap-1.5 text-xs text-ink-700"><span className="w-2 h-2 rounded-full bg-primary-500" /> Issues</span>
      </div>
    </div>
  );
}
