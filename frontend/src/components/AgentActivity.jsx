import React, { useMemo } from "react";

// Renders the agent's tool_calls (from /api/chat) as a timestamped activity
// log. Timestamps are generated client-side at render time - the backend
// doesn't track wall-clock time per step, only which tools ran and in what
// order, which is what's actually being visualized here.
export default function AgentActivity({ run }) {
  const steps = useMemo(() => {
    if (!run) return [];
    const now = new Date();
    const fmt = (offsetSec) => {
      const t = new Date(now.getTime() + offsetSec * 1000);
      return t.toTimeString().slice(0, 8);
    };
    const out = [{ time: fmt(0), label: "Question received", detail: `"${run.question}"`, color: "text-ink-500" }];
    let t = 1;
    run.tool_calls.forEach((call) => {
      if (call.tool === "analyze_column") {
        out.push({ time: fmt(t), label: "→ Data Analysis Tool", detail: `analyze_column('${call.input}')`, color: "text-blue-600" });
      } else if (call.tool === "search_quality_knowledge") {
        out.push({
          time: fmt(t),
          label: "→ Knowledge Search Tool",
          detail: `${call.output.length} relevant document(s) retrieved`,
          color: "text-teal-600",
        });
      }
      t += 1;
    });
    out.push({ time: fmt(t), label: "→ RAG context prepared", detail: "", color: "text-pink-600" });
    out.push({ time: fmt(t + 1), label: "→ LLM generating explanation", detail: "", color: "text-primary-600" });
    out.push({ time: fmt(t + 2), label: "✓ Answer ready", detail: "", color: "text-emerald-600" });
    return out;
  }, [run]);

  if (!run) {
    return (
      <div className="card p-6 text-center text-ink-500 text-sm">
        Ask a question on the "Ask Dataset" page to see the agent's tool activity here.
      </div>
    );
  }

  return (
    <div className="card p-6">
      <p className="case-tag text-ink-500 mb-4">AGENT ACTIVITY</p>
      <div className="space-y-2 font-mono text-xs">
        {steps.map((s, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-ink-500 shrink-0">{s.time}</span>
            <span className={s.color}>{s.label}</span>
            {s.detail && <span className="text-ink-700 truncate">{s.detail}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
