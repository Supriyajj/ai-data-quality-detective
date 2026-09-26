import React, { useRef, useState } from "react";
import { uploadCsv } from "../api/client";

export default function UploadPanel({ onUploaded }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file) {
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      setError("Please upload a .csv file.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const result = await uploadCsv(file);
      onUploaded(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
      className={`rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 card ${
        dragging ? "border-primary-500 bg-primary-500/10 shadow-glow-lg scale-[1.01]" : "border-ink-900/15 hover:border-primary-500/50 hover:shadow-lift"
      }`}
    >
      <div className="mx-auto w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center mb-4 shadow-glow" style={{ transform: "perspective(300px) rotateX(6deg)" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
             strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-primary-600">
          <path d="M12 16V4m0 0L7 9m5-5l5 5M4 20h16" />
        </svg>
      </div>
      <p className="font-semibold text-ink-900 text-lg mb-1">Drop CSV here</p>
      <p className="text-ink-500 text-sm mb-1">or click below to browse</p>
      <p className="case-tag text-ink-500 mb-6">CSV · 100 MB MAX</p>
      <button
        onClick={() => inputRef.current.click()}
        disabled={busy}
        className="px-6 py-2.5 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 shadow-glow"
      >
        {busy ? "Uploading..." : "Analyze Dataset"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
      {error && <p className="text-alert text-sm mt-3">{error}</p>}
    </div>
  );
}
