# Refactor Work Index v1

## Status

Active project index for systematic refactor and implementation passes.

This index exists so frontend modularity, export/egress work, evidence-engine planning, and future editor improvements do not fail silently or drift from the approved plan.

## Working principles

```text
one bounded pass at a time
no hidden behavior changes during refactor passes
no new feature work inside no-behavior-change refactor slices
peer review after each pass
record commits and caveats
prefer framework-aligned product adapters over one-off product logic
protect the writer-facing editor from backend/system complexity
```

## Active architectural rules

```text
The editor stays simple and writer-facing.
The framework owns reusable standards.
screen_scraper owns product-specific adapters and implementation.
main.tsx must not keep accumulating product logic.
Event payloads must remain summary-only.
Export artifact content may be returned to the user, but not stored in event payloads.
Bins are weighted evidence states, not folders.
Fire is attention-worthy signal, not confirmed truth.
```

## Current completed work

### Framework and product egress alignment

| Pass | Status | Commit(s) | Notes |
|---|---|---|---|
| xi-io framework egress standard | completed | recorded in xi-io.net | Framework owns white-label egress/export structure. |
| xi-io product egress adapter template | completed | recorded in xi-io.net | Reusable product adapter template exists. |
| screen_scraper egress adapter contract | completed | dc667ca | Product adapter references framework standard/template. |
| screen_scraper egress config reconciliation | completed | 1b134e1 | Local config aligned to framework vocabulary. |
| screen_scraper egress schema reconciliation | completed | 352d2c | Schema aligned to framework action classes and package fields. |
| screen_scraper egress engine spec | completed | 47191ee | Product bridge from framework standard to implementation. |

### Backend export implementation

| Pass | Status | Commit(s) | Notes |
|---|---|---|---|
| ExportService skeleton | completed | 2a066e6 | Added ExportService, ExportPackageBuilder, md/json adapters. |
| Document export API route | completed | 0e8cc94 | Added POST /api/documents/{document_id}/exports. |
| HTML/TXT adapters | completed | 30aeca3 | Added standalone HTML and plain text exports. |
| ZIP bundle adapter | completed | c08a49f | Added ZIP bundle with manifest.json and document artifacts. |

### Frontend export work

| Pass | Status | Commit(s) | Notes |
|---|---|---|---|
| Reusable ExportPanel component | completed | b1cdfa5 | Component supports md/html/txt/json/zip route calls. |
| ExportPanel styling | completed | 54964da | CSS module added for export panel. |
| ExportPanel mounting | pending | none | Waiting until frontend modularity pass reduces main.tsx risk. |

### Frontend modularity work

| Pass | Status | Commit(s) | Notes |
|---|---|---|---|
| FE-MOD1 create shared types | completed | 1a152d1 | Added app/types.ts. main.tsx not cut over yet. |
| FE-MOD1 create API client | completed | 44d1e0c | Added app/apiClient.ts. main.tsx not cut over yet. |
| FE-MOD1 create event labels | completed | 0f2d37a | Added app/eventLabels.ts. main.tsx not cut over yet. |
| FE-MOD1B cut main.tsx to shared modules | blocked/pending | none | Requires full non-truncated main.tsx access. |
| FE-MOD2 extract read-only panels | pending | none | ActivityPanel, RuntimePanel, MarkdownPreviewPanel. |
| FE-MOD3 extract interactive panels | pending | none | Documents, Outline, AI, Checkpoints, Sources. |
| FE-MOD4 mount ExportPanel | pending | none | Wire export panel after right panel is modular. |

### Bounded Radial Evidence planning

| Pass | Status | Commit(s) | Notes |
|---|---|---|---|
| screen_scraper BREE adapter plan | completed | 50e0516 | Documentation/adaptor mapping only. No runtime implementation. |
| xi-io framework BREE standard | pending | none | Should be added to xi-io.net before runtime implementation. |

## Current blockers

```text
main.tsx is too large for safe full-file replacement through truncated connector response.
No local/CI execution has been performed in this environment.
Frontend export panel is componentized but not mounted.
Export tests are not implemented.
Restore/export safety tests are not implemented.
```

## Immediate next passes

### PASS FE-MOD1B, cut main.tsx to shared modules

Goal:

```text
Replace local duplicated types/helpers/event labels with imports from app/types.ts, app/apiClient.ts, and app/eventLabels.ts.
```

Safety requirement:

```text
Only perform when full main.tsx source is available.
No layout change.
No behavior change.
No new feature wiring.
```

### PASS FE-MOD2, extract read-only panels

Goal:

```text
ActivityPanel
RuntimePanel
MarkdownPreviewPanel
```

Safety requirement:

```text
Props-only components.
No state movement beyond display props.
No editor remount risk.
```

### PASS FE-MOD3, extract interactive panels

Goal:

```text
DocumentsPanel
OutlinePanel
AiSuggestionPanel
CheckpointPanel
SourcesPanel
```

Safety requirement:

```text
Extract one panel per pass.
Keep callbacks owned by App until state boundaries are proven.
```

### PASS FE-MOD4, mount ExportPanel

Goal:

```text
Add ExportPanel to the right panel.
Pass activeDocument?.document_id ?? null.
Call refreshStatus after export completion.
```

## Validation checklist for each future pass

```text
Did the pass stay within scope?
Did it avoid adding unrelated features?
Did it preserve writer-facing simplicity?
Did it preserve summary-only ledger behavior?
Did it avoid exposing backend machinery in default UI?
Did it update this index?
Were commits recorded?
Were caveats recorded?
```

## Last updated

2026-04-30
