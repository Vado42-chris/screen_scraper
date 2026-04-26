# Information Architecture Map: screen_scraper

## Template Metadata

- template_id: information-architecture-map-template
- template_version: 1.0.0
- template_status: screen_scraper_initial
- artifact_type: information_architecture_map
- required_for: all_projects_with_navigation_or_structured_content
- applies_to_project_types: web_app, app, research, mixed_media, writing_product

---

# 1. Artifact Metadata

- artifact_id: screen-scraper-information-architecture-map-v1
- tenant_id: local_default
- project_id: screen_scraper
- parent_id: screen-scraper-project-brief-v1
- project_name: screen_scraper
- product_area: frontend_information_architecture
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

# 2. Purpose

Define how the screen_scraper writing app organizes workspaces, documents, sources, planning objects, AI controls, settings, events, metadata, rights, media, exports, and power-user structures so users can write without being forced to operate the backend system.

The front-end IA must preserve the product truth:

```text
The user writes in a simple word processor.
The xi-io engine stack works underneath.
```

---

# 3. Source Evidence

## Tier 0 Local Evidence

- local files:
  - /mnt/data/scripts_plan.md
- old version lineage:
  - none confirmed for this repo
- screenshots/previews:
  - user screenshots of local project folders
- notes:
  - User repeatedly emphasized that the UI should remain a simple writing/cooperative word-processor surface, not a visible system dashboard.

## Tier 1 Repo Evidence

- repo files:
  - docs/planning/project-brief.md
  - docs/word-processor-requirements-v1.md
  - docs/ui-composition-contract-v1.md
  - docs/component-inventory-v1.md
  - docs/workspace-modes-v1.md
  - docs/editor-context-and-application-menu-v1.md
  - docs/active-outline-and-section-prompts-v1.md
  - docs/story-spine-and-storyboard-system-v1.md
  - docs/backend-research-integration-v1.md
  - docs/document-media-layout-and-generation-v1.md
  - docs/inserted-item-metadata-approval-v1.md
  - docs/license-and-rights-metadata-v1.md
  - docs/development-readiness-gate-v1.md
- routes/components:
  - not implemented yet

## Tier 2 Management Evidence

- workbench docs:
  - xi-io.net docs/templates/universal/information-architecture-map-template.md
  - xi-io.net docs/backend-engine-architecture-v1.md
- system maps:
  - planned in screen_scraper page-system-map.md

## Missing Evidence

- implemented routes
- final editor engine
- tested responsive UI
- first component contracts

---

# 4. Primary Navigation Model

## Global navigation groups

```text
Write
Plan
Sources
Analyze
Export
Settings
```

These are workspace modes, not separate apps.

## Local/project navigation groups

```text
Projects
Documents
Active Outline
Source Library
Story Spine
Media Library
Event Timeline
```

## Hidden/admin navigation

```text
Diagnostics
Provider Health
Event Ledger
Error Log
Engine/Bin Debug View
Developer Overlays
```

## Navigation Items

### Write

- label: Write
- route/path: /write/:projectId/:documentId
- purpose: primary writing workspace
- user need: write, revise, chat, use source-aware assistance
- required role/visibility: owner/editor
- related events/artifacts: document.saved, ai.requested, suggestion.created
- empty state: Create or open a document.

### Plan

- label: Plan
- route/path: /plan/:projectId
- purpose: story spine, storyboard, active planning cards
- user need: plan chapters, sections, scenes, beats, characters, locations, and open questions
- required role/visibility: owner/editor
- related events/artifacts: plan.node_created, plan.card_updated, section_prompt.generated
- empty state: Create a spine or generate one from a premise.

### Sources

- label: Sources
- route/path: /sources/:projectId
- purpose: source library and source reader
- user need: import, read, search, verify, and attach sources
- required role/visibility: owner/editor
- related events/artifacts: source.imported, source.normalized, source_reference.inserted
- empty state: Add a local text, markdown, or transcript source.

### Analyze

- label: Analyze
- route/path: /analyze/:projectId
- purpose: optional power workspace for document/source/planning diagnostics
- user need: find structure, stale prompts, missing evidence, continuity issues, export blockers
- required role/visibility: owner/editor, advanced view
- related events/artifacts: analysis.completed, observer.warning_created
- empty state: Select a document, source, or planning scope to analyze.

### Export

- label: Export
- route/path: /export/:projectId
- purpose: preview and generate output artifacts
- user need: export markdown first, later docx/pdf/html/screenplay styles
- required role/visibility: owner/editor
- related events/artifacts: export.generated, document.health_checked
- empty state: Select a document to export.

### Settings

- label: Settings
- route/path: /settings/:projectId
- purpose: vault, AI providers, model manager, rights/license, privacy, accessibility, project config
- user need: configure once, check health, control boundaries
- required role/visibility: owner
- related events/artifacts: vault.selected, ollama.health_checked, rights.project_profile_updated
- empty state: Complete project setup.

---

# 5. Content/Object Taxonomy

```text
Project
Document
DocumentVersion
HeadingAnchor
SectionPrompt
StoryNode
SourceArtifact
SourceReference
MediaAsset
ImagePlacement
InsertedItemMetadata
ProjectRightsProfile
Snapshot
Event
ObserverWarning
ProviderConfig
ExportJob
```

Relationships:

```text
Project owns Documents, Sources, Media, StoryNodes, RightsProfile, Snapshots.
Document contains HeadingAnchors, SectionPrompts, SourceReferences, ImagePlacements.
StoryNode may link to HeadingAnchor and SectionPrompt.
MediaAsset may have ImagePlacements and InsertedItemMetadata.
Event references affected objects by ID.
ObserverWarning references objects, bins, and events.
```

Tags/bins:

```text
#tags, @references, [[blocks]], 42-bin map, observer flags
```

Visibility:

```text
project metadata: project
private content: local_only or vault_only
repo-safe docs: public
runtime data: local_only
```

---

# 6. User Mental Model

Expected user language:

```text
project, document, source, outline, prompt, card, chapter, scene, image, export, settings
```

Preferred labels:

```text
Write, Plan, Sources, Analyze, Export, Settings
```

Concepts to avoid in default UI:

```text
42-bin system
engine pipeline
raw event payloads
schema validation
provider adapter internals
```

Progressive disclosure needs:

```text
Default: writing and source context
Guided: prompts, evidence, metadata review
Expert: bins, events, provider diagnostics, engine states
```

Novice/guided/expert differences:

```text
Novice sees plain statuses.
Guided sees explainable warnings and review panels.
Expert sees raw-ish IDs, bins, event links, diagnostics.
```

---

# 7. Search + Filter Model

Searchable objects:

```text
documents
headings
section prompts
sources
source excerpts
story cards
characters
locations
media assets
metadata items
events
observer warnings
```

Searchable fields:

```text
title
summary
heading text
prompt text
tags
aliases
source metadata
event type
status
```

Filters:

```text
workspace
object type
status
tag
reference
source type
rights status
metadata status
observer flag
created/updated date
```

Saved views:

```text
Sections missing prompts
Stale prompts
Unknown rights
Missing alt text
Unresolved comments
Ready to export
AI provider issues
```

#tag behavior:

```text
Typing # opens tag autocomplete.
Tags map to lexicon entries and bins.
Tags are optional, never mandatory.
```

@reference behavior:

```text
Typing @ opens entity/source/document/reference autocomplete.
References can point to characters, locations, sources, documents, media, or custom objects.
```

Unresolved reference behavior:

```text
Create placeholder reference and observer warning.
Allow user to resolve later.
```

---

# 8. Event / Calendar / Timeline Placement

Events shown in IA:

```text
source.imported
document.saved
ai.requested
metadata.generated
metadata.approved
rights.project_profile_updated
snapshot.created
export.generated
observer.warning_created
```

Calendar entry points:

```text
Tools > Event Timeline
File > Restore From Snapshot
Status Bar > Last Action
Settings > Diagnostics
```

Timeline entry points:

```text
Document history
Project history
Source history
Error log
Snapshot restore
```

Ledger/audit visibility:

```text
Default UI shows friendly history.
Expert mode shows event IDs and correlation IDs.
Private payloads remain vault/database only.
```

---

# 9. Settings + Preferences Placement

Global/project settings:

```text
Project Settings
Vault Settings
AI Settings
Model Manager
Provider Settings
Privacy and Routing Rules
Rights & License
Accessibility Preferences
Keyboard Shortcuts
Developer Diagnostics
```

Provider/API settings:

```text
Ollama Local
future OpenAI-compatible endpoint
future Gemini/Anthropic/Groq/OpenRouter/Hugging Face/custom endpoint
future local image providers
```

Privacy/storage settings:

```text
vault root
runtime root
backup path
cloud usage policy
source policy defaults
metadata review defaults
```

---

# 10. Data + Qual/Quant IA

Qualitative data surfaces:

```text
section prompts
source summaries
metadata descriptions
AI explanations
observer warning copy
story card notes
comments
```

Quantitative data surfaces:

```text
word count
source count
comment count
suggestion count
metadata confidence
source relevance score
provider latency
job progress
snapshot count
```

Dashboards:

```text
No default dashboard.
Analyze workspace and Diagnostics surfaces are optional/power-user.
```

Raw data access rules:

```text
Raw event payloads hidden by default.
Vault-only content never exposed in repo-safe docs.
```

---

# 11. Safety / Privacy / RBAC IA

Restricted areas:

```text
Provider Settings
Vault Settings
Rights Migration
Rollback Replace Current State
Developer Diagnostics
```

Vault/local-only areas:

```text
source text
document content
generated media
exports
snapshots
embeddings
runtime logs
```

Role-based hidden/disabled states:

```text
owner only for provider and rights settings initially
future editor/viewer states later
```

Safety copy requirements:

```text
Cloud mode sends selected content outside local machine.
Rollback replacement may overwrite current state.
Unknown rights need review before publication.
Images need alt text before accessible export.
```

---

# 12. AI / Ibal Placement

Where Ibal appears:

```text
ChatComposer
Right Context Panel
Analyze workspace
Settings diagnostics
Event Timeline explanations
Metadata Review Panel
Export readiness checks
```

What Ibal can explain:

```text
why a source was suggested
why metadata needs review
why a prompt is stale
why export is blocked
why provider health failed
```

What Ibal can generate:

```text
section prompts
source summaries
metadata proposals
alt text/captions
rewrite suggestions
story spine draft
image prompts
```

What requires confirmation:

```text
document patches
metadata approval
rights/license changes
rollback
cloud provider use
image generation using private context
```

What is blocked:

```text
silent overwrite
silent cloud fallback
silent rights migration
silent secret exposure
```

---

# 13. Validation Rules

This IA map is valid when:

```text
every major object has a home
every major user task has a navigation path
labels match user mental models
settings are findable
event/calendar/timeline paths are represented
RBAC/visibility boundaries are represented
search/filter behaviors are defined
```

---

# 14. Freshness Rules

Mark stale when:

```text
routes change
major object types are added/removed
navigation labels change
settings move
workspace modes change
search/filter behavior changes
component contracts change
```

---

# 15. Acceptance Criteria

```text
A user can locate writing, planning, sources, analysis, export, and settings.
A power user can locate timeline, diagnostics, metadata review, and provider controls.
Default UI does not expose engine complexity.
Every major object has a clear IA home.
```

---

# 16. Open Gaps

```text
implemented routes
component contracts
final editor engine
visual design tokens
responsive behavior tests
formal user journey map
```
