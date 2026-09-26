import React from "react";
import UploadPanel from "../UploadPanel";

const BADGES = [
  { label: "Missing Values", color: "bg-teal-400" },
  { label: "Duplicates", color: "bg-primary-500" },
  { label: "Invalid Values", color: "bg-alert" },
  { label: "Outliers", color: "bg-amber-400" },
];

export default function UploadPage({ onUploaded }) {
  return (
    <div className="max-w-2xl mx-auto text-center py-8">
      <p className="case-tag text-primary-600 mb-3">✦ NEW CASE FILE</p>
      <h1 className="text-3xl font-semibold text-ink-900 mb-2">
        <span className="bg-gradient-to-r from-primary-400 to-pink-400 bg-clip-text text-transparent">
          AI Data Quality
        </span>{" "}
        Detective
      </h1>
      <p className="text-ink-500 mb-6">
        Find problems before they affect your data, models, or business decisions.
      </p>
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {BADGES.map((b) => (
          <span key={b.label} className="case-tag inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-500/[0.06] border border-primary-500/15 text-ink-700">
            <span className={`w-1.5 h-1.5 rounded-full ${b.color}`} /> {b.label}
          </span>
        ))}
      </div>
      <UploadPanel onUploaded={onUploaded} />
    </div>
  );
}
