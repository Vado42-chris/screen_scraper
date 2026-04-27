from __future__ import annotations

import sqlite3
import uuid
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class SourceRecord:
    source_id: str
    title: str
    source_type: str
    content: str
    created_at: str
    updated_at: str


class SourceLibraryService:
    """Minimal local source library service.

    This is the source-ingress skeleton. It stores local text/markdown/paste sources
    in ignored SQLite runtime data so source-aware UI and retrieval flows can be
    proven before embeddings/vault chunking land.
    """

    def __init__(self, sqlite_path: Path) -> None:
        self.sqlite_path = sqlite_path
        self._ensure_schema()

    def _connect(self) -> sqlite3.Connection:
        return sqlite3.connect(self.sqlite_path)

    def _ensure_schema(self) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS sources (
                    source_id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    source_type TEXT NOT NULL,
                    content TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """
            )
            conn.commit()

    def to_dict(self, source: SourceRecord) -> dict[str, Any]:
        return asdict(source)

    def create(self, title: str, content: str, source_type: str = "paste") -> SourceRecord:
        now = datetime.now(UTC).isoformat()
        source = SourceRecord(
            source_id=str(uuid.uuid4()),
            title=title.strip() or "Untitled Source",
            source_type=source_type.strip() or "paste",
            content=content,
            created_at=now,
            updated_at=now,
        )
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO sources (source_id, title, source_type, content, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    source.source_id,
                    source.title,
                    source.source_type,
                    source.content,
                    source.created_at,
                    source.updated_at,
                ),
            )
            conn.commit()
        return source

    def list(self) -> list[dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute(
                """
                SELECT source_id, title, source_type, content, created_at, updated_at
                FROM sources
                ORDER BY updated_at DESC
                """
            ).fetchall()
        return [
            {
                **asdict(
                    SourceRecord(
                        source_id=row[0],
                        title=row[1],
                        source_type=row[2],
                        content=row[3],
                        created_at=row[4],
                        updated_at=row[5],
                    )
                ),
                "snippet": self._snippet(row[3]),
            }
            for row in rows
        ]

    def get(self, source_id: str) -> SourceRecord | None:
        with self._connect() as conn:
            row = conn.execute(
                """
                SELECT source_id, title, source_type, content, created_at, updated_at
                FROM sources
                WHERE source_id = ?
                """,
                (source_id,),
            ).fetchone()
        if row is None:
            return None
        return SourceRecord(
            source_id=row[0],
            title=row[1],
            source_type=row[2],
            content=row[3],
            created_at=row[4],
            updated_at=row[5],
        )

    def search(self, query: str) -> list[dict[str, Any]]:
        normalized = query.strip().lower()
        if not normalized:
            return self.list()
        with self._connect() as conn:
            rows = conn.execute(
                """
                SELECT source_id, title, source_type, content, created_at, updated_at
                FROM sources
                WHERE lower(title) LIKE ? OR lower(content) LIKE ?
                ORDER BY updated_at DESC
                """,
                (f"%{normalized}%", f"%{normalized}%"),
            ).fetchall()
        return [
            {
                **asdict(
                    SourceRecord(
                        source_id=row[0],
                        title=row[1],
                        source_type=row[2],
                        content=row[3],
                        created_at=row[4],
                        updated_at=row[5],
                    )
                ),
                "snippet": self._snippet(row[3], normalized),
            }
            for row in rows
        ]

    def _snippet(self, content: str, query: str | None = None, length: int = 220) -> str:
        text = " ".join(content.split())
        if not text:
            return ""
        if query:
            index = text.lower().find(query)
            if index >= 0:
                start = max(0, index - 60)
                return text[start : start + length]
        return text[:length]
