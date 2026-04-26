# Event Ledger and Snapshots v1

This app should feel like a cooperative word processor on the surface, but underneath it should behave like an event-based local system.

The event layer exists to make ingestion, analysis, writing operations, exports, errors, and rollback understandable and recoverable.

## Core principle

The document editor is the user surface. The event ledger is the system memory.

```text
User works in document/editor UI
→ app emits structured events
→ backend records append-only ledger entries
→ projections update UI state
→ snapshots preserve restorable points in time
```

## Important correction

Do not event-source every keystroke as a permanent domain event.

Keystrokes and editor micro-changes belong in:

```text
autosave buffers
editor history
local draft state
short-term undo stack
```

Permanent ledger events should record meaningful state transitions:

```text
source imported
source normalized
metadata extracted
embedding index built
document created
document version saved
AI rewrite proposed
AI patch applied
analysis completed
export generated
provider failed
snapshot created
rollback requested
rollback completed
```

This gives us auditability without making the system impossible to reason about.

## Event store role

The event store is append-only.

It records what happened, when it happened, what actor or subsystem caused it, and which project/source/document/job it affected.

The event store should not be edited to hide mistakes. Corrections should be represented as new events.

## Event categories

```text
ingress
library
analysis
lexicon
retrieval
writing
egress
ai_gateway
runtime
security
error
snapshot
rollback
```

## Event schema

Minimum event shape:

```json
{
  "event_id": "uuid",
  "event_type": "source.imported",
  "event_category": "ingress",
  "occurred_at": "2026-04-26T18:42:00Z",
  "project_id": "project_uuid_or_null",
  "actor_type": "user|system|ai|job|provider",
  "actor_id": "local_user_or_service_name",
  "target_type": "source|document|project|index|export|provider|system",
  "target_id": "uuid_or_stable_key",
  "correlation_id": "uuid_for_related_events",
  "causation_id": "prior_event_id_or_null",
  "severity": "debug|info|warning|error|critical",
  "summary": "Human-readable short description",
  "payload": {},
  "redaction": {
    "contains_secret": false,
    "contains_source_text": false,
    "contains_user_document_text": false
  }
}
```

## Correlation IDs

Every multi-step workflow should share a `correlation_id`.

Example source import chain:

```text
source.import_requested
source.fetch_started
source.fetch_completed
source.parse_started
source.parse_completed
source.normalize_started
source.normalize_completed
source.metadata_extracted
source.chunked
source.embeddings_created
source.ready
```

This lets the app show a coherent event trail instead of scattered logs.

## Logs vs ledger

The app needs both.

### Ledger

Permanent, user-visible or admin-visible history of meaningful app events.

Examples:

```text
Document version saved
Source imported
Export generated
Snapshot created
Rollback completed
```

### Logs

Lower-level diagnostics for debugging and operations.

Examples:

```text
HTTP request failed
Provider timeout
Parser exception
Filesystem permission error
Embedding worker retry
```

Logs should be structured, but not every log becomes a ledger event.

## Error logging

Errors should emit both:

```text
structured diagnostic log
user/admin-facing ledger event, when meaningful
```

Example:

```text
log: parser traceback and file path
ledger: source.parse_failed with safe summary and correlation_id
```

Do not store secrets or full private source/document text in error payloads.

## Snapshots

Snapshots are restorable points-in-time.

They are not replacements for events. They are checkpoints that make rollback and replay practical.

Snapshot types:

```text
project snapshot
document snapshot
source library snapshot
analysis index snapshot
lexicon snapshot
export snapshot
full workspace snapshot
```

## Snapshot contents

A snapshot should record:

```json
{
  "snapshot_id": "uuid",
  "snapshot_type": "project",
  "created_at": "2026-04-26T19:05:00Z",
  "project_id": "uuid",
  "label": "Before source re-index",
  "event_id_high_watermark": "last_event_id_included",
  "paths": {
    "manifest": "snapshots/project/.../manifest.json",
    "archive": "snapshots/project/.../snapshot.tar.zst"
  },
  "integrity": {
    "sha256": "..."
  }
}
```

## Rollback behavior

Rollback should never silently destroy current work.

Correct rollback flow:

```text
1. User opens event calendar/date picker.
2. User selects a snapshot or point in time.
3. App previews what would change.
4. App creates a safety snapshot of current state.
5. App restores selected state or creates a branch from it.
6. App records rollback events in the ledger.
```

Preferred default:

```text
Restore as branch / copy
```

Riskier option:

```text
Replace current state
```

The destructive path should require explicit confirmation.

## Event calendar UI

The user-facing rollback UI should feel like a calendar and timeline, not a database admin screen.

Suggested views:

```text
Calendar view: days with snapshots/events
Timeline view: ordered event stream
Project history: events for one project
Document history: versions and AI patches
Source history: import, parse, reindex, analysis
Error history: failed jobs and recoveries
```

Date picker behavior:

```text
select date
show available snapshots
show major events
show failed jobs
show exports
show document versions
preview restore options
```

## Projection/read model strategy

The UI should not query raw event streams for every screen.

Use projections/read models:

```text
current project state
document list
source library index
job queue status
snapshot calendar
event timeline
error dashboard
```

If a projection is corrupt or stale, rebuild it from the ledger and snapshots.

## Storage recommendation

Use SQLite locally for the first event store and projections.

Suggested tables:

```text
events
snapshots
jobs
errors
projections
projection_offsets
```

Store large snapshot archives and source artifacts as files in the runtime vault, with SQLite holding metadata and paths.

## Anti-monolith rule

The event ledger should not become a god object.

Feature modules emit events through a shared event service:

```text
ingress emits source events
analysis emits analysis events
writing emits document events
egress emits export events
ai_gateway emits provider/model events
runtime emits system health events
```

The event service owns persistence, correlation IDs, and projection dispatch.

## Privacy rules

Ledger entries must be useful without leaking private content.

Default event payloads should store IDs, metadata, hashes, counts, paths, and summaries.

Avoid storing:

```text
full source text
full document text
API keys
raw prompts with private source text
raw provider responses containing private text
```

When full text is needed, store it in the vault and reference it by artifact ID/path.

## MVP scope

MVP event ledger should track:

```text
app.started
vault.selected
ollama.health_checked
source.imported
source.normalized
source.indexed
document.created
document.saved
ai.requested
ai.completed
ai.failed
export.generated
snapshot.created
rollback.previewed
rollback.completed
```

The first rollback target should be document/project snapshots, not full system time travel.
