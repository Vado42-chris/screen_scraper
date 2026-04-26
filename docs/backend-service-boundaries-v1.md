# Backend Service Boundaries v1

## Status

This document defines the first backend service boundary map for `screen_scraper`.

It exists to keep implementation aligned with the xi-io engine model while still allowing `screen_scraper` to own its MVP runtime locally.

---

# 1. Core Rule

Backend services are product-specific implementation services.

They must plug into the xi-io engine model rather than replacing it.

```text
Ingress → Binning → Analysis → Lexicon → Egress
          ↑                         ↓
          └────── 43/Ibal Observer ─┘
```

The app services below should emit events, consume events, respect approval gates, and preserve local/vault/privacy boundaries.

---

# 2. Product Principle

The user sees a simple writing interface.

The backend remains service-oriented, event-bound, and xi-io compliant.

This matches the source vision: users should feel like they are writing with assistance, while the deeper source, tag, bin, block, and analysis systems operate quietly underneath. fileciteturn107file0

---

# 3. Source Evidence

## Tier 0 Local Evidence

- local files:
  - /mnt/data/scripts_plan.md
- notes:
  - Uploaded source material emphasizes chat-first writing, live document panel, minimal artifact library, export gate, hidden backend structure, optional tags/references/blocks.

## Tier 1 Repo Evidence

- repo files:
  - docs/backend-engine-alignment-v1.md
  - docs/events/event-model.yaml
  - docs/data/document-data-model.yaml
  - docs/providers/ollama-provider-spec.md
  - docs/command-and-action-registry-v1.md
  - docs/development-readiness-gate-v1.md
  - engines/ingress/ingress-config.yaml
  - engines/binning/bin-map-42.yaml
  - engines/analysis/analysis-rules.yaml
  - engines/lexicon/lexicon.yaml
  - engines/egress/egress-config.yaml
  - engines/observer/observer-rules.yaml

## Tier 2 Management Evidence

- xi-io.net source:
  - backend engine architecture
  - reusable engine templates
  - component/data/event/provider template style
- decision:
  - `screen_scraper` implements local compliant services now and can later be managed by xi-io.net.

## Missing Evidence

- actual backend implementation
- final persistence library
- migration system
- final editor engine

---

# 4. Runtime Boundary

Initial backend runtime:

```text
FastAPI backend
SQLite local database
local vault filesystem
Ollama provider adapter
local event ledger
```

The frontend must call backend services through defined API routes/actions.

The frontend must not:

```text
call Ollama directly
write vault files directly
write SQLite directly
bypass command/action registry for meaningful actions
bypass event ledger for meaningful state changes
```

---

# 5. Service Map

## DocumentService

Purpose:

```text
create, load, save, version, and patch documents
manage editor-state persistence references
preserve cursor/heading/linkable anchors
```

Owns:

```text
Document
DocumentVersion
HeadingAnchor
SourceReference placement hooks
ImagePlacement hooks
```

Consumes:

```text
file.new_document
file.save_document
ai patch approval
insert.heading
insert.source_reference
insert.image_from_file
```

Emits:

```text
document.created
document.saved
document.version_saved
heading.created
source_reference.inserted
suggestion.accepted
```

Xi-io engine touchpoints:

```text
Ingress captures document/editor events.
Binning classifies document events.
Analysis can evaluate document structure/readiness.
Lexicon normalizes inline tags/refs/blocks.
Egress applies approved patches and exports.
Observer flags stale prompts, unresolved comments, export blockers.
```

Safety:

```text
AI patches require user approval.
Document content stays local/database/vault.
No private document text in repo-safe logs.
```

---

## SourceLibraryService

Purpose:

```text
import, store, list, search, preview, and attach sources
manage source metadata/provenance/rights flags
```

Owns:

```text
SourceArtifact, planned
SourceReference
Source metadata refs
```

Consumes:

```text
sources.add_source
sources.attach_to_document
sources.find_for_current_section
large paste import
local file import
```

Emits:

```text
source.imported
source.normalized
source.attached_to_document
source_reference.inserted
source.metadata_updated
```

Xi-io engine touchpoints:

```text
Ingress captures imports.
Binning classifies source type and domain.
Analysis summarizes/relevance-scores/source-health checks.
Lexicon maps aliases/entities/tags.
Egress exposes source matches and references.
Observer flags missing provenance or unknown rights.
```

Safety:

```text
Raw source text stored in vault/database only.
Source excerpts returned by policy-aware safe preview.
Cloud processing requires explicit policy.
```

---

## RetrievalService

Purpose:

```text
chunk, index, search, retrieve, and context-pack sources/documents for AI use
```

Owns:

```text
chunk metadata
embedding refs or search index refs
retrieval result objects
```

Consumes:

```text
source.imported
sources.find_for_current_section
ai.requested
```

Emits:

```text
retrieval.performed
retrieval.failed
analysis.completed, when coupled with analysis
```

Xi-io engine touchpoints:

```text
Analysis evaluates source relevance.
Lexicon normalizes query terms and aliases.
Observer flags stale indexes or missing source refs.
```

Safety:

```text
Embeddings and indexes are runtime/vault data, not Git data.
Context packing must respect privacy/cloud routing rules.
```

---

## AIGatewayService

Purpose:

```text
route all AI requests through one backend gateway
select provider/model role
build context packets
call Ollama/local provider first
return reviewable outputs
```

Owns:

```text
AI request records
provider routing decisions
context budget checks
model role mapping
```

Consumes:

```text
ai.continue_from_cursor
ai.rewrite_selection
ai.generate_section_prompt
metadata.regenerate
sources.find_for_current_section, when AI-assisted
```

Emits:

```text
ai.requested
ai.completed
ai.failed
suggestion.created
provider.context_too_large
```

Xi-io engine touchpoints:

```text
Ingress captures AI request.
Analysis can evaluate output confidence/relevance.
Egress routes suggestion patches to review surfaces.
Observer flags provider unavailable/context too large/cloud permission required.
```

Safety:

```text
Frontend never calls providers directly.
Cloud use requires approval/policy.
Document changes return as suggestions/patches, not silent edits.
```

---

## ProviderService

Purpose:

```text
manage provider status, Ollama health, model list, provider configs, model roles
```

Owns:

```text
ProviderConfig
ProviderStatus
ModelInfo
ModelRoleMapping
```

Consumes:

```text
ai.check_ollama_status
ai.list_ollama_models
settings.provider_updated
```

Emits:

```text
ollama.health_checked
ollama.models_listed
provider.unavailable
provider.model_missing
```

Xi-io engine touchpoints:

```text
Ingress captures provider health events.
Binning classifies AI gateway/runtime health.
Observer flags provider failures.
Egress updates status UI.
```

Safety:

```text
Secrets never committed.
Local endpoints and model paths local-only where needed.
Provider configs use example files for repo-safe defaults.
```

---

## PlanningService

Purpose:

```text
manage active outline prompts, story spine/storyboard nodes, section planning state
```

Owns:

```text
SectionPrompt
StoryNode
HeadingAnchor links
```

Consumes:

```text
plan.generate_prompt_for_heading
plan.create_story_node_from_heading
outline events
```

Emits:

```text
section_prompt.created
section_prompt.generated
section_prompt.marked_stale
plan.node_created
plan.card_updated
```

Xi-io engine touchpoints:

```text
Analysis detects prompt staleness and continuity gaps.
Lexicon maps user block/tag/reference language.
Observer flags stale/missing prompts and open questions.
```

Safety:

```text
AI-generated prompts require review/edit path.
No automatic destructive document restructuring in MVP.
```

---

## MediaService

Purpose:

```text
store, insert, place, resize, caption, and manage uploaded/generated media assets
```

Owns:

```text
MediaAsset
ImagePlacement
media file refs
```

Consumes:

```text
insert.image_from_file
future image generation result
clipboard/drag-drop media imports
```

Emits:

```text
image.uploaded
image.inserted
image.moved
image.resized
image.wrapped
metadata.generated
```

Xi-io engine touchpoints:

```text
Ingress captures media import/generation.
Analysis proposes metadata/alt/caption and layout warnings.
Egress inserts placement into document.
Observer flags missing alt text or unknown rights.
```

Safety:

```text
Media files stored in vault/runtime, not Git.
Generated/private images not committed.
Metadata review required before clean export.
```

---

## MetadataService

Purpose:

```text
generate, store, review, approve, edit, reject, and regenerate item metadata
```

Owns:

```text
InsertedItemMetadata
field confidence
review status
metadata history
```

Consumes:

```text
metadata.approve
metadata.edit
metadata.reject
metadata.regenerate
image.inserted
source_reference.inserted
```

Emits:

```text
metadata.generated
metadata.approved
metadata.edited
metadata.rejected
metadata.marked_stale
metadata.regenerated
```

Xi-io engine touchpoints:

```text
Analysis proposes metadata/confidence.
Lexicon normalizes tags/entities/terms.
Egress writes approved metadata.
Observer flags unapproved/stale/missing metadata.
```

Safety:

```text
Generated metadata never silently approved.
Private content remains local/vault.
Cloud regeneration requires policy.
```

---

## RightsService

Purpose:

```text
manage project rights profile, item license metadata, inheritance, overrides, migration previews
```

Owns:

```text
ProjectRightsProfile
ItemRightsMetadata fields inside InsertedItemMetadata
license registry
rights migration preview
```

Consumes:

```text
rights.project_profile_updated
rights.item_license_updated
metadata edit/approve actions
```

Emits:

```text
rights.project_profile_created
rights.project_profile_updated
rights.item_inherited_project_profile
rights.item_override_created
rights.item_license_updated
rights.migration_previewed
rights.migration_applied
```

Xi-io engine touchpoints:

```text
Analysis detects unknown/mixed/conflicting rights.
Observer flags unknown rights/export blockers.
Egress applies user-approved rights changes.
```

Safety:

```text
No silent rights/license changes.
Rights suggestions are metadata, not legal advice.
Migration requires preview and confirmation.
```

---

## EventLedgerService

Purpose:

```text
append meaningful events, support audit/history/timeline/calendar projections
```

Owns:

```text
Event
LedgerEntry
AuditEntry
correlation/causation links
```

Consumes:

```text
all meaningful service events
```

Emits:

```text
ledger.entry_created
audit.entry_created
```

Xi-io engine touchpoints:

```text
Ingress event stream feeds ledger.
Observer consumes ledger for drift/freshness/history warnings.
Egress uses ledger for export/history reports.
```

Safety:

```text
Use payload refs for private/large content.
No API keys or raw private content in repo-safe logs.
```

---

## SnapshotService

Purpose:

```text
create, list, preview, and restore project/document/source/index snapshots
```

Owns:

```text
Snapshot
snapshot archive refs
rollback previews
```

Consumes:

```text
file.create_snapshot
manual restore request
observer snapshot recommendation
```

Emits:

```text
snapshot.created
rollback.previewed
rollback.completed
```

Xi-io engine touchpoints:

```text
Egress creates/restores approved snapshots.
Observer recommends snapshots before risky actions.
Ledger records snapshot/rollback history.
```

Safety:

```text
Restore-as-copy preferred by default.
Destructive rollback requires confirmation.
Snapshots stored in vault, not Git.
```

---

## ExportService

Purpose:

```text
validate and generate output artifacts such as Markdown first, later DOCX/PDF/HTML/screenplay exports
```

Owns:

```text
ExportJob
export artifact refs
export readiness report
```

Consumes:

```text
file.export_markdown
export readiness checks
```

Emits:

```text
export.readiness_checked
export.generated
export.blocked
```

Xi-io engine touchpoints:

```text
Analysis checks export readiness.
Observer flags blockers.
Egress writes approved export artifact.
Ledger records export.
```

Safety:

```text
Exports with private content stored in vault unless user chooses location.
Clean export excludes prompt blocks/comments/internal metadata unless chosen.
```

---

## ObserverService

Purpose:

```text
coordinate 43/Ibal observer rules across documents, sources, metadata, rights, providers, exports, snapshots, and repo safety
```

Owns:

```text
ObserverWarning
freshness state
validation state
observer context
```

Consumes:

```text
engine outputs
analysis results
ledger events
validation checks
```

Emits:

```text
observer.warning_created
observer.warning_resolved
observer.warning_dismissed
observer.validation_blocked
observer.snapshot_recommended
observer.export_blocker_created
```

Xi-io engine touchpoints:

```text
Observer is the 43/Ibal layer.
```

Safety:

```text
Warns and recommends, does not silently rewrite/approve/restore/change rights.
```

---

# 6. Cross-Service Rules

## Event-first behavior

Meaningful state changes emit events.

UI-only state changes may remain frontend-only but still use action IDs.

## Approval gates

Services must respect command/action approval gates.

## Private payload handling

Large/private payloads use:

```text
payload_ref
vault_artifact_id
safe summary
hash
```

not raw repo-safe logs.

## Error handling

Services return recoverable, plain-language errors with suggested actions.

---

# 7. Initial API Grouping

Planned API route groups:

```text
/api/health
/api/projects
/api/documents
/api/sources
/api/retrieval
/api/ai
/api/providers
/api/planning
/api/media
/api/metadata
/api/rights
/api/events
/api/snapshots
/api/exports
/api/observer
/api/actions
```

The exact route implementation may evolve, but service ownership should not blur.

---

# 8. First Scaffold Slice

The first implementation slice should touch only:

```text
HealthService
ProviderService
EventLedgerService minimal
AIGatewayService shell only
```

Slice goal:

```text
backend starts
frontend starts
health endpoint works
Ollama health check works
Ollama model list works
event ledger records app.started and ollama.health_checked
frontend shows provider status
```

No full editor yet.

---

# 9. Hard Stop Rules

Do not implement patterns where:

```text
frontend calls Ollama directly
frontend writes vault files directly
frontend writes database directly
AI changes document without review
metadata is silently approved
rights/license changes happen silently
source/document content is logged repo-safe
meaningful state changes skip events
services bypass action registry
```

---

# 10. Acceptance Criteria

```text
Every MVP backend service has a clear owner boundary.
Every meaningful service emits/consumes defined events.
Services map to xi-io engine touchpoints.
Private/vault/repo-safe boundaries are explicit.
First scaffold slice can begin without service ownership ambiguity.
```

---

# 11. Open Gaps

```text
actual FastAPI package structure
SQLite schema/migrations
SourceArtifact full data model
ExportJob data model
MediaGenerationJob model
service interface signatures
API route schemas
validation CLI/tests
```
