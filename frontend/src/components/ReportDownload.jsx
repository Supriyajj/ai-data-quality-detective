import React from "react";
import { reportUrl } from "../api/client";

export default function ReportDownload({ datasetId }) {
  return (
    <a
      href={reportUrl(datasetId)}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-medium shadow-glow"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
           strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
      </svg>
      Download Report
    </a>
  );
}
