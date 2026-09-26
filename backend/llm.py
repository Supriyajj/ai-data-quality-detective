"""
llm.py
Single choke point for all LLM API calls. Reads LLM_PROVIDER from the
environment and dispatches to Anthropic or OpenAI. If no key is configured,
falls back to a template-based "explanation" so the whole app remains
demoable offline / without spending API credits.
"""
from __future__ import annotations
import os
from dotenv import load_dotenv

load_dotenv()

PROVIDER = os.getenv("LLM_PROVIDER", "none").lower()
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")


def _call_anthropic(system: str, user: str) -> str:
    import anthropic
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    resp = client.messages.create(
        model=ANTHROPIC_MODEL,
        max_tokens=500,
        system=system,
        messages=[{"role": "user", "content": user}],
    )
    return "".join(block.text for block in resp.content if block.type == "text")


def _call_openai(system: str, user: str) -> str:
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    resp = client.chat.completions.create(
        model=OPENAI_MODEL,
        max_tokens=500,
        messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
    )
    return resp.choices[0].message.content


def _call_groq(system: str, user: str) -> str:
    # Groq's API is OpenAI-compatible, so we reuse the openai package with a
    # different base_url - no extra dependency needed. Free tier, no card,
    # ~30 req/min / ~14,400 req/day as of writing (limits can change; check
    # console.groq.com for the current numbers).
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("GROQ_API_KEY"), base_url="https://api.groq.com/openai/v1")
    resp = client.chat.completions.create(
        model=GROQ_MODEL,
        max_tokens=500,
        messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
    )
    return resp.choices[0].message.content


def _fallback_explanation(system: str, user: str) -> str:
    """No API key configured (or the call failed) - return a clearly-labeled
    template response so the UI still demonstrates the RAG-grounded flow end
    to end. Context is truncated defensively so a large prompt (e.g. a big
    dataset summary) never turns this into an unreadable dump."""
    MAX_CONTEXT_CHARS = 500
    trimmed = user if len(user) <= MAX_CONTEXT_CHARS else user[:MAX_CONTEXT_CHARS] + "... (truncated)"
    return (
        "[Offline mode - no working LLM provider configured]\n\n"
        f"{trimmed}\n\n"
        "Set GROQ_API_KEY (or ANTHROPIC_API_KEY / OPENAI_API_KEY) in your .env "
        "file to replace this with a real generated explanation."
    )


SYSTEM_PROMPT = (
    "You are the AI Data Quality Detective, an assistant that explains data "
    "quality issues found by a pandas analysis pipeline. You are given (a) "
    "the exact statistics detected in the dataset and (b) retrieved "
    "knowledge-base passages about that issue type. Ground every claim in "
    "the provided statistics and knowledge - never invent numbers that "
    "weren't given to you. Be concise: 3-5 sentences, plus a short bulleted "
    "list of recommended actions."
)


def _dispatch(system: str, user: str) -> str:
    """Routes to the configured provider. On ANY failure - rate limit, bad
    key, provider outage, network hiccup - silently falls back to the
    template response rather than letting an error reach the user. A free
    tier's occasional 429 should degrade gracefully, never surface as a
    broken UI."""
    try:
        if PROVIDER == "anthropic" and os.getenv("ANTHROPIC_API_KEY"):
            return _call_anthropic(system, user)
        if PROVIDER == "openai" and os.getenv("OPENAI_API_KEY"):
            return _call_openai(system, user)
        if PROVIDER == "groq" and os.getenv("GROQ_API_KEY"):
            return _call_groq(system, user)
    except Exception as e:
        # Log server-side so you can see it in the terminal running uvicorn;
        # the person using the app just sees a normal (labeled) explanation.
        print(f"[llm.py] Provider '{PROVIDER}' call failed, falling back to template: {e}")
    return _fallback_explanation(system, user)


def generate_explanation(issue_description: str, retrieved_context: list[dict]) -> str:
    context_text = "\n\n".join(f"[Source: {c['source']}]\n{c['text']}" for c in retrieved_context)
    user_prompt = f"Detected issue:\n{issue_description}\n\nRelevant knowledge:\n{context_text}"
    return _dispatch(SYSTEM_PROMPT, user_prompt)


def generate_chat_reply(question: str, context_text: str) -> str:
    user_prompt = f"User question about their dataset:\n{question}\n\nContext:\n{context_text}"
    return _dispatch(SYSTEM_PROMPT, user_prompt)