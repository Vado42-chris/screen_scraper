# Component Contract: RightContextPanel

## Template Metadata

- template_id: component-contract-template
- template_version: 1.0.0
- template_status: screen_scraper_initial
- artifact_type: component_contract
- required_for: every_reusable_component_or_major_ui_module

---

# 1. Artifact Metadata

- artifact_id: screen-scraper-component-right-context-panel-v1
- tenant_id: local_default
- project_id: screen_scraper
- parent_id: screen-scraper-core-workspace-wireframe-v1
- component_name: RightContextPanel
- component_type: major_ui_module
- product_area: contextual_intelligence_surface
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

RightContextPanel is the contextual intelligence rail for the current document, cursor, selected section, selected source, metadata item, story card, export state, or provider status.

It keeps backend intelligence one click away without crowding the writing surface.

---

# 3. Source Evidence

## Tier 0 Local Evidence

- local files:
  - /mnt/data/scripts_plan.md
- notes:
  - Source direction requires hidden infrastructure and simple writing-first UI.

## Tier 1 Repo Evidence

- repo files:
  - docs/planning/wireframe-spec.md
  - docs/planning/page-system-map.md
  - docs/backend-research-integration-v1.md
  - docs/inserted-item-metadata-approval-v1.md
  - docs/license-and-rights-metadata-v1.md
  - docs/event-ledger-and-snapshots-v1.md
  - docs/document-media-layout-and-generation-v1.md
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
  - Right-side panel is contextual, optional, collapsible, and not required for basic writing.

## Missing Evidence

- final child component contracts
- implemented panel state model
- visual design tokens

---

# 4. Component Identity

- component name: RightContextPanel
- component family: panel / contextual intelligence
- component role: host surface for evidence, metadata, story card, provider, export, and observer detail panels
- parent surfaces:
  - Core Workspace Shell
  - Write workspace
  - Plan workspace
  - Sources workspace
  - Analyze workspace
  - Export workspace
  - Settings workspace
- child components:
  - CurrentSectionPanel
  - EvidenceDrawer
  - MetadataReviewPanel
  - StoryCardDetails
  - SourceMetadataPanel
  - ExportReadinessPanel
  - ProviderDetailsPanel
  - ObserverWarningPanel
- reusable: yes
- project-specific: yes

---

# 5. Inputs / Props / Data

- name: activeContext
  - type: CursorContext | SelectedObjectContext | null
  - required: false
  - default: null
  - source object: UI state / context service
  - validation: valid context type
  - visibility constraints: may reference private content by id only
  - safe for repo examples: partial

- name: panelMode
  - type: current_section|evidence|metadata|story_card|source_metadata|export_readiness|provider_details|observer_warnings|empty
  - required: true
  - default: current_section
  - source object: UI state
  - validation: enum
  - visibility constraints: public
  - safe for repo examples: yes

- name: observerWarnings
  - type: ObserverWarning[]
  - required: false
  - default: []
  - source object: Observer/Ibal
  - validation: no raw private text
  - visibility constraints: project/local
  - safe for repo examples: partial

- name: analysisResults
  - type: AnalysisResult[]
  - required: false
  - default: []
  - source object: Analysis engine
  - validation: derived_not_truth marked
  - visibility constraints: private details by reference
  - safe for repo examples: partial

---

# 6. Output / Events

- name: panel.opened
  - trigger: user opens panel or mode changes
  - payload: panel_mode, context_id
  - ledger impact: none by default
  - audit impact: none
  - parent handler: Workspace state
  - failure behavior: show empty panel state

- name: metadata.approved
  - trigger: child MetadataReviewPanel approves item
  - payload: metadata_id, item_id
  - ledger impact: metadata event
  - audit impact: yes
  - parent handler: MetadataService/EventLedger
  - failure behavior: keep proposed state and show error

- name: source_reference.inserted
  - trigger: child EvidenceDrawer inserts source/citation reference
  - payload: source_id, document_id, target_anchor
  - ledger impact: source reference event
  - audit impact: optional
  - parent handler: DocumentService/SourceLibraryService
  - failure behavior: show failed insert state

- name: observer.warning_resolved
  - trigger: user resolves warning
  - payload: warning_id, affected_item_id
  - ledger impact: observer event
  - audit impact: depends on warning
  - parent handler: ObserverService
  - failure behavior: warning remains open

---

# 7. States

## default

- visible UI: current context summary
- copy: none
- available actions: mode-specific actions
- inaccessible actions: none
- recovery path: not applicable

## loading

- visible UI: panel skeleton
- copy: Loading context…
- available actions: close panel
- inaccessible actions: context actions
- recovery path: retry

## empty

- visible UI: quiet empty state
- copy: Select text, a source, or a section to see context.
- available actions: close panel, open help
- inaccessible actions: mode actions
- recovery path: select item or cursor in document

## populated

- visible UI: selected child panel
- copy: mode-specific
- available actions: mode-specific
- inaccessible actions: unsafe actions blocked by policy
- recovery path: change context/mode

## error

- visible UI: recoverable error panel
- copy: Context could not be loaded.
- available actions: retry, close, open diagnostics
- inaccessible actions: failed child actions
- recovery path: retry or inspect diagnostics

## disabled

- visible UI: dimmed panel
- copy: Context panel is unavailable in this mode.
- available actions: close
- inaccessible actions: all child actions
- recovery path: switch workspace/mode

## validation warning

- visible UI: warning banner or badge
- copy: Review before continuing.
- available actions: review/resolve
- inaccessible actions: none unless blocked
- recovery path: complete review

## validation blocked

- visible UI: blocking warning
- copy: This action is blocked until the issue is resolved.
- available actions: resolve, dismiss if allowed, open details
- inaccessible actions: blocked action
- recovery path: resolve issue

## success/confirmation

- visible UI: confirmation message
- copy: Updated.
- available actions: continue, undo where supported
- inaccessible actions: none
- recovery path: undo/ledger history

---

# 8. Interactions

- primary action: show relevant context for current selection/object
- secondary actions:
  - approve metadata
  - insert source reference
  - resolve observer warning
  - open source/card/provider details
  - apply/reject suggestion where hosted
- keyboard actions:
  - tab through panel controls
  - Escape collapses panel if focus is inside panel
- hover/focus behavior:
  - controls reveal clearly on focus, not hover-only
- mobile/touch behavior:
  - appears as drawer/modal
- confirmation needs:
  - metadata batch approval
  - rights changes
  - applying AI patches
  - cloud actions
- destructive action safeguards:
  - confirmation + event ledger for destructive/rights/rollback actions

---

# 9. Data + Qual / Quant Handling

## Qualitative

- user notes/comments: source notes, metadata notes, warning rationale
- labels/context: current section, selected object, panel mode
- subjective state: review status, warning status
- rationale: explain why source/metadata/warning exists

## Quantitative

- counts: warnings, sources, comments, suggestions
- scores: confidence/relevance
- status values: proposed/approved/stale/blocked
- progress: job/export status when applicable
- timing: last updated/created timestamps where useful

---

# 10. Safety / Privacy / RBAC

- sensitive data display: show snippets/summaries only when allowed
- redaction behavior: vault-only text behind safe preview controls
- visibility labels: Local, Vault Only, Project, Cloud Requires Approval
- role restrictions: owner/editor initially
- agent/tool restrictions: panel can show AI suggestions but not silently apply them
- local/vault boundaries: raw private text stays in backend/local store

---

# 11. Accessibility + Regulation UX

- semantic element requirements:
  - complementary landmark
  - labelled panel heading
- ARIA requirements:
  - aria-live only for important status changes
  - buttons labelled by action and object
- keyboard focus order:
  - panel heading → primary action → details → secondary actions
- reduced motion needs:
  - drawer transition respects reduced motion
- sensory load constraints:
  - warnings grouped, no flashing alerts
- cognitive load controls:
  - one primary panel mode at a time
- plain-language copy:
  - explain warnings and recovery actions clearly

---

# 12. Styling / Token Use

- design tokens:
  - panel surface, border, spacing, typography, status badges
- spacing:
  - 8px base, 16px section spacing
- typography:
  - panel title, body, metadata fields
- color roles:
  - warning/block/success semantic, not color-only
- surface/elevation:
  - distinct from document canvas, lower priority than primary writing surface
- responsive behavior:
  - right rail desktop, drawer tablet/mobile
- forbidden inline styles:
  - no one-off inline layout styles

---

# 13. Testing Requirements

- unit tests:
  - renders empty/loading/error/populated states
  - switches panel modes
  - hides private fields by default
- integration tests:
  - approve metadata through child panel
  - insert source reference through evidence panel
  - resolve observer warning
- accessibility tests:
  - focus trap in drawer mode
  - labelled complementary region
  - keyboard navigation
- visual regression:
  - core modes and warning/block states
- permission state tests:
  - owner/editor only actions
- data state tests:
  - no raw vault content rendered accidentally

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
RightPanel modes change
child component contracts change
metadata/review model changes
observer warning model changes
wireframe region changes
privacy behavior changes
```

---

# 16. Acceptance Criteria

```text
RightContextPanel can host contextual intelligence without crowding writing.
Panel modes are explicit.
Private content is protected by default.
Actions route to services/events instead of local UI-only mutations.
```

---

# 17. Open Gaps

```text
child component contracts beyond MetadataReviewPanel/SourceDrawer
exact tab layout vs mode switcher
animation behavior
expert diagnostics mode
```
