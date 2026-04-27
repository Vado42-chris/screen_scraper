from __future__ import annotations

import sqlite3
import uuid
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class SourceReferenceRecord:
    reference_id: str
    document_id: str
    source_id: str
    label: str
    anchor_ref: str | None
    created_at: str


class SourceReferenceService:
    """Minimal document-to-source reference persistence service.

    This service records that a source chip/reference was inserted into a document.
    It does not store raw source text in the reference row. Later slices can extend
    this into citation formatting, source excerpt anchors, metadata review, and
    rights/provenance checks.
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
                CREATE TABLE IF NOT EXISTS source_references (
                    reference_id TEXT PRIMARY KEY,
                    document_id TEXT NOT NULL,
                    source_id TEXT NOT NULL,
                    label TEXT NOT NULL,
                    anchor_ref TEXT,
                    created_at TEXT NOT NULL
                )
                """
            )
            conn.commit()

    def create(
        self,
        *,
        document_id: str,
        source_id: str,
        label: str,
        anchor_ref: str | None = None,
    ) -> SourceReferenceRecord:
        now = datetime.now(UTC).isoformat()
        reference = SourceReferenceRecord(
            reference_id=str(uuid.uuid4()),
            document_id=document_id,
            source_id=source_id,
            label=label.strip() or "@source",
            anchor_ref=anchor_ref,
            created_at=now,
        )
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO source_references (
                    reference_id,
                    document_id,
                    source_id,
                    label,
                    anchor_ref,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    reference.reference_id,
                    reference.document_id,
                    reference.source_id,
                    reference.label,
                    reference.anchor_ref,
                    reference.created_at,
                ),
            )
            conn.commit()
        return reference

    def list_for_document(self, document_id: str) -> list[dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute(
                """
                SELECT reference_id, document_id, source_id, label, anchor_ref, created_at
                FROM source_references
                WHERE document_id = ?
                ORDER BY created_at DESC
                """,
                (document_id,),
            ).fetchall()
        return [
            asdict(
                SourceReferenceRecord(
                    reference_id=row[0],
                    document_id=row[1],
                    source_id=row[2],
                    label=row[3],
                    anchor_ref=row[4],
                    created_at=row[5],
                )
            )
            for row in rows
        ]

    def to_dict(self, reference: SourceReferenceRecord) -> dict[str, Any]:
        return asdict(reference)
