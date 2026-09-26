import React, { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../api/client";

const SUGGESTIONS = ["Worst columns", "Explain outliers", "Missing values", "Duplicate records"];

export default function ChatPanel({ datasetId, onAgentRun }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "I found several issue groups in this dataset. Ask me anything - which column is worst, why something matters, or what to do about it." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(overrideText) {
    const question = (overrideText ?? input).trim();
    if (!question || busy) return;
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setBusy(true);
    try {
      const result = await sendChatMessage(datasetId, question);
      setMessages((m) => [...m, { role: "assistant", text: result.answer, tools: result.tool_calls }]);
      onAgentRun?.({ question, tool_calls: result.tool_calls });
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", text: `Error: ${e.message}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 card flex flex-col h-[520px] overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
          <span className="text-primary-600">◈</span>
          <span className="text-sm text-ink-900 font-medium">Dataset Investigator</span>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
              <div
                className={`inline-block max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                  m.role === "user" ? "bg-primary-500 text-white" : "bg-canvas/60 text-ink-700 border border-border"
                }`}
              >
                {m.text}
              </div>
              {m.tools?.length > 0 && (
                <div className="case-tag text-teal-600 mt-1">
                  tools used: {m.tools.map((t) => t.tool).join(", ")}
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="flex border-t border-border p-3 gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about your dataset..."
            className="flex-1 bg-canvas/60 border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500 text-ink-900 placeholder:text-ink-500"
          />
          <button
            onClick={() => send()}
            disabled={busy}
            className="px-5 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 disabled:opacity-50"
          >
            {busy ? "..." : "→"}
          </button>
        </div>
      </div>

      <div className="card p-5 h-fit">
        <p className="case-tag text-ink-500 mb-3">TRY ASKING</p>
        <div className="space-y-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={busy}
              className="w-full text-left px-3 py-2 rounded-lg bg-canvas/40 border border-border text-ink-700 text-sm hover:border-primary-500/40 hover:text-ink-900 transition-colors disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
