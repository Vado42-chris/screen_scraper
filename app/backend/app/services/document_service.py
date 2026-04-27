from __future__ import annotations

import sqlite3
import uuid
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class DocumentRecord:
    document_id: str
    title: str
    content: str
    created_at: str
    updated_at: str


class DocumentService:
    """Minimal local document persistence service.

    This is a scaffold service, not the final editor model. It stores plain document
    content in the ignored local SQLite runtime database so the create/open/save
    loop can exist before the Tiptap/ProseMirror adapter lands.
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
                CREATE TABLE IF NOT EXISTS documents (
                    document_id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """
            )
            conn.commit()

    def create(self, *, title: str = "Untitled Document", content: str = "") -> DocumentRecord:
        now = datetime.now(UTC).isoformat()
        document = DocumentRecord(
            document_id=str(uuid.uuid4()),
            title=title.strip() or "Untitled Document",
            content=content,
            created_at=now,
            updated_at=now,
        )
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO documents (document_id, title, content, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    document.document_id,
                    document.title,
                    document.content,
                    document.created_at,
                    document.updated_at,
                ),
            )
            conn.commit()
        return document

    def list(self) -> list[dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute(
                """
                SELECT document_id, title, created_at, updated_at
                FROM documents
                ORDER BY updated_at DESC
                """
            ).fetchall()
        return [
            {
                "document_id": row[0],
                "title": row[1],
                "created_at": row[2],
                "updated_at": row[3],
            }
            for row in rows
        ]

    def get(self, document_id: str) -> DocumentRecord | None:
        with self._connect() as conn:
            row = conn.execute(
                """
                SELECT document_id, title, content, created_at, updated_at
                FROM documents
                WHERE document_id = ?
                """,
                (document_id,),
            ).fetchone()
        if row is None:
            return None
        return DocumentRecord(
            document_id=row[0],
            title=row[1],
            content=row[2],
            created_at=row[3],
            updated_at=row[4],
        )

    def update(self, *, document_id: str, title: str, content: str) -> DocumentRecord | None:
        existing = self.get(document_id)
        if existing is None:
            return None
        updated = DocumentRecord(
            document_id=document_id,
            title=title.strip() or "Untitled Document",
            content=content,
            created_at=existing.created_at,
            updated_at=datetime.now(UTC).isoformat(),
        )
        with self._connect() as conn:
            conn.execute(
                """
                UPDATE documents
                SET title = ?, content = ?, updated_at = ?
                WHERE document_id = ?
                """,
                (updated.title, updated.content, updated.updated_at, updated.document_id),
            )
            conn.commit()
        return updated

    @staticmethod
    def to_dict(document: DocumentRecord) -> dict[str, Any]:
        return asdict(document)
