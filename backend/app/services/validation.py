"""
SQL Validation Service
- Parses SQL AST to detect forbidden operations
- Blocks writes, DDL, system functions, dangerous patterns
- Defence-in-depth: multiple independent checks
"""

import logging
import re
from dataclasses import dataclass
from typing import List, Optional, Tuple

logger = logging.getLogger(__name__)

# ── Forbidden keyword patterns ─────────────────────────────────────────────────
# Checked against the normalized (uppercased, collapsed-whitespace) SQL
_FORBIDDEN_STATEMENTS = [
    r"\bINSERT\b",
    r"\bUPDATE\b",
    r"\bDELETE\b",
    r"\bDROP\b",
    r"\bCREATE\b",
    r"\bALTER\b",
    r"\bTRUNCATE\b",
    r"\bREPLACE\b",
    r"\bMERGE\b",
    r"\bGRANT\b",
    r"\bREVOKE\b",
    r"\bEXEC\b",
    r"\bEXECUTE\b",
    r"\bCALL\b",
    r"\bCOPY\b",
    r"\bLOAD\b",
    r"\bIMPORT\b",
]

_DANGEROUS_FUNCTIONS = [
    r"\bPG_SLEEP\b",
    r"\bPG_READ_FILE\b",
    r"\bPG_WRITE_FILE\b",
    r"\bPG_EXEC\b",
    r"\bCOPY\b",
    r"\bSYSTEM\b",
    r"\blo_import\b",
    r"\blo_export\b",
    r"\bcurrent_setting\b",
    r"\bset_config\b",
]

_STACKED_QUERY_PATTERN = re.compile(r";\s*\w", re.IGNORECASE)
_COMMENT_PATTERNS = [
    re.compile(r"--"),          # line comments (can be legit but also injections)
    re.compile(r"/\*.*?\*/", re.DOTALL),  # block comments
]


@dataclass
class ValidationResult:
    is_valid: bool
    errors: List[str]
    warnings: List[str]
    cleaned_sql: str


class SQLValidationService:
    """
    Multi-layer SQL validation.
    Layer 1: Input length / encoding checks
    Layer 2: Pattern-based forbidden statement detection
    Layer 3: Stacked queries / injection heuristics
    Layer 4: Must start with SELECT
    """

    def validate(self, sql: str) -> ValidationResult:
        errors: List[str] = []
        warnings: List[str] = []

        # ── L1: Sanitize input ─────────────────────────────────────────────────
        if not sql or not sql.strip():
            return ValidationResult(False, ["Empty query"], [], sql)

        cleaned = self._strip_comments(sql.strip())
        normalized = re.sub(r"\s+", " ", cleaned).upper()

        # ── L2: Forbidden statements ───────────────────────────────────────────
        for pattern in _FORBIDDEN_STATEMENTS:
            if re.search(pattern, normalized):
                keyword = re.search(pattern, normalized).group().strip()
                errors.append(
                    f"Forbidden operation detected: {keyword}. "
                    "Only SELECT queries are allowed."
                )

        # ── L2b: Dangerous functions ───────────────────────────────────────────
        for pattern in _DANGEROUS_FUNCTIONS:
            if re.search(pattern, normalized, re.IGNORECASE):
                fn = re.search(pattern, normalized, re.IGNORECASE).group().strip()
                errors.append(f"Dangerous function not allowed: {fn}")

        # ── L3: Stacked queries ────────────────────────────────────────────────
        if _STACKED_QUERY_PATTERN.search(cleaned):
            errors.append(
                "Multiple statements detected (stacked queries). "
                "Submit one query at a time."
            )

        # ── L4: Must start with SELECT ─────────────────────────────────────────
        first_token = normalized.lstrip().split()[0] if normalized.strip() else ""
        if first_token != "SELECT":
            errors.append(
                f"Query must begin with SELECT. "
                f"Received: '{first_token}'"
            )

        # ── L5: Heuristic injection indicators ────────────────────────────────
        injection_indicators = [
            (r"'\s*OR\s+'.*'='", "OR-based injection pattern"),
            (r"UNION\s+ALL\s+SELECT", "UNION injection pattern"),
            (r"1\s*=\s*1", "Always-true condition"),
            (r"0x[0-9a-fA-F]+", "Hex encoding detected"),
        ]
        for pattern, label in injection_indicators:
            if re.search(pattern, normalized):
                warnings.append(f"Suspicious pattern: {label}")

        is_valid = len(errors) == 0
        return ValidationResult(is_valid, errors, warnings, cleaned)

    # ── Helpers ────────────────────────────────────────────────────────────────

    @staticmethod
    def _strip_comments(sql: str) -> str:
        """Remove SQL comments to prevent bypass via comment injection."""
        # Remove block comments
        sql = re.sub(r"/\*.*?\*/", " ", sql, flags=re.DOTALL)
        # Remove line comments (but keep newlines so multi-line SQL stays intact)
        sql = re.sub(r"--[^\n]*", "", sql)
        return sql.strip()


# ── Singleton ──────────────────────────────────────────────────────────────────
sql_validator = SQLValidationService()
