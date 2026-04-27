# screen_scraper Egress Engine Spec v1

## Status

Framework-aligned product engine specification.

This spec connects the reusable xi-io egress framework to the `screen_scraper` writer/document product implementation.

## Framework references

```text
xi-io.net/docs/framework/egress-engine-standard-v1.md
xi-io.net/docs/framework/templates/product-egress-adapter-template-v1.md
docs/screen-scraper-egress-adapter-contract-v1.md
docs/export-egress-contract-v1.md
engines/egress/egress-config.yaml
engines/egress/egress-schema.json
```

## Purpose

The `screen_scraper` egress engine routes approved writer/document outputs into user-owned artifacts, local runtime records, summaries, manifests, checkpoints, and future export files.

The engine must remain product-local while conforming to the xi-io framework vocabulary.

## Product role

`screen_scraper` is a `DocumentEgressPackage` adapter.

It should not redefine framework-level export formats, document type options, event rules, or reusable UI components.

It should map its local writer/editor data into the framework package shape.

## Implemented adjacent behavior

The app already supports several egress-adjacent flows:

```text
document save
source reference insertion
section prompt insertion
AI suggestion insertion after explicit user action
checkpoint creation
checkpoint preview
checkpoint restore with confirmation
summary-only event ledger
```

These are not final artifact export yet, but they establish the same safety posture required for export egress.

## MVP egress target

The first true egress implementation should support:

```text
active document -> Markdown artifact
active document -> HTML artifact
active document -> plain text artifact
active document -> JSON DocumentEgressPackage
active document -> ZIP bundle with manifest
```

## Required services

Product-local backend services:

```text
ExportService
ExportPackageBuilder
MarkdownExportAdapter
HtmlExportAdapter
PlainTextExportAdapter
JsonExportAdapter
ZipExportAdapter
```

Later adapters:

```text
DocxExportAdapter
PdfExportAdapter
EpubExportAdapter
OdtExportAdapter
RtfExportAdapter
TexExportAdapter
FountainExportAdapter
CsvExportAdapter
YamlExportAdapter
```

## Backend route target

First route:

```text
POST /api/documents/{document_id}/exports
```

Expected request shape:

```json
{
  "format": "md",
  "profile": "Draft Review",
  "document_type": "article",
  "include_sources": true,
  "include_lexicon": false,
  "include_prompts": true,
  "include_ai_provenance": false,
  "include_media_metadata": true
}
```

Expected response shape:

```json
{
  "export_id": "uuid",
  "artifact": {
    "artifact_id": "string",
    "format": "md",
    "filename": "document-title.md",
    "content_chars": 1234
  },
  "manifest": {
    "manifest_version": 1,
    "artifact_count": 1,
    "warning_count": 0
  }
}
```

## Package builder responsibilities

`ExportPackageBuilder` should gather:

```text
DocumentRecord
editor HTML body
Markdown body or generated Markdown body
plain text body
source reference summaries
section prompt summaries
checkpoint/export snapshot summary
project metadata, when available
author metadata, when available
license metadata, when available
rights metadata, when available
lexicon terms, when available
media metadata, when available
warnings
```

## Adapter responsibilities

Each adapter receives a validated `DocumentEgressPackage` and produces one artifact or a bundle.

Adapters must not fetch unrelated runtime data directly.

Adapters must not write event ledger records directly.

`ExportService` owns orchestration and ledger events.

## Export events

Required events:

```text
export.requested
export.completed
export.failed
export.bundle_created
```

Later event:

```text
export.downloaded
```

## Event payload safety

Event payloads must be summary-only.

Allowed fields are defined in:

```text
engines/egress/egress-config.yaml
engines/egress/egress-schema.json
```

Forbidden payload classes:

```text
raw document content
raw source content
raw AI suggestion text
secret values
API keys
tokens
absolute local filesystem paths
private user directory names
raw generated media bytes
```

## Manifest requirements

Every ZIP bundle must contain:

```text
manifest.json
primary artifact
metadata summary
source reference summary, if included
lexicon summary, if included
media manifest, if included
rights/license summary
warnings
export event summary
```

Non-bundle exports should still return manifest metadata in the API response.

## UI posture

The export UI should eventually live under:

```text
File > Export
```

Until the top menu exists, a compact right-panel export card is acceptable.

The writing surface should remain primary.

Export controls must be clear but not dominant.

## Safety gates

The engine must block or require confirmation when:

```text
export format is unsupported
document type is unsupported
document is missing
rights status is unresolved for a share/publish/bundle profile
output target is unsafe
manifest is required but missing
forbidden event payload fields are present
```

## Non-goals for first implementation

Do not implement first:

```text
perfect DOCX pagination
perfect PDF typography
EPUB store compliance
advanced citation styles
cloud export
public publish
repo write/deploy export
```

## Implementation order

1. Add ExportService skeleton.
2. Add ExportPackageBuilder.
3. Add Markdown adapter.
4. Add plain text adapter.
5. Add HTML adapter.
6. Add JSON package adapter.
7. Add ZIP bundle adapter.
8. Add backend export route.
9. Add summary-only export events.
10. Add frontend export surface.
11. Add export safety tests.

## Verification requirements

Minimum tests:

```text
supported export format succeeds
unsupported export format is blocked
export.requested is emitted
export.completed is emitted
export.failed is emitted on adapter failure
bundle export includes manifest
manifest includes adapter_version
export event payload excludes forbidden fields
raw document content is not present in event payloads
```
