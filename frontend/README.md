# AI Data Quality Detective — cleaned frontend

Run:

```bash
npm install
npm run dev
```

This version intentionally removes the unnecessary duplicate components/pages from the original tree.

Kept: Overview, Upload Dataset, AI Analysis, Ask Dataset, AI Pipeline, Tools & Agent, Reports.

Removed: Dashboard.jsx, ColumnsPage.jsx, SettingsPage.jsx, EmbeddingSpace3D.jsx, QualityOrb3D.jsx, and duplicate standalone component copies.

The UI currently uses demo data. Replace the upload/analysis mock logic with your Python backend API when the backend is ready.
