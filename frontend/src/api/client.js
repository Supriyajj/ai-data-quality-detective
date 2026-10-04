// Local dev: "" (empty) keeps using Vite's proxy in vite.config.js.
// Production build: falls back to PRODUCTION_BACKEND_URL below if
// VITE_API_BASE isn't set - update that line directly whenever the tunnel
// URL changes, then git push, instead of relying on Vercel's env var UI.
// import.meta.env.PROD is Vite's own built-in flag (true only in a real
// `npm run build`), so this fallback never affects local `npm run dev`.
const PRODUCTION_BACKEND_URL = "https://radio-mods-proved-fortune.trycloudflare.com";const API_ROOT = import.meta.env.VITE_API_BASE || (import.meta.env.PROD ? PRODUCTION_BACKEND_URL : "");
const BASE = `${API_ROOT}/api`;

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function uploadCsv(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/upload`, { method: "POST", body: form });
  return handle(res);
}

export async function analyzeDataset(datasetId) {
  const res = await fetch(`${BASE}/analyze/${datasetId}`, { method: "POST" });
  return handle(res);
}

export async function getColumn(datasetId, column) {
  const res = await fetch(`${BASE}/columns/${datasetId}/${encodeURIComponent(column)}`);
  return handle(res);
}

export async function explainIssue(datasetId, issueType, column) {
  const res = await fetch(`${BASE}/explain/${datasetId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ issue_type: issueType, column }),
  });
  return handle(res);
}

export async function tokenizeText(text) {
  const res = await fetch(`${BASE}/tokenize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return handle(res);
}

export async function getEmbeddingSpace(query) {
  const url = query ? `${BASE}/embedding-space?query=${encodeURIComponent(query)}` : `${BASE}/embedding-space`;
  const res = await fetch(url);
  return handle(res);
}

export async function sendChatMessage(datasetId, message) {
  const res = await fetch(`${BASE}/chat/${datasetId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return handle(res);
}

export async function getHealth() {
  const res = await fetch(`${BASE}/health`);
  return handle(res);
}

export function reportUrl(datasetId) {
  return `${BASE}/report/${datasetId}`;
}

export function openPipelineSocket(datasetId, onMessage, onClose) {
  let wsUrl;
  if (API_ROOT) {
    // Production: derive ws(s):// from the configured backend's http(s):// URL.
    wsUrl = API_ROOT.replace(/^http/, "ws") + `/ws/pipeline/${datasetId}`;
  } else {
    // Local dev: same-origin, proxied by Vite.
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    wsUrl = `${proto}://${window.location.host}/ws/pipeline/${datasetId}`;
  }
  const ws = new WebSocket(wsUrl);
  ws.onmessage = (evt) => onMessage(JSON.parse(evt.data));
  ws.onclose = () => onClose && onClose();
  return ws;
}