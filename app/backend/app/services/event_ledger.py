from __future__ import annotations

import json
import sqlite3
import uuid
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class LedgerEvent:
    event_id: str
    event_type: str
    captured_at: str
    actor_type: str
    target_type: str
    target_id: str | None
    payload: dict[str, Any]


class EventLedgerService:
    """Minimal local SQLite-backed event ledger.

    This is intentionally small for the first runtime slice. It records meaningful
    system/provider events without storing private document or source text.
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
                CREATE TABLE IF NOT EXISTS ledger_events (
                    event_id TEXT PRIMARY KEY,
                    event_type TEXT NOT NULL,
                    captured_at TEXT NOT NULL,
                    actor_type TEXT NOT NULL,
                    target_type TEXT NOT NULL,
                    target_id TEXT,
                    payload_json TEXT NOT NULL
                )
                """
            )
            conn.commit()

    def append(
        self,
        *,
        event_type: str,
        actor_type: str = "system",
        target_type: str = "system",
        target_id: str | None = None,
        payload: dict[str, Any] | None = None,
    ) -> LedgerEvent:
        event = LedgerEvent(
            event_id=str(uuid.uuid4()),
            event_type=event_type,
            captured_at=datetime.now(UTC).isoformat(),
            actor_type=actor_type,
            target_type=target_type,
            target_id=target_id,
            payload=payload or {},
        )
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO ledger_events (
                    event_id,
                    event_type,
                    captured_at,
                    actor_type,
                    target_type,
                    target_id,
                    payload_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    event.event_id,
                    event.event_type,
                    event.captured_at,
                    event.actor_type,
                    event.target_type,
                    event.target_id,
                    json.dumps(event.payload, sort_keys=True),
                ),
            )
            conn.commit()
        return event

    def recent(self, limit: int = 25) -> list[dict[str, Any]]:
        safe_limit = max(1, min(limit, 100))
        with self._connect() as conn:
            rows = conn.execute(
                """
                SELECT event_id, event_type, captured_at, actor_type, target_type, target_id, payload_json
                FROM ledger_events
                ORDER BY captured_at DESC
                LIMIT ?
                """,
                (safe_limit,),
            ).fetchall()
        events = []
        for row in rows:
            event = LedgerEvent(
                event_id=row[0],
                event_type=row[1],
                captured_at=row[2],
                actor_type=row[3],
                target_type=row[4],
                target_id=row[5],
                payload=json.loads(row[6]),
            )
            events.append(asdict(event))
        return events
