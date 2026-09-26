import React from "react";

const ICONS = {
  overview: <path d="M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6V11h-6v9zm0-16v5h6V4h-6z" />,
  upload: <path d="M12 16V4m0 0L7 9m5-5l5 5M4 20h16" />,
  investigation: <path d="M4 6h16M4 12h16M4 18h10" />,
  analysis: <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />,
  pipeline: <path d="M4 6h4v4H4V6zm0 8h4v4H4v-4zm12-8h4v4h-4V6zm0 8h4v4h-4v-4zM8 8h8M8 16h8M12 10v4" />,
  tools: <path d="M14.7 6.3a4 4 0 11-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 015.4-5.4z" />,
  chat: <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />,
  report: <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />,
  settings: <path d="M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />,
};

const NAV = [
  { key: "dashboard", label: "Overview", icon: "overview", needsDataset: true },
  { key: "upload", label: "Upload Dataset", icon: "upload", needsDataset: false },
  { key: "columns", label: "Investigation", icon: "investigation", needsDataset: true },
  { key: "analysis", label: "AI Analysis", icon: "analysis", needsDataset: true },
  { key: "pipeline", label: "AI Pipeline", icon: "pipeline", needsDataset: true },
  { key: "tools", label: "Tools & Agent", icon: "tools", needsDataset: true },
  { key: "chat", label: "Ask Dataset", icon: "chat", needsDataset: true },
  { key: "report", label: "Reports", icon: "report", needsDataset: true },
  { key: "settings", label: "Settings", icon: "settings", needsDataset: false },
];

function Icon({ name, className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" className={className}>
      {ICONS[name]}
    </svg>
  );
}

export default function Sidebar({ active, onNavigate, hasDataset, datasetName, llmOnline }) {
  return (
    <aside className="w-64 shrink-0 bg-sidebar border-r border-border flex flex-col h-screen sticky top-0">
      <div className="px-5 py-6 border-b border-border">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center text-white text-base font-bold shrink-0 shadow-glow-lg" style={{ transform: "perspective(200px) rotateY(-8deg)" }}>
            ◈
          </span>
          <div>
            <div className="text-white font-semibold text-sm leading-tight tracking-wide">DQ DETECTIVE</div>
            <div className="case-tag text-ink-500">AI DATA QUALITY</div>
          </div>
        </div>
      </div>

      <div className="px-3 pt-4 pb-2">
        <p className="case-tag text-ink-500 px-2 mb-1">WORKSPACE</p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => {
          const disabled = item.needsDataset && !hasDataset;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              disabled={disabled}
              onClick={() => onNavigate(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive
                  ? "bg-sidebar-active text-white shadow-lift translate-x-0.5"
                  : disabled
                  ? "text-ink-500/60 cursor-not-allowed"
                  : "text-ink-500 hover:bg-sidebar-hover hover:text-white hover:translate-x-0.5"
              }`}
            >
              <Icon name={item.icon} className={`w-4 h-4 shrink-0 ${isActive ? "text-primary-400 drop-shadow-[0_0_6px_rgba(139,92,246,0.7)]" : ""}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-border">
        <p className="case-tag text-ink-500 mb-1.5">CURRENT DATASET</p>
        <p className="text-sm text-white/80 truncate mb-3">{datasetName || "No dataset loaded"}</p>
        <div className="flex items-center gap-2">
          <span className={`status-dot ${llmOnline ? "bg-emerald-500 pulse" : "bg-ink-500"}`} />
          <span className="case-tag text-ink-500">
            {llmOnline ? "AI ONLINE" : "AI OFFLINE MODE"}
          </span>
        </div>
      </div>
    </aside>
  );
}
