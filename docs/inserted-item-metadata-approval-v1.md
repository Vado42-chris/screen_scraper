# Inserted Item Metadata and Approval v1

This document defines the rule that inserted items should receive generated metadata where applicable, but the user remains the approving authority.

## Core correction

The app should not expect users to manually fill out metadata for every inserted item.

The app should:

```text
analyze inserted item
propose useful metadata
display metadata for review
allow user approval/edit/rejection
store approved metadata
record event ledger entries
```

## Product principle

Automation should remove clerical work without removing user control.

```text
System proposes.
User approves.
Ledger records.
Document remains trustworthy.
```

## Scope

This applies to any inserted or generated object where metadata improves search, accessibility, export, retrieval, provenance, or reuse.

Examples:

```text
images
AI-generated images
source references
citation chips
section prompt blocks
story blocks
glossary terms
lexicon entries
characters
locations
tables
figures
captions
uploaded files
large pasted content
export artifacts
```

## Metadata status model

Each inserted item should support metadata status.

```text
none
proposed
approved
edited
rejected
stale
needs_review
```

## Generic InsertedItemMetadata shape

```json
{
  "id": "uuid",
  "item_id": "uuid",
  "item_type": "image|source_reference|block|prompt|table|figure|term|character|location|export",
  "document_id": "uuid_or_null",
  "project_id": "uuid",
  "status": "proposed|approved|edited|rejected|stale|needs_review",
  "title": "Short human-readable title",
  "description": "Plain-language description",
  "alt_text": "Image alt text or accessible equivalent where applicable",
  "caption": "Optional display caption",
  "tags": [],
  "entities": [],
  "source_links": [],
  "rights_status": "unknown|user_owned|generated|licensed|public_domain|restricted",
  "confidence": {
    "overall": 0.78,
    "fields": {}
  },
  "generated_by": {
    "engine": "metadata.analyzer",
    "provider": "local|cloud|manual",
    "model": "model_name_or_null",
    "created_at": "timestamp"
  },
  "review": {
    "reviewed_by": "user_or_system_id",
    "reviewed_at": "timestamp_or_null",
    "notes": ""
  }
}
```

## Image metadata generation

When an image is inserted, pasted, uploaded, or generated, the app should propose:

```text
title
description
alt text
caption
subject tags
characters/locations if detected from project context
style tags
rights status
source/generation provenance
figure label
suggested placement role
```

The user should see a small review surface:

```text
Generated metadata ready
[Review] [Approve] [Edit] [Dismiss]
```

## Alt text rule

The app may generate alt text suggestions, but the user must be able to edit them.

Export readiness checks should flag meaningful images with missing or unapproved alt text.

## Source reference metadata generation

When a source reference or citation chip is inserted, propose:

```text
source title
source type
excerpt summary
relevance reason
reliability label
rights/provenance note
linked tags
citation style hint
```

## Glossary and lexicon metadata generation

When a term is inserted or detected, propose:

```text
canonical term
aliases
definition
project-specific meaning
category/bin links
first occurrence
related terms
should appear in glossary: yes/no
```

## Block metadata generation

When a reusable block is inserted or saved, propose:

```text
block title
scale: paragraph|scene|chapter|section|custom
function
summary
tags
source/context links
reuse guidance
variants
```

## Large paste metadata generation

When a large paste is converted to a source artifact, propose:

```text
title
source type
summary
language
structure estimate
possible rights status
source reliability
suggested tags
suggested chunking mode
```

## Review surfaces

Metadata review should appear progressively.

### Quick approval chip

For low-risk fields:

```text
Alt text suggested. Approve?
```

### Side panel

For richer inserted items:

```text
metadata fields
confidence indicators
source/provenance
approve/edit/reject buttons
```

### Batch review

For multiple items:

```text
Review 12 generated metadata suggestions
Approve all high-confidence
Edit selected
Reject selected
```

## Confidence and trust

Low-confidence metadata should never be silently approved.

Suggested behavior:

```text
high confidence: show approve chip
medium confidence: show review panel
low confidence: mark needs review
unknown rights: mark needs review
```

## User control rules

The app must not:

```text
silently approve generated metadata
hide generated provenance
force metadata into exported output without export setting
claim uncertain metadata as fact
send private inserted content to cloud metadata models without permission
```

The app should:

```text
make review easy
pre-fill fields
explain why metadata was suggested
allow user edits
remember user preferences
record approved metadata in ledger
```

## Privacy rules

Metadata generation should run locally by default.

Cloud metadata analysis requires:

```text
cloud mode enabled
item policy allows cloud use
user permission or configured approval
privacy boundary shown
```

## Ledger events

```text
metadata.generated
metadata.review_requested
metadata.approved
metadata.edited
metadata.rejected
metadata.marked_stale
metadata.regenerated
metadata.exported
metadata.review_skipped
```

## Menu additions

### Tools

```text
Review Generated Metadata
Approve High-Confidence Metadata
Find Items Missing Metadata
Find Items Missing Alt Text
Regenerate Metadata For Selection
```

### Insert

```text
Insert With Metadata Review
```

### AI

```text
Generate Metadata For Selection
Generate Alt Text
Generate Caption
Generate Glossary Definition
Explain Metadata Suggestion
```

## UI components

```text
MetadataReviewChip
MetadataReviewPanel
MetadataConfidenceBadge
AltTextSuggestionPanel
CaptionSuggestionPanel
BatchMetadataReview
MetadataHistoryDrawer
```

## MVP scope

Build in this order:

```text
1. Image insertion creates MediaAsset and ImagePlacement.
2. App proposes title, alt text, caption, and tags for image.
3. User can approve/edit/reject metadata.
4. Approved metadata is stored and visible in image details.
5. Markdown export uses approved alt text and caption.
6. Missing alt text appears in export readiness check.
7. Ledger records metadata.generated and metadata.approved/edited/rejected.
8. Batch review for inserted images and source references.
```

## Product truth

Metadata is part of the document system, not a form the user must fill out manually.

The app earns trust by doing the boring work, showing its work, and letting the user approve the result.
