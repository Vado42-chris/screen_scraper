# Snapshot Restore Safety Contract v1

## Status

Locked baseline for first restore implementation.

## Purpose

The checkpoint system exists to protect writers from accidental loss, failed AI insertions, destructive edits, and confusing state changes. Restore must therefore be treated as a safety-critical write operation, not as a simple UI convenience.

This contract defines the minimum rules required before any snapshot can overwrite an active document.

## Core invariant

A snapshot restore must never happen silently.

The user must preview the checkpoint first, then explicitly request restore, then confirm the destructive write after the app creates a fresh pre-restore checkpoint of the current document state.

## Required restore flow

1. User opens a document.
2. User creates or selects an existing checkpoint.
3. User previews the checkpoint.
4. App records `snapshot.restore_previewed`.
5. UI displays the checkpoint content in a read-only preview panel.
6. User clicks an explicit `Restore This Checkpoint` action.
7. App creates a new pre-restore checkpoint from the current document state.
8. App displays a confirmation step that clearly states the current editor content will be replaced.
9. User confirms restore.
10. Backend validates that the snapshot belongs to the active document.
11. Backend restores the document title/content from the snapshot.
12. Backend records `snapshot.restored`.
13. UI reloads the restored document and refreshes Recent Activity.

## Forbidden restore behavior

The app must not:

- restore from a snapshot without previewing it first
- restore from a snapshot belonging to another document
- restore without creating a pre-restore checkpoint
- restore from the event ledger alone
- store raw document content in event payloads
- silently replace editor content after clicking a checkpoint
- make AI-triggered restore decisions without a user action
- hide the restore event from Recent Activity

## Backend requirements

### Endpoint

The restore endpoint should be explicit:

```text
POST /api/snapshots/{snapshot_id}/restore
```

### Request body

```json
{
  "document_id": "active document id",
  "pre_restore_title": "current editor title",
  "pre_restore_content": "current editor content",
  "confirmation": "RESTORE"
}
```

### Validation

The backend must validate:

- snapshot exists
- target document exists
- snapshot.document_id equals request.document_id
- confirmation equals `RESTORE`
- pre-restore checkpoint can be created before overwrite

### Events

The backend must emit two summary-only events:

```text
snapshot.pre_restore_checkpoint_created
snapshot.restored
```

### Safe event payload fields

Allowed payload fields:

```text
snapshot_id
pre_restore_snapshot_id
document_id
title
note
content_chars
restored_content_chars
```

Forbidden payload fields:

```text
raw document content
raw snapshot content
raw AI suggestion text
source content
secrets
absolute local filesystem paths
```

## Frontend requirements

The frontend must show:

- selected checkpoint note
- selected checkpoint timestamp
- read-only checkpoint preview
- warning that current document content will be replaced
- explicit restore button
- confirmation step before restore
- success/failure toast
- refreshed editor content after restore
- refreshed checkpoint list
- refreshed Recent Activity

## UI copy baseline

Preview state:

```text
Preview only. The current document has not been changed.
```

Restore action:

```text
Restore This Checkpoint
```

Confirmation warning:

```text
This will replace the current document with the selected checkpoint. A new pre-restore checkpoint will be created first so this action can be reversed later.
```

Confirmation control:

```text
Confirm Restore
```

Success message:

```text
Checkpoint restored. A pre-restore checkpoint was created first.
```

## Restore is not rollback yet

This contract implements manual snapshot restore only. It does not yet implement:

- visual diff review
- date picker rollback
- multi-event replay
- branch comparison
- automatic AI rollback
- cross-document snapshot copy

Those remain future slices.

## Peer review notes

This contract intentionally makes restore slower than preview. That is correct. Preview is safe and exploratory. Restore is destructive and must require a stronger confirmation path.
