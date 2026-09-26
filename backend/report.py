"""
report.py
Builds a downloadable HTML report from the analysis + AI explanations.
Kept dependency-free (no PDF library) for the first version, as planned.
"""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Any

_TEMPLATE = """<!doctype html>
<html><head><meta charset="utf-8">
<title>AI Data Quality Report - {filename}</title>
<style>
  body {{ font-family: -apple-system, Segoe UI, sans-serif; max-width: 760px; margin: 40px auto; color: #1c1f26; }}
  h1 {{ font-size: 1.4rem; }}
  .score {{ font-size: 3rem; font-weight: 700; }}
  table {{ border-collapse: collapse; width: 100%; margin: 16px 0; }}
  th, td {{ border: 1px solid #ddd; padding: 6px 10px; text-align: left; font-size: 0.9rem; }}
  th {{ background: #f4f1ea; }}
  .section {{ margin-top: 28px; }}
  .muted {{ color: #666; font-size: 0.85rem; }}
</style></head>
<body>
  <h1>AI Data Quality Report</h1>
  <p class="muted">File: {filename} &middot; Generated: {generated_at}</p>

  <div class="section">
    <div class="score">{score}/100</div>
    <p class="muted">{score_label}</p>
  </div>

  <div class="section">
    <h2>Dataset</h2>
    <p>{rows} rows &times; {cols} columns</p>
  </div>

  <div class="section">
    <h2>Issues found</h2>
    <table>
      <tr><th>Check</th><th>Count</th></tr>
      <tr><td>Missing values (cells)</td><td>{missing_total}</td></tr>
      <tr><td>Duplicate rows</td><td>{dup_count}</td></tr>
      <tr><td>Invalid values (cells)</td><td>{invalid_total}</td></tr>
      <tr><td>Outliers (cells)</td><td>{outlier_total}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>AI explanations</h2>
    {explanations_html}
  </div>
</body></html>
"""


def build_html_report(filename: str, report: dict[str, Any], score_info: dict[str, Any],
                       explanations: dict[str, str]) -> str:
    missing_total = sum(report["missing"].values())
    invalid_total = sum(v["count"] for v in report["invalid"].values())
    outlier_total = sum(v["count"] for v in report["outliers"].values())

    exp_html = "".join(
        f"<h3>{col}</h3><p>{text}</p>" for col, text in explanations.items()
    ) or "<p class='muted'>No AI explanations were generated for this run.</p>"

    return _TEMPLATE.format(
        filename=filename,
        generated_at=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        score=score_info["score"],
        score_label=score_info["label"],
        rows=report["shape"]["rows"],
        cols=report["shape"]["columns"],
        missing_total=missing_total,
        dup_count=report["duplicates"]["count"],
        invalid_total=invalid_total,
        outlier_total=outlier_total,
        explanations_html=exp_html,
    )
