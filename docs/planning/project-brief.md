# Project Brief: screen_scraper

## Template Metadata

- template_id: project-brief-template
- template_version: 1.0.0
- template_status: screen_scraper_initial
- artifact_type: project_brief
- required_for: every_xi_io_product

---

# 1. Artifact Metadata

- artifact_id: screen-scraper-project-brief-v1
- tenant_id: local_default
- project_id: screen_scraper
- parent_id:
- owner: Chris Hallberg
- author_actor: ChatGPT
- reviewer: Chris Hallberg
- created_at: 2026-04-26
- updated_at: 2026-04-26
- freshness_state: fresh
- validation_state: not_checked
- visibility: public
- repo_sync_state: synced

---

# 2. Product Summary

`screen_scraper` is a local-first, source-aware, AI-assisted cooperative word processor.

The current repository name is functional and temporary. The product is not merely a scraper, chat wrapper, or default rich-text editor. It is a new writing home that combines:

```text
word processor
AI co-writer
private source library
active outline
story spine / storyboard
semantic lexicon
media insertion and generation
metadata approval
rights/license tracking
event ledger
snapshots and rollback
xi-io engine compliance
```

The user-facing product should feel calm and familiar: a document canvas, an AI chat/composer, source/reference support, planning views, and export.

The backend should behave like an event-bound xi-io system:

```text
Ingress → Binning → Analysis → Lexicon → Egress
```

with the 43/Ibal observer layer watching freshness, unresolved state, contradictions, safety boundaries, export blockers, and drift.

---

# 3. Product North Star

> A cooperative word processor where the AI writes with you using a private source library you control.

The system succeeds if users feel like they are writing, while the backend quietly captures, classifies, analyzes, normalizes, and safely outputs their work.

---

# 4. Source Evidence

## Tier 0: Local / User-Provided Evidence

- Local dev root:

```text
/media/chrishallberg/Storage 22/999_Work/003_Projects/014_scripts
```

- Local test root:

```text
/media/chrishallberg/Storage 11/01_Work/14_scripts
```

- Shared Ollama model storage target:

```text
/media/chrishallberg/Storage 11/01_Work/14_scripts/_shared_ai/ollama-models
```

- Uploaded source conversation:

```text
scripts_plan.md
```

The source conversation defines the original product feel as a chat-first writing interface, with document artifacts, a library drawer, export gate, hidden infrastructure, optional semantic syntax, `#tags`, `@references`, and `[[blocks]]` for deeper structure.

## Tier 1: Repo Evidence

Key planning contracts already in `screen_scraper`:

```text
README.md
.gitignore
docs/security-and-secrets-policy.md
docs/local-environment-aries.md
docs/ui-composition-contract-v1.md
docs/component-inventory-v1.md
docs/workspace-modes-v1.md
docs/word-processor-requirements-v1.md
docs/backend-research-integration-v1.md
docs/event-ledger-and-snapshots-v1.md
docs/story-spine-and-storyboard-system-v1.md
docs/active-outline-and-section-prompts-v1.md
docs/editor-context-and-application-menu-v1.md
docs/document-media-layout-and-generation-v1.md
docs/inserted-item-metadata-approval-v1.md
docs/license-and-rights-metadata-v1.md
docs/backend-engine-alignment-v1.md
docs/xi-io-dependency-readiness-assessment-v1.md
docs/events/event-model.yaml
docs/data/document-data-model.yaml
docs/providers/ollama-provider-spec.md
```

Engine artifacts:

```text
engines/ingress/ingress-config.yaml
engines/ingress/ingress-schema.json
engines/binning/binning-engine-spec.md
engines/binning/bin-map-42.yaml
engines/binning/binning-schema.json
engines/analysis/analysis-rules.yaml
engines/analysis/analysis-schema.json
engines/lexicon/lexicon.yaml
engines/lexicon/lexicon-schema.json
engines/egress/egress-config.yaml
engines/egress/egress-schema.json
engines/observer/observer-engine-spec.md
engines/observer/observer-rules.yaml
engines/observer/ibal-context-schema.json
```

## Tier 2: Management Plane Evidence

`xi-io.net` provides the governance and template authority:

```text
xi-io.net docs/backend-engine-architecture-v1.md
xi-io.net docs/reusable-engine-shortfalls-v1.md
xi-io.net docs/templates/universal/project-brief-template.md
xi-io.net docs/templates/universal/product-requirements-template.md
xi-io.net docs/templates/universal/component-contract-template.md
xi-io.net docs/templates/universal/data-model-template.yaml
xi-io.net docs/templates/universal/event-model-template.yaml
xi-io.net docs/templates/universal/api-provider-spec-template.yaml
```

Decision already recorded:

```text
xi-io.net is mature enough to govern screen_scraper.
xi-io.net is not yet mature enough to replace screen_scraper's local backend implementation.
```

---

# 5. Target Users

## Primary User

A writer/researcher who wants to create long-form documents with AI support while keeping sources, notes, metadata, rights, and drafts under local control.

## Secondary Users

```text
fiction writers
screenwriters
TTRPG writers
researchers
comic creators
worldbuilders
technical/documentation writers
users who want local-first AI writing assistance
```

## Power Users

Users who want semantic control through:

```text
#tags
@references
[[blocks]]
[[prompt:section]]
[[image:prompt]]
source libraries
custom lexicons
story spine views
metadata review
rights tracking
engine/event inspection
```

---

# 6. Core User Journeys

## Journey 1: Start a Project

```text
1. User creates a project.
2. User chooses a vault location.
3. User sets author/rights/license defaults.
4. User selects local AI mode, defaulting to Ollama.
5. App creates initial project state, ledger event, and optional snapshot.
```

## Journey 2: Write with AI

```text
1. User opens document.
2. User writes normally.
3. Chat/composer is aware of cursor, selection, heading, section prompt, and active sources.
4. User asks for help.
5. AI proposes text as suggestion/patch/comment, not silent overwrite.
6. User accepts, edits, rejects, or saves as block.
7. Ledger records meaningful actions.
```

## Journey 3: Build a Spine First

```text
1. User creates chapters, sections, scenes, beats, or custom story nodes.
2. App displays them in Plan workspace and active outline.
3. User links characters, locations, sources, prompts, and open questions.
4. User drafts section-by-section from cards/prompts.
5. App keeps document and spine connected without destructive silent sync.
```

## Journey 4: Import Sources

```text
1. User imports text, markdown, transcript, or large paste.
2. Ingress captures raw source by vault reference.
3. Binning classifies source type and related domains.
4. Analysis extracts structure, metadata, summary, source quality, and retrieval chunks.
5. Lexicon maps aliases/entities/tags.
6. Source appears in the Source Library and can support writing.
```

## Journey 5: Insert / Generate Media

```text
1. User places cursor.
2. User inserts or generates image.
3. Image is stored as MediaAsset in vault.
4. Placement is anchored in document.
5. App proposes title, caption, alt text, tags, rights metadata, and provenance.
6. User approves/edits/rejects metadata.
7. Export uses approved metadata.
```

## Journey 6: Export

```text
1. User opens Export workspace.
2. App checks unresolved comments, unaccepted suggestions, stale prompts, missing alt text, unknown rights, and broken references.
3. User chooses export format.
4. Egress generates approved output.
5. Ledger records export.
```

---

# 7. Product Requirements Summary

## Word Processor Core

Required MVP:

```text
document create/open/save
autosave
undo/redo
basic rich text
headings H1-H3
lists
block quotes
links
word count
find
outline
basic comments
source reference chips
AI suggestion previews
Markdown export
snapshot on major save
ledger events
```

## AI Chat / Composer

Required MVP:

```text
cursor-aware context
selection-aware actions
section-aware prompts
source-aware retrieval context
AI suggestions as reviewable patches
Ollama local provider
no direct UI calls to provider
```

## Source Library

Required MVP:

```text
local file import
large paste import
markdown/text normalization
source metadata proposal
source search/read
source reference insertion
retrieval-ready chunking, minimal
```

## Active Outline

Required MVP:

```text
generate outline from H1/H2/H3
jump to heading
store section prompt per H1
show prompt status
generate prompt from heading/project context
use prompt to draft section as suggestion
```

## Story Spine / Plan Workspace

Required MVP:

```text
spine view
storyboard cards linked to headings/document sections
characters and locations fields
status and notes
AI generate spine from premise
AI expand card into draft suggestion
```

## Media / Metadata / Rights

Required MVP:

```text
insert image from file at cursor
store in vault
stable placement anchor
caption and alt text fields
generate metadata proposal
user approval/edit/reject
rights profile inheritance
Markdown image export
missing alt text warning
```

## Event Ledger / Snapshots

Required MVP:

```text
append-only meaningful events
correlation IDs
snapshots for document/project
restore as branch/copy by default
calendar/timeline projection later
```

---

# 8. Non-Functional Requirements

## Local-First

Private documents, sources, media, models, embeddings, caches, and runtime data must live outside the repo and outside public webroots.

## Privacy

Cloud AI is opt-in. Local Ollama is default. Private source/document text must not be sent to cloud providers without explicit user permission and source policy allowance.

## Accessibility

Editor and UI must support:

```text
keyboard operation
visible focus
screen reader labels
semantic headings
text scaling
high contrast
reduced motion
alt text support
accessible comments/review panels
```

## Reliability

Manual writing must continue if AI is unavailable.

## Recoverability

Use layered recovery:

```text
editor undo/redo
autosave
document versions
snapshots
event ledger
rollback preview
```

## Repo Safety

No secrets, vaults, models, source libraries, embeddings, logs, private media, or runtime data in Git.

---

# 9. Engine Alignment

## Ingress

Captures:

```text
user input
document events
source imports
media imports
provider health
metadata proposals
planning changes
exports
```

## Binning

Classifies into initial 42-bin map, including writing, source, metadata, rights, media, AI, export, runtime, and open question domains.

## Analysis

Interprets structure, source relevance, metadata confidence, rights uncertainty, media issues, story continuity, export readiness, and runtime/provider health.

## Lexicon

Normalizes:

```text
#tags
@references
[[blocks]]
section prompts
image prompts
characters
locations
glossary terms
license labels
commands
```

## Egress

Routes approved outputs:

```text
document patches
metadata updates
rights changes
media insertions
exports
snapshots
UI updates
future repo actions
```

## Observer / Ibal

Flags:

```text
stale prompts
missing provenance
unknown rights
missing alt text
unapproved metadata
unresolved comments
provider failures
cloud permission required
export blockers
repo safety warnings
freshness drift
```

---

# 10. UX Direction

Default UI should feel simple:

```text
Write
Plan
Sources
Analyze
Export
Settings
```

Primary writing surface:

```text
Top menu
Left active outline/source/library rail
Primary document canvas
Right context/evidence/planning panel
Bottom chat/composer
Status bar
```

The product should not expose backend complexity by default. Power tools remain discoverable through menus, command palette, semantic markup view, and advanced panels.

---

# 11. Technical Direction

Initial implementation target:

```text
React + Vite frontend
FastAPI backend
SQLite local database
local vault filesystem
Ollama provider adapter
xi-io compliant engine artifacts
```

Likely editor candidates still need evaluation:

```text
ProseMirror / Tiptap
Lexical
Slate / Plate
other mature editor stack
```

No final editor engine decision has been made yet.

---

# 12. Risks

```text
choosing editor library too early
building chat sidebar disconnected from document context
overexposing backend bins/tags to normal users
underbuilding word processor basics
allowing runtime data into repo
making xi-io compliance decorative instead of structural
scope creep before MVP slice is working
```

---

# 13. Acceptance Criteria

This project brief is valid when:

```text
product purpose is clear
source evidence is listed
local/test topology is acknowledged
xi-io engine alignment is explicit
MVP product areas are named
privacy/repo boundaries are explicit
implementation direction is possible without guessing the product identity
```

---

# 14. Open Gaps

```text
final editor engine evaluation
source library data model split-out
media generation job data model
export job model
command/action registry contract
first PRD: word processor core
implementation scaffold
local dev scripts
smoke tests
```
