import React from "react";
import ChatPanel from "../ChatPanel";

export default function ChatPage({ datasetId, onAgentRun }) {
  return (
    <div className="space-y-4">
      <p className="text-ink-500 text-sm">
        The agent decides which tool(s) to call - dataset statistics, the knowledge base, or both -
        before composing its answer. See the step-by-step run on the Tools & Agent page.
      </p>
      <ChatPanel datasetId={datasetId} onAgentRun={onAgentRun} />
    </div>
  );
}
