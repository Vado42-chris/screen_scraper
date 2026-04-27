from __future__ import annotations

import sqlite3
import uuid
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class SnapshotRecord:
    snapshot_id: str
    document_id: str
    title: str
    content: str
    note: str
    created_at: str


class SnapshotService:
    """Minimal document snapshot persistence service.

    Snapshots are local runtime records, not Git artifacts. The ledger should only
    receive summary metadata, never raw document content.
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
                CREATE TABLE IF NOT EXISTS document_snapshots (
                    snapshot_id TEXT PRIMARY KEY,
                    document_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    note TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
                """
            )
            conn.commit()

    def create(
        self,
        *,
        document_id: str,
        title: str,
        content: str,
        note: str = "Manual checkpoint",
    ) -> SnapshotRecord:
        snapshot = SnapshotRecord(
            snapshot_id=str(uuid.uuid4()),
            document_id=document_id,
            title=title.strip() or "Untitled Document",
            content=content,
            note=note.strip() or "Manual checkpoint",
            created_at=datetime.now(UTC).isoformat(),
        )
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO document_snapshots (
                    snapshot_id,
                    document_id,
                    title,
                    content,
                    note,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    snapshot.snapshot_id,
                    snapshot.document_id,
                    snapshot.title,
                    snapshot.content,
                    snapshot.note,
                    snapshot.created_at,
                ),
            )
            conn.commit()
        return snapshot

    def list_for_document(self, document_id: str) -> list[dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute(
                """
                SELECT snapshot_id, document_id, title, content, note, created_at
                FROM document_snapshots
                WHERE document_id = ?
                ORDER BY created_at DESC
                """,
                (document_id,),
            ).fetchall()
        return [self.to_summary(self._row_to_record(row)) for row in rows]

    def get(self, snapshot_id: str) -> SnapshotRecord | None:
        with self._connect() as conn:
            row = conn.execute(
                """
                SELECT snapshot_id, document_id, title, content, note, created_at
                FROM document_snapshots
                WHERE snapshot_id = ?
                """,
                (snapshot_id,),
            ).fetchone()
        if row is None:
            return None
        return self._row_to_record(row)

    def to_dict(self, snapshot: SnapshotRecord) -> dict[str, Any]:
        return asdict(snapshot)

    def to_summary(self, snapshot: SnapshotRecord) -> dict[str, Any]:
        return {
            "snapshot_id": snapshot.snapshot_id,
            "document_id": snapshot.document_id,
            "title": snapshot.title,
            "note": snapshot.note,
            "created_at": snapshot.created_at,
            "content_chars": len(snapshot.content),
        }

    def _row_to_record(self, row: tuple[Any, ...]) -> SnapshotRecord:
        return SnapshotRecord(
            snapshot_id=row[0],
            document_id=row[1],
            title=row[2],
            content=row[3],
            note=row[4],
            created_at=row[5],
        )
