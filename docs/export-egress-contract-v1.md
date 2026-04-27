# Export and Egress Contract v1

## Status

Planning baseline for final artifact export.

This document closes the current gap between the app's ingress/source-library planning and the final writer artifact egress layer.

## Purpose

`screen_scraper` must not become a document trap.

Writers need to safely export finished work, review packages, metadata, source references, lexicons, and project archives in common formats without losing ownership of their work.

The egress layer should be treated as a first-class engine, not a toolbar afterthought.

## Core invariant

The app must maintain a canonical internal document representation, then export outward through explicit format adapters.

No export format should become the app's source of truth.

## Current implemented state

The current MVP supports:

```text
editor HTML persistence
Markdown preview/export path
source reference chips
section prompt blocks
AI suggestion insertion
checkpoint snapshots
restore safety
summary-only event ledger
```

It does not yet implement final artifact export beyond the Markdown preview surface.

## Canonical egress model

Every export should be generated from an `ExportPackage` built from the active document and optional project context.

```text
DocumentRecord
SourceReference records/events
SectionPrompt blocks
Project metadata
License metadata
Author metadata
Lexicon metadata
Figure/media metadata
Checkpoint/export snapshot metadata
```

The export adapter receives an `ExportPackage` and produces one or more files.

## ExportPackage fields

Minimum package fields:

```text
export_id
document_id
document_title
document_body_canonical
document_body_html
document_body_markdown
created_at
author
project_title
license_status
rights_status
source_references
lexicon_terms
figures
metadata
export_profile
format
adapter_version
```

## Supported export phases

### Phase 1, MVP-safe text exports

These are the first formats to implement because they are deterministic and low-risk.

```text
.md       Markdown
.html     standalone HTML
.txt      plain text
.json     structured document/export package
.zip      export bundle containing document + manifest + metadata
```

### Phase 2, writer-facing final artifacts

These are required for real-world writer workflows.

```text
.docx     Microsoft Word / Google Docs / LibreOffice compatible handoff
.pdf      fixed-layout reading/review artifact
.epub     ebook publishing artifact
```

### Phase 3, extended publishing/workflow formats

These should be added after the core export engine is stable.

```text
.odt      LibreOffice/OpenDocument handoff
.rtf      broad compatibility fallback
.tex      LaTeX-oriented academic/technical export
.fountain screenplay/plain-text script writing format
.csv      lexicon/source/metadata table export
.yaml     project metadata/config export
```

## Baseline format roles

| Format | Role | Priority | Notes |
|---|---:|---:|---|
| `.md` | portable source/readme-style export | MVP | best first export target |
| `.html` | browser-readable styled export | MVP | useful for review and preview |
| `.txt` | universal fallback | MVP | strips rich structure intentionally |
| `.json` | structured machine-readable package | MVP | supports future re-import and audits |
| `.zip` | full project/export bundle | MVP+ | should include manifest |
| `.docx` | professional writer handoff | Required | must preserve headings, images, tables, footnotes later |
| `.pdf` | fixed review/final read artifact | Required | should be generated from controlled HTML/layout profile |
| `.epub` | ebook/publishing artifact | Required | chapter/nav metadata matters |
| `.odt` | LibreOffice handoff | Later | useful for open document workflows |
| `.rtf` | fallback rich text | Later | lower fidelity but broadly readable |
| `.tex` | academic/technical route | Later | not an MVP blocker |
| `.fountain` | screenplay/script route | Later | useful if writing modes expand |
| `.csv` | metadata tables | Later | source/lexicon/rights reports |
| `.yaml` | project config/metadata | Later | useful for xi-io project portability |

## Export profiles

Exports should be driven by named profiles, not one-off buttons.

Minimum profiles:

```text
Draft Review
Clean Manuscript
Submission Manuscript
Web Preview
Ebook Draft
Source Package
Archive Package
Metadata/Lexicon Report
```

Each profile should define:

```text
included sections
included metadata
citation style
image handling
page/layout settings
license footer behavior
source appendix behavior
lexicon appendix behavior
AI/provenance disclosure behavior
```

## Source and citation egress

Source chips must eventually become structured export references.

Phase 1 behavior:

```text
render source chip label visibly
include source reference summary in JSON/ZIP manifest
```

Phase 2 behavior:

```text
support citation style profiles
support source appendix
support bibliography-like source list
support unresolved-source warnings before export
```

## Lexicon egress

The lexicon should be exportable independently and as an appendix.

Required future outputs:

```text
lexicon appendix in .md/.html/.docx/.pdf/.epub
lexicon.json
lexicon.csv
term usage report
unresolved term report
```

## Media and figure egress

Inserted images and generated media must export with metadata.

Each figure/media item should carry:

```text
title
description
alt text
caption
subject tags
style tags
characters/locations if detected from project context
rights status
source/generation provenance
figure label
suggested placement role
date created
author
license status
```

Export adapters should support:

```text
inline images
image folder in ZIP bundles
figure manifest
alt text preservation
caption preservation
rights/provenance report
```

## Event ledger requirements

Export operations must be event-bound.

Required events:

```text
export.requested
export.completed
export.failed
export.bundle_created
export.downloaded
```

Allowed event payload fields:

```text
export_id
document_id
format
profile
adapter_version
artifact_id
artifact_count
content_chars
source_reference_count
lexicon_term_count
figure_count
ok
message
```

Forbidden event payload fields:

```text
raw document content
raw source content
raw AI suggestion text
secret values
absolute local filesystem paths
private user directory names
```

## Export manifest

Every ZIP/bundle export should include:

```text
manifest.json
document metadata
export profile
format adapter versions
created_at
app version
source reference summary
lexicon summary
figure/media summary
license/rights summary
warnings
```

## UI requirements

Export should live under a first-class menu/surface:

```text
File > Export
```

The export dialog should provide:

```text
format selector
export profile selector
include sources toggle
include lexicon toggle
include comments/prompts toggle
include AI provenance toggle
include image metadata toggle
preview warnings
export button
open exported file/location affordance
```

For the MVP, the right panel can expose a simple export card, but long term this belongs in `File > Export` with a modal or dedicated page.

## Backend service boundary

Add an `ExportService` that owns export package creation and adapter dispatch.

Suggested service boundaries:

```text
ExportService
ExportPackageBuilder
MarkdownExportAdapter
HtmlExportAdapter
PlainTextExportAdapter
JsonExportAdapter
ZipExportAdapter
DocxExportAdapter
PdfExportAdapter
EpubExportAdapter
```

The frontend should not assemble final export files itself, except for temporary preview-only Markdown display.

## Framework alignment

The export layer should map cleanly to the wider xi-io framework vocabulary:

```text
Ingress = what enters the system
Analysis = what the system learns/derives
Lexicon = controlled terms, tags, references, and semantic handles
Egress = what leaves the system as user-owned artifacts
Ledger = summary record of what happened
Posture = privacy/rights/export policy controlling what is allowed out
```

This app should implement egress locally first, then later expose compatible management hooks for xi-io.net or the broader framework control plane.

## Initial implementation order

Recommended next slices:

1. Add `ExportService` skeleton.
2. Add backend `POST /api/documents/{document_id}/exports` route.
3. Add Markdown export file generation.
4. Add JSON export package generation.
5. Add ZIP export bundle.
6. Add export event logging.
7. Add frontend File > Export surface.
8. Add HTML export.
9. Add DOCX export.
10. Add PDF export.
11. Add EPUB export.

## MVP acceptance criteria

The MVP export layer is minimally acceptable when:

```text
user can export active document as Markdown
user can export active document as HTML
user can export active document as plain text
user can export a JSON package with metadata
export events are ledgered safely
export payloads do not leak raw content into events
exports include manifest metadata
```

## Non-goals for first implementation

Do not start with:

```text
perfect DOCX pagination
perfect PDF typography
EPUB store compliance
complex citation styles
full visual diff export
collaborative cloud export
```

Those matter later. The first goal is a reliable, local, user-owned egress spine.
