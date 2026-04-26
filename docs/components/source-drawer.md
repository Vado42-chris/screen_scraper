# Component Contract: SourceDrawer

## Template Metadata

- template_id: component-contract-template
- template_version: 1.0.0
- template_status: screen_scraper_initial
- artifact_type: component_contract
- required_for: every_reusable_component_or_major_ui_module

---

# 1. Artifact Metadata

- artifact_id: screen-scraper-component-source-drawer-v1
- tenant_id: local_default
- project_id: screen_scraper
- parent_id: screen-scraper-core-workspace-wireframe-v1
- component_name: SourceDrawer
- component_type: major_ui_module
- product_area: source_library_and_retrieval
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

SourceDrawer gives the user quick access to the active project source library, relevant source matches, source previews, and insertable source references without forcing the user out of the writing workspace.

It is a bridge between the writing surface and the backend source/retrieval engines.

---

# 3. Source Evidence

## Tier 0 Local Evidence

- local files:
  - /mnt/data/scripts_plan.md
- notes:
  - Source library should mostly stay behind the writing interface, available when summoned.

## Tier 1 Repo Evidence

- repo files:
  - docs/backend-research-integration-v1.md
  - docs/planning/information-architecture-map.md
  - docs/planning/page-system-map.md
  - docs/planning/wireframe-spec.md
  - docs/data/document-data-model.yaml
  - docs/events/event-model.yaml
- imports/exports:
  - not implemented yet
- styles:
  - not implemented yet

## Tier 2 Management Evidence

- page/system maps:
  - docs/planning/page-system-map.md
- wireframes:
  - docs/planning/wireframe-spec.md
- product requirements:
  - docs/planning/project-brief.md
- decisions:
  - Source use must be explainable and source-backed suggestions must show supporting context.

## Missing Evidence

- source library data model split-out
- retrieval/indexing implementation
- source reader route implementation

---

# 4. Component Identity

- component name: SourceDrawer
- component family: source_library / evidence / retrieval
- component role: source list, search, preview, active source set, and source insertion surface
- parent surfaces:
  - RightContextPanel
  - Sources workspace
  - Write workspace split/source view
- child components:
  - SourceList
  - SourceSearchInput
  - SourceMatchCard
  - SourcePreview
  - SourceMetadataSummary
  - CitationChipAction
  - ActiveSourceSetControls
- reusable: yes
- project-specific: yes

---

# 5. Inputs / Props / Data

- name: projectId
  - type: uuid
  - required: true
  - default: null
  - source object: Project
  - validation: existing project
  - visibility constraints: project
  - safe for repo examples: yes

- name: sources
  - type: SourceArtifact[]
  - required: false
  - default: []
  - source object: SourceLibraryService
  - validation: project-owned sources only
  - visibility constraints: source text vault_only
  - safe for repo examples: partial metadata only

- name: activeSourceSet
  - type: SourceReference[] | SourceArtifact[]
  - required: false
  - default: []
  - source object: SourceLibraryService / Document context
  - validation: valid source ids
  - visibility constraints: source text vault_only
  - safe for repo examples: yes if IDs only

- name: sourceMatches
  - type: SourceMatch[]
  - required: false
  - default: []
  - source object: RetrievalService / Analysis engine
  - validation: derived_not_truth and relevance score required
  - visibility constraints: private excerpts by vault ref or safe snippet
  - safe for repo examples: partial

- name: cursorContext
  - type: CursorContext|null
  - required: false
  - default: null
  - source object: DocumentCanvas
  - validation: current document context if in Write mode
  - visibility constraints: selected text private
  - safe for repo examples: no

---

# 6. Output / Events

- name: source.search_requested
  - trigger: user searches sources
  - payload: project_id, query, filters
  - ledger impact: optional search event
  - audit impact: no
  - parent handler: SourceLibraryService
  - failure behavior: show retry and empty state

- name: source_reference.inserted
  - trigger: user inserts source/citation/reference into document
  - payload: source_id, document_id, target_anchor, excerpt_ref
  - ledger impact: source reference event
  - audit impact: optional
  - parent handler: DocumentService/SourceLibraryService
  - failure behavior: keep source selected and show failed insert message

- name: source.attach_to_document
  - trigger: user adds source to active document/source set
  - payload: source_id, document_id
  - ledger impact: source/document association event
  - audit impact: no
  - parent handler: SourceLibraryService
  - failure behavior: show attach failed state

- name: source.find_for_current_section
  - trigger: user requests relevant sources for current cursor/section
  - payload: document_id, heading_id, context_policy
  - ledger impact: retrieval.performed, analysis result
  - audit impact: no unless cloud retrieval later
  - parent handler: RetrievalService/AnalysisService
  - failure behavior: show no matches or provider/index error

---

# 7. States

## default

- visible UI: source list/search or relevant matches
- copy: none
- available actions: search, preview, attach, insert reference
- inaccessible actions: none if sources/index available
- recovery path: not applicable

## loading

- visible UI: skeleton cards/list
- copy: Loading sources…
- available actions: close drawer
- inaccessible actions: search/insert
- recovery path: retry

## empty

- visible UI: empty source library prompt
- copy: Add a source to make writing assistance source-aware.
- available actions: Add Source, Import Text/Markdown
- inaccessible actions: insert reference
- recovery path: import source

## populated

- visible UI: searchable source cards/list
- copy: none
- available actions: preview, attach, insert reference, find related
- inaccessible actions: none unless permissions block
- recovery path: not applicable

## error

- visible UI: error panel
- copy: Sources could not be loaded.
- available actions: retry, open diagnostics
- inaccessible actions: insert/search
- recovery path: retry or inspect source index

## disabled

- visible UI: disabled drawer
- copy: Source library is unavailable.
- available actions: open settings/diagnostics
- inaccessible actions: search/insert
- recovery path: reconnect vault/source index

## validation warning

- visible UI: source health badge
- copy: This source needs provenance review.
- available actions: review metadata/provenance
- inaccessible actions: none by default
- recovery path: open SourceMetadataPanel

## validation blocked

- visible UI: blocked badge/message
- copy: This source cannot be used for this action until rights/privacy are reviewed.
- available actions: review rights/privacy
- inaccessible actions: insert/use in cloud action
- recovery path: resolve rights/privacy state

## success/confirmation

- visible UI: confirmation toast/badge
- copy: Source reference inserted.
- available actions: view reference, undo
- inaccessible actions: none
- recovery path: undo/remove reference

---

# 8. Interactions

- primary action: find/insert relevant source support
- secondary actions:
  - search sources
  - attach source to document
  - preview source
  - open evidence drawer
  - review source metadata
- keyboard actions:
  - search input focus
  - arrow through results
  - Enter opens result
  - shortcut later for find sources
- hover/focus behavior:
  - reveal insert/attach actions on focused card
- mobile/touch behavior:
  - drawer list with large touch targets
- confirmation needs:
  - using cloud with private source snippets
  - inserting source with unknown rights warning may require review
- destructive action safeguards:
  - no destructive source deletion from drawer MVP

---

# 9. Data + Qual / Quant Handling

## Qualitative

- user notes/comments: source notes and provenance notes
- labels/context: source title, type, summary, relevance reason
- subjective state: reliability/review status
- rationale: why a source matched current section

## Quantitative

- counts: total sources, matches, active sources
- scores: source relevance, metadata confidence, reliability/stability later
- status values: indexed/unindexed, needs_review, attached
- progress: indexing/import job status
- timing: imported/updated date

---

# 10. Safety / Privacy / RBAC

- sensitive data display: source full text private/vault-only
- redaction behavior: show snippets only when permitted
- visibility labels: Local, Vault Only, Needs Rights Review
- role restrictions: owner/editor initially
- agent/tool restrictions: AI may retrieve source context through backend only
- local/vault boundaries: raw sources and excerpts never repo-safe

---

# 11. Accessibility + Regulation UX

- semantic element requirements:
  - drawer/region labelled
  - source list uses list semantics
- ARIA requirements:
  - search results labelled with source title and status
- keyboard focus order:
  - search → filters → list → preview/actions
- reduced motion needs:
  - drawer respects reduced motion
- sensory load constraints:
  - concise cards, avoid dense metadata by default
- cognitive load controls:
  - show relevance/reason first, details expandable
- plain-language copy:
  - Use “Needs review” instead of raw rights codes by default

---

# 12. Styling / Token Use

- design tokens:
  - cards, status badges, drawer surface, focus
- spacing:
  - 8px base, 16px card padding
- typography:
  - source title, short summary, metadata line
- color roles:
  - status badges not color-only
- surface/elevation:
  - drawer overlay/right rail compatible
- responsive behavior:
  - right drawer desktop/tablet, full screen on mobile
- forbidden inline styles:
  - no one-off inline styles

---

# 13. Testing Requirements

- unit tests:
  - empty/loading/error/populated states
  - renders source cards and statuses
  - disables insert when blocked
- integration tests:
  - search sources
  - insert source reference
  - attach source to document
  - find sources for current section
- accessibility tests:
  - keyboard search/result navigation
  - labelled drawer/list/cards
- visual regression:
  - source cards, warning, blocked states
- permission state tests:
  - rights/privacy blocked source
- data state tests:
  - unindexed source, source missing vault ref

---

# 14. Validation Rules

This component contract is valid when:

```text
inputs and outputs are explicit
all required states are defined
permissions and visibility are represented
accessibility requirements are testable
emitted events are mapped
parent surfaces are identified
implementation can proceed without guessing
```

---

# 15. Freshness Rules

Mark stale when:

```text
SourceArtifact model changes
retrieval model changes
source privacy rules change
source reference insertion behavior changes
right panel layout changes
```

---

# 16. Acceptance Criteria

```text
SourceDrawer can show, search, preview, attach, and insert source references.
Private source text remains protected.
Source relevance is explainable and correctable.
Source actions route through backend services/events.
```

---

# 17. Open Gaps

```text
SourceArtifact data model split-out
retrieval match schema
source reader component contract
source indexing job states
citation style behavior
```
