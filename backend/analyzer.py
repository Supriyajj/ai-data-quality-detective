"""
analyzer.py
Pandas-based data quality checks. This is the "ground truth" layer -
every number the AI later explains comes from here, never from the LLM.
"""
from __future__ import annotations
import pandas as pd
import numpy as np
from typing import Any


def load_csv(path_or_buffer) -> pd.DataFrame:
    df = pd.read_csv(path_or_buffer)
    return df


def missing_values(df: pd.DataFrame) -> dict[str, int]:
    counts = df.isnull().sum()
    return {col: int(n) for col, n in counts.items() if n > 0}


def duplicate_rows(df: pd.DataFrame) -> dict[str, Any]:
    dup_mask = df.duplicated(keep="first")
    return {
        "count": int(dup_mask.sum()),
        "row_indices": df.index[dup_mask].tolist()[:50],  # cap for payload size
    }


def data_type_summary(df: pd.DataFrame) -> dict[str, str]:
    return {col: str(dtype) for col, dtype in df.dtypes.items()}


# ---- Simple, extensible invalid-value rules -------------------------------
# Rule = (column_name_substring, predicate on the numeric series) -> mask
def _rule_negative(series: pd.Series) -> pd.Series:
    return series < 0


def _rule_percentage_over_100(series: pd.Series) -> pd.Series:
    return series > 100


INVALID_VALUE_RULES: dict[str, list[tuple[str, Any]]] = {
    "age": [("negative", _rule_negative), ("unrealistic (>120)", lambda s: s > 120)],
    "salary": [("negative", _rule_negative)],
    "price": [("negative", _rule_negative)],
    "percentage": [("negative", _rule_negative), ("over 100", _rule_percentage_over_100)],
    "pct": [("negative", _rule_negative), ("over 100", _rule_percentage_over_100)],
}


def invalid_values(df: pd.DataFrame) -> dict[str, dict]:
    results: dict[str, dict] = {}
    for col in df.columns:
        if not pd.api.types.is_numeric_dtype(df[col]):
            continue
        col_lower = col.lower()
        matched_rules = []
        for key, rules in INVALID_VALUE_RULES.items():
            if key in col_lower:
                matched_rules.extend(rules)
        if not matched_rules:
            continue
        series = df[col]
        flagged_mask = pd.Series(False, index=df.index)
        reasons: list[str] = []
        for label, predicate in matched_rules:
            mask = predicate(series.dropna())
            mask = mask.reindex(df.index, fill_value=False)
            if mask.any():
                reasons.append(label)
            flagged_mask |= mask
        if flagged_mask.any():
            results[col] = {
                "count": int(flagged_mask.sum()),
                "reasons": reasons,
                "examples": series[flagged_mask].head(5).tolist(),
                "row_indices": df.index[flagged_mask].tolist()[:50],
            }
    return results


def outliers_iqr(df: pd.DataFrame) -> dict[str, dict]:
    results: dict[str, dict] = {}
    for col in df.select_dtypes(include=[np.number]).columns:
        series = df[col].dropna()
        if series.empty:
            continue
        q1, q3 = series.quantile(0.25), series.quantile(0.75)
        iqr = q3 - q1
        if iqr == 0:
            continue
        lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
        mask = (df[col] < lower) | (df[col] > upper)
        mask = mask.fillna(False)
        if mask.any():
            results[col] = {
                "count": int(mask.sum()),
                "lower_bound": float(lower),
                "upper_bound": float(upper),
                "examples": df[col][mask].head(5).tolist(),
                "row_indices": df.index[mask].tolist()[:50],
            }
    return results


def analyze_column(df: pd.DataFrame, column: str) -> dict[str, Any]:
    """Tool used by the agent: deep-dive stats on a single column."""
    if column not in df.columns:
        return {"error": f"Column '{column}' not found."}
    series = df[column]
    out: dict[str, Any] = {
        "column": column,
        "dtype": str(series.dtype),
        "missing_count": int(series.isnull().sum()),
        "unique_count": int(series.nunique(dropna=True)),
    }
    if pd.api.types.is_numeric_dtype(series):
        desc = series.describe()
        out.update({
            "mean": float(desc.get("mean", float("nan"))),
            "median": float(series.median()) if not series.dropna().empty else None,
            "min": float(desc.get("min", float("nan"))),
            "max": float(desc.get("max", float("nan"))),
            "std": float(desc.get("std", float("nan"))),
        })
    else:
        top = series.value_counts().head(3)
        out["top_values"] = {str(k): int(v) for k, v in top.items()}
    return out


def full_report(df: pd.DataFrame) -> dict[str, Any]:
    """Runs all five checks and returns one combined structure."""
    return {
        "shape": {"rows": int(df.shape[0]), "columns": int(df.shape[1])},
        "dtypes": data_type_summary(df),
        "missing": missing_values(df),
        "duplicates": duplicate_rows(df),
        "invalid": invalid_values(df),
        "outliers": outliers_iqr(df),
    }
