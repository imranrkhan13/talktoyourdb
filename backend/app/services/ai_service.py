"""
AI Service — Multi-provider with automatic fallback
Priority: Gemini → Groq → Mistral → Cohere → OpenRouter
Each provider is tried in order; first success wins.
"""

import logging
import re
from typing import Any, Dict

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

_SQL_SYSTEM = """You are an expert SQL analyst. Convert natural language to PostgreSQL SELECT queries.

Rules:
1. Generate ONLY SELECT queries — never INSERT, UPDATE, DELETE, DROP, or any write operation.
2. Use ONLY tables and columns from the provided schema. Never invent names.
3. Return ONLY raw SQL — no markdown, no backticks, no explanation.
4. Use proper PostgreSQL syntax (ILIKE, DATE_TRUNC, ::date, NOW(), etc.).
5. Default LIMIT 100 unless the user specifies otherwise.
6. Qualify ambiguous column names with their table name."""

_EXPLAIN_SYSTEM = """Explain the following SQL query in 2-4 plain English sentences a non-technical person would understand.
- Lead with what the query returns.
- Mention key filters, groupings, or ordering.
- No SQL jargon. No restating syntax.
Return only the explanation."""

_CORRECT_SYSTEM = """You are a PostgreSQL debugger. Fix the broken SQL query using the schema and error provided.
Return ONLY the corrected raw SQL — no markdown, no explanation."""


class AIService:
    """Tries multiple LLM providers in priority order."""

    async def generate_sql(self, question: str, schema: Dict[str, Any]) -> str:
        prompt = (
            f"Database schema:\n{self._fmt_schema(schema)}\n\n"
            f"Convert this question to a PostgreSQL SELECT query:\n{question}"
        )
        return await self._call(_SQL_SYSTEM, prompt)

    async def explain_sql(self, sql: str) -> str:
        return await self._call(_EXPLAIN_SYSTEM, f"SQL:\n{sql}")

    async def correct_sql(self, sql: str, error: str, schema: Dict[str, Any]) -> str:
        prompt = (
            f"Schema:\n{self._fmt_schema(schema)}\n\n"
            f"Broken SQL:\n{sql}\n\nError:\n{error}"
        )
        return await self._call(_CORRECT_SYSTEM, prompt)

    async def _call(self, system: str, user: str) -> str:
        providers = [
            ("Gemini",     self._gemini),
            ("Groq",       self._groq),
            ("Mistral",    self._mistral),
            ("Cohere",     self._cohere),
            ("OpenRouter", self._openrouter),
        ]

        last_err = None
        async with httpx.AsyncClient(timeout=30) as client:
            for name, fn in providers:
                key = self._key(name)
                if not key:
                    logger.debug(f"{name}: no key configured, skipping")
                    continue
                try:
                    logger.info(f"Trying {name}...")
                    raw = await fn(client, key, system, user)
                    result = self._clean(raw)
                    logger.info(f"{name} succeeded")
                    return result
                except Exception as e:
                    logger.warning(f"{name} failed: {e}")
                    last_err = e

        raise RuntimeError(
            f"All AI providers failed. Last error: {last_err}\n"
            "Check that at least one API key is set in your .env file."
        )

    async def _gemini(self, c, key, system, user):
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"gemini-2.0-flash:generateContent?key={key}"
        )
        combined = f"{system}\n\n{user}"
        r = await c.post(url, json={
            "contents": [{"parts": [{"text": combined}]}],
            "generationConfig": {"temperature": 0.1, "maxOutputTokens": 500},
        })
        r.raise_for_status()
        return r.json()["candidates"][0]["content"]["parts"][0]["text"]

    async def _groq(self, c, key, system, user):
        r = await c.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {key}"},
            json={
                "model": "llama3-8b-8192",
                "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
                "temperature": 0.1, "max_tokens": 500,
            },
        )
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]

    async def _mistral(self, c, key, system, user):
        r = await c.post(
            "https://api.mistral.ai/v1/chat/completions",
            headers={"Authorization": f"Bearer {key}"},
            json={
                "model": "mistral-small-latest",
                "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
                "temperature": 0.1, "max_tokens": 500,
            },
        )
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]

    async def _cohere(self, c, key, system, user):
        r = await c.post(
            "https://api.cohere.com/v1/generate",
            headers={"Authorization": f"Bearer {key}"},
            json={
                "model": "command-light",
                "prompt": f"{system}\n\n{user}\n\nRespond with only the SQL query:",
                "max_tokens": 500, "temperature": 0.1,
            },
        )
        r.raise_for_status()
        return r.json()["generations"][0]["text"]

    async def _openrouter(self, c, key, system, user):
        r = await c.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {key}",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "AI SQL Builder",
            },
            json={
                "model": "meta-llama/llama-3.2-3b-instruct:free",
                "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
                "temperature": 0.1, "max_tokens": 500,
            },
        )
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]

    def _key(self, provider):
        return {
            "Gemini":     settings.GEMINI_API_KEY,
            "Groq":       settings.GROQ_API_KEY,
            "Mistral":    settings.MISTRAL_API_KEY,
            "Cohere":     settings.COHERE_API_KEY,
            "OpenRouter": settings.OPENROUTER_API_KEY,
        }.get(provider, "")

    @staticmethod
    def _clean(raw):
        s = raw.strip()
        s = re.sub(r"^```(?:sql)?\s*", "", s, flags=re.IGNORECASE)
        s = re.sub(r"\s*```$", "", s)
        return s.rstrip(";").strip()

    @staticmethod
    def _fmt_schema(schema):
        lines = []
        for table, meta in schema.items():
            col_defs = [
                f"  {col['name']} {col['type']}{' (PK)' if col['is_primary_key'] else ''}"
                for col in meta["columns"]
            ]
            lines.append(f"Table: {table}")
            lines.extend(col_defs)
            for fk in meta.get("foreign_keys", []):
                lines.append(f"  FK: {fk['from_column']} -> {fk['to_table']}.{fk['to_column']}")
            lines.append("")
        return "\n".join(lines)


ai_service = AIService()
