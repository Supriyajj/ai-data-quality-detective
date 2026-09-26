"""
agent.py
A deliberately small tool-using agent: exactly two tools, as specified in
the project plan. The agent's "reasoning" is a lightweight intent router
(keyword + heuristic based) that decides which tool(s) a user's chat message
needs, calls them, then asks the LLM to compose the final answer grounded in
the tool outputs. This avoids pulling in a full agent framework for a
two-tool job while keeping the same conceptual shape (tools + LLM
composition) you'd get from one.
"""
from __future__ import annotations
import re
import pandas as pd

from . import analyzer
from . import rag as rag_module
from . import llm


TOOLS = {
    "analyze_column": "Get statistics (mean, median, min, max, missing count, "
                       "outlier count) for one column of the dataset.",
    "search_quality_knowledge": "Search the data-quality knowledge base for "
                                 "explanations of a concept (missing values, "
                                 "duplicates, outliers, invalid values, type issues).",
}


def _find_mentioned_column(question: str, df: pd.DataFrame) -> str | None:
    q_lower = question.lower()
    for col in df.columns:
        if col.lower() in q_lower:
            return col
    return None


def _looks_like_stats_question(question: str) -> bool:
    return bool(re.search(r"\b(mean|average|median|min|max|highest|lowest|how many|missing|duplicate|outlier)\b",
                           question.lower()))


def _compact_report_summary(report: dict) -> str:
    """A short, human-readable summary of the report - NOT the raw dict.
    The raw report (used previously) includes every flagged row index and
    is both wasteful as LLM context and, in offline mode, gets echoed
    straight back into the visible chat reply, which looked like a debug
    dump rather than an answer."""
    missing_total = sum(report["missing"].values())
    invalid_total = sum(v["count"] for v in report["invalid"].values())
    outlier_total = sum(v["count"] for v in report["outliers"].values())
    return (
        f"Dataset: {report['shape']['rows']} rows, {report['shape']['columns']} columns. "
        f"Missing values: {missing_total} (in columns: {', '.join(report['missing']) or 'none'}). "
        f"Duplicate rows: {report['duplicates']['count']}. "
        f"Invalid values: {invalid_total} (in columns: {', '.join(report['invalid']) or 'none'}). "
        f"Outliers: {outlier_total} (in columns: {', '.join(report['outliers']) or 'none'})."
    )


def run_agent(question: str, df: pd.DataFrame, report: dict) -> dict:
    """Returns {'answer': str, 'tool_calls': [...]} so the frontend can show
    which tools the agent decided to use - useful for the portfolio 'proof
    of agentic behaviour' angle."""
    tool_calls: list[dict] = []
    context_parts: list[str] = []

    column = _find_mentioned_column(question, df)
    if column and _looks_like_stats_question(question):
        result = analyzer.analyze_column(df, column)
        tool_calls.append({"tool": "analyze_column", "input": column, "output": result})
        context_parts.append(f"analyze_column('{column}') -> {result}")

    # Always consult the knowledge base too - cheap, and grounds conceptual
    # questions ("why is this a problem?") even when no column is named.
    retrieved = rag_module.knowledge_base.retrieve(question, k=2)
    if retrieved:
        tool_calls.append({"tool": "search_quality_knowledge", "input": question, "output": retrieved})
        context_parts.append(
            "search_quality_knowledge(...) ->\n" +
            "\n".join(f"[{r['source']}] {r['text']}" for r in retrieved)
        )

    # Ground the reply in the dataset's real numbers - compact form only.
    context_parts.append(_compact_report_summary(report))

    answer = llm.generate_chat_reply(question, "\n\n".join(context_parts))
    return {"answer": answer, "tool_calls": tool_calls}