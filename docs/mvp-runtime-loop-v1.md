# MVP Runtime Loop v1

## Status

Implemented baseline map for the current writing-runtime loop.

This document records the behavior currently wired into the MVP so future slices stay aligned with the app that now exists, not just the larger product vision.

## Product spine

`screen_scraper` is a writing-first workspace with event-bound research, AI assistance, and checkpoint safety.

The interface should feel like a document editor. The backend should behave like an evidence, event, and safety engine behind that editor.

## Core runtime loop

```text
open app
check backend health
check local Ollama status
load documents
load sources
load recent events
open or create document
write in editor
optionally import sources
optionally insert source references
optionally insert section prompts
optionally request AI continuation
review AI suggestion
optionally insert AI suggestion explicitly
create checkpoints before risky work
preview checkpoints when needed
restore checkpoints only after confirmation
record safe summary events
```

## Left panel: documents and outline

### Documents

The left panel owns document selection and creation.

Implemented behavior:

- create a new document
- list existing documents
- open a document
- show last updated timestamp
- mark active document

Backend routes:

```text
GET  /api/documents
POST /api/documents
GET  /api/documents/{document_id}
PUT  /api/documents/{document_id}
```

Ledger events:

```text
document.created
document.saved
```

### Active outline

The outline is derived from editor headings, not manually maintained as a separate planning object yet.

Implemented behavior:

- extract H1/H2/H3 headings
- show heading hierarchy
- jump to heading in editor
- track current heading context for later AI/context work

Current limitation:

- outline is runtime-derived only
- no formal StoryboardService yet
- no heading-level completion or prompt-status badges yet

## Center panel: document editor

The editor is the primary surface.

Implemented behavior:

- Tiptap/ProseMirror editing surface
- title editing
- save document
- toolbar formatting controls
- source reference insertion
- section prompt insertion
- Markdown export preview
- explicit AI suggestion insertion

Important invariant:

AI output does not silently modify the document.

AI text can only enter the document through an explicit user action.

## Right panel: AI, checkpoints, sources, runtime, activity, export

The right panel is the contextual control and review surface.

It should not become a raw admin dashboard. It should expose useful system behavior only where it helps the writer work safely.

## Sources loop

Sources are pasted/imported into the local source library.

Implemented behavior:

- create source from pasted text
- list sources
- search sources
- open selected source
- preview selected source content
- insert selected source as an inline source chip in the editor

Backend routes:

```text
GET  /api/sources
POST /api/sources
GET  /api/sources/{source_id}
POST /api/source-references
```

Ledger events:

```text
source.imported
source_reference.inserted
```

Safe event payload rule:

Source event payloads may include source ID, title, type, label, and word count. They must not include raw source content.

Current limitation:

- no embeddings yet
- no source chunking yet
- no semantic retrieval yet
- no citation formatting beyond source chips yet

## Section prompt loop

Section prompts are structural writing hooks.

Implemented behavior:

- insert `SectionPromptBlock` from editor toolbar
- record prompt creation against active document
- include active heading when available
- render prompt blocks in the editor and Markdown export path

Backend route:

```text
POST /api/section-prompts
```

Ledger event:

```text
section_prompt.created
```

Safe event payload rule:

Section prompt events may include prompt ID, label, status, and active heading. They must not include raw document content.

Current limitation:

- no formal PlanningService record yet
- no prompt text editor yet
- no stale-prompt observer yet
- no AI-generated section prompt workflow yet

## AI writing-assist loop

AI assistance is provider-gated through the backend.

Implemented behavior:

- frontend checks Ollama through backend only
- user selects a local Ollama model
- user writes instruction
- user requests continuation
- backend builds prompt from document context
- backend calls OllamaProviderService
- frontend receives review-only suggestion
- user may explicitly insert suggestion into editor
- suggestion insertion is ledgered without storing generated text in the event payload

Backend routes:

```text
GET  /api/providers/ollama
POST /api/ai/continue
POST /api/ai/suggestion-inserted
```

Ledger events:

```text
ollama.health_checked
ollama.models_listed
provider.unavailable
ai.requested
ai.completed
ai.failed
ai_suggestion.inserted
```

Important invariant:

The frontend must not call Ollama directly.

All provider access goes through backend services so later model policy, provider switching, context budgeting, and local/private controls remain centralized.

Current limitation:

- context packet is still basic Markdown context
- no RetrievalService packet yet
- no source-aware retrieval yet
- no diff/patch suggestion model yet
- no accept/reject state after insertion yet

## Checkpoint and restore loop

Checkpoints are safety anchors.

Implemented behavior:

- create manual checkpoint from active editor state
- list checkpoints for active document
- preview checkpoint content on user click
- record checkpoint preview
- restore only from preview panel
- require explicit confirmation
- create pre-restore checkpoint before overwrite
- restore title/content from selected checkpoint
- refresh document, checkpoint list, and recent activity

Backend routes:

```text
GET  /api/documents/{document_id}/snapshots
POST /api/documents/{document_id}/snapshots
GET  /api/snapshots/{snapshot_id}
POST /api/snapshots/{snapshot_id}/restore-preview
POST /api/snapshots/{snapshot_id}/restore
```

Ledger events:

```text
snapshot.created
snapshot.restore_previewed
snapshot.pre_restore_checkpoint_created
snapshot.restored
```

Safety contract:

```text
preview first
explicit restore action
confirmation required
pre-restore checkpoint first
validate snapshot belongs to active document
summary-only ledger events
```

Current limitation:

- no visual diff view yet
- no date picker rollback yet
- no typed `RESTORE` confirmation yet
- no automated restore tests yet

## Event ledger loop

Recent Activity surfaces safe, friendly event summaries.

Implemented behavior:

- recent event query
- summary-first display
- no raw event payload JSON shown by default
- friendly event labels for document, source, prompt, AI, Ollama, checkpoint, preview, and restore events

Backend route:

```text
GET /api/events/recent?limit=12
```

Event display should remain user-facing and intelligible. Raw diagnostics should be hidden behind future developer/admin affordances, not placed in the writing flow by default.

## Storage posture

Current storage is local runtime SQLite.

Important rule:

Runtime data is not Git content.

The app may store document bodies, sources, and snapshots in local runtime storage. The event ledger should record only safe summary metadata.

## Privacy and safety invariants

The MVP must preserve these invariants:

- no silent AI document mutation
- no direct frontend provider calls
- no raw document content in event payloads
- no raw source content in event payloads
- no restore without preview and confirmation
- no cross-document snapshot restore
- no secrets or absolute local filesystem paths in event payloads
- no hidden background ingestion

## Current MVP capability statement

The current app can now support a basic full writing safety loop:

```text
create document
write/edit document
save document
import source
insert source chip
insert section prompt
ask local AI for continuation
review AI output
insert AI output explicitly
checkpoint document
preview checkpoint
restore checkpoint with confirmation
inspect recent activity
```

This is not yet the complete writer product, but it is now a real executable spine for the product: editor, local runtime, provider gateway, event ledger, source library, AI review, and checkpoint safety.

## Next development priorities

Recommended next slices:

1. local/CI execution verification
2. restore and checkpoint backend tests
3. AI suggestion insertion tests
4. source-reference and section-prompt tests
5. formal context-packet service
6. source chunking and semantic retrieval
7. diff/patch review model
8. richer document/heading/storyboard metadata
9. date picker rollback surface
10. import/export hardening
