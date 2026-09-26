"""
quality_score.py
Turns the raw findings from analyzer.py into one heuristic 0-100 score.
This is explicitly OUR heuristic, not an industry-standard metric - the
frontend must label it that way.
"""
from __future__ import annotations
from typing import Any

WEIGHTS = {
    "missing": 0.15,     # penalty per % of cells missing
    "duplicate": 0.30,   # penalty per % of rows duplicated
    "invalid": 0.50,     # penalty per % of values invalid (weighted higher: correctness)
    "outlier": 0.10,     # penalty per % of values flagged as outliers
}


def compute_quality_score(report: dict[str, Any]) -> dict[str, Any]:
    rows = max(report["shape"]["rows"], 1)
    cols = max(report["shape"]["columns"], 1)
    total_cells = rows * cols

    missing_total = sum(report["missing"].values())
    missing_pct = missing_total / total_cells * 100

    duplicate_pct = report["duplicates"]["count"] / rows * 100

    invalid_total = sum(v["count"] for v in report["invalid"].values())
    invalid_pct = invalid_total / total_cells * 100

    outlier_total = sum(v["count"] for v in report["outliers"].values())
    outlier_pct = outlier_total / total_cells * 100

    penalty = (
        missing_pct * WEIGHTS["missing"]
        + duplicate_pct * WEIGHTS["duplicate"]
        + invalid_pct * WEIGHTS["invalid"]
        + outlier_pct * WEIGHTS["outlier"]
    )
    score = max(0, round(100 - penalty))

    breakdown = {
        "missing_pct": round(missing_pct, 2),
        "duplicate_pct": round(duplicate_pct, 2),
        "invalid_pct": round(invalid_pct, 2),
        "outlier_pct": round(outlier_pct, 2),
    }

    issue_counts = {
        "critical": len(report["invalid"]) + (1 if report["duplicates"]["count"] > 0 else 0),
        "warning": len(report["missing"]) + len(report["outliers"]),
        "passed": max(cols - len(report["missing"]) - len(report["invalid"]) - len(report["outliers"]), 0),
    }

    return {
        "score": score,
        "label": "heuristic (project-defined, not an industry-standard metric)",
        "breakdown": breakdown,
        "issue_counts": issue_counts,
    }
