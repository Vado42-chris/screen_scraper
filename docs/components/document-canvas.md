# Component Contract: DocumentCanvas

## Template Metadata

- template_id: component-contract-template
- template_version: 1.0.0
- template_status: screen_scraper_initial
- artifact_type: component_contract
- required_for: every_reusable_component_or_major_ui_module

---

# 1. Artifact Metadata

- artifact_id: screen-scraper-component-document-canvas-v1
- tenant_id: local_default
- project_id: screen_scraper
- parent_id: screen-scraper-core-workspace-wireframe-v1
- component_name: DocumentCanvas
- component_type: major_ui_module
- product_area: word_processor_core
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

DocumentCanvas is the primary word-processing surface. It renders and edits the current document while publishing cursor, selection, heading, section, and context state to the AI/chat/action system.

It must feel like a serious word processor, not a text box.

---

# 3. Source Evidence

## Tier 0 Local Evidence

- local files:
  - /mnt/data/scripts_plan.md
- old version lineage:
  - none confirmed for this repo
- screenshots/previews:
  - none yet
- notes:
  - Writing surface must stay usable even when AI is offline.

## Tier 1 Repo Evidence

- repo files:
  - docs/word-processor-requirements-v1.md
  - docs/editor-context-and-application-menu-v1.md
  - docs/active-outline-and-section-prompts-v1.md
  - docs/document-media-layout-and-generation-v1.md
  - docs/data/document-data-model.yaml
  - docs/planning/wireframe-spec.md
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
  - AI must not silently overwrite user work.
  - CursorContext must be available to AI actions.

## Missing Evidence

- final editor engine selection
- editor plugin implementation
- visual design tokens

---

# 4. Component Identity

- component name: DocumentCanvas
- component family: editor
- component role: primary document editing surface
- parent surfaces:
  - Write workspace
  - future Source Compare split view
  - future Print/Layout Preview
- child components:
  - EditorToolbar
  - InlineSuggestion
  - CommentAnchor
  - SourceReferenceChip
  - ImagePlacementNode
  - PromptBlockMarker
- reusable: yes
- project-specific: yes, until generic xi-io editor abstraction exists

---

# 5. Inputs / Props / Data

- name: document
  - type: Document
  - required: true
  - default: null
  - source object: Document
  - validation: must include document_id and title
  - visibility constraints: content local_only/vault_only
  - safe for repo examples: no

- name: editorState
  - type: editor_state_ref_or_loaded_editor_json
  - required: true
  - default: empty document
  - source object: Document.editor_state_ref
  - validation: editor engine schema
  - visibility constraints: vault_only/private
  - safe for repo examples: no

- name: headingAnchors
  - type: HeadingAnchor[]
  - required: false
  - default: []
  - source object: HeadingAnchor
  - validation: stable ids per document
  - visibility constraints: project
  - safe for repo examples: yes

- name: sectionPrompts
  - type: SectionPrompt[]
  - required: false
  - default: []
  - source object: SectionPrompt
  - validation: linked heading ids where applicable
  - visibility constraints: prompt text vault_only if private
  - safe for repo examples: no

- name: activeSourceReferences
  - type: SourceReference[]
  - required: false
  - default: []
  - source object: SourceReference
  - validation: source ids valid
  - visibility constraints: excerpt refs vault_only
  - safe for repo examples: no

- name: mode
  - type: writing|review|semantic_markup|focus|readonly
  - required: true
  - default: writing
  - source object: UI state
  - validation: enum
  - visibility constraints: public
  - safe for repo examples: yes

---

# 6. Output / Events

- name: onCursorContextChanged
  - trigger: cursor or selection changes
  - payload: CursorContext without raw private text unless explicitly needed
  - ledger impact: none by default
  - audit impact: none
  - parent handler: WriteWorkspace state/context service
  - failure behavior: keep editing, mark context stale

- name: document.saved
  - trigger: manual save or promoted autosave
  - payload: document_id, version_id, safe summary
  - ledger impact: document ledger entry
  - audit impact: no unless version restore/AI patch
  - parent handler: DocumentService
  - failure behavior: show save error and preserve local draft

- name: heading.created
  - trigger: user creates H1-H6
  - payload: heading_id, level, text, document_id
  - ledger impact: outline/document event
  - audit impact: no
  - parent handler: ActiveOutlineService
  - failure behavior: heading remains in editor, outline sync retries

- name: suggestion.accepted
  - trigger: user accepts AI suggestion
  - payload: suggestion_id, document_id, affected_range_ref
  - ledger impact: AI/document event
  - audit impact: yes
  - parent handler: DocumentService/EventLedger
  - failure behavior: keep suggestion unresolved

---

# 7. States

## default

- visible UI: editable document canvas
- copy: none
- available actions: write, select, format, insert, comment, ask AI
- inaccessible actions: none if document loaded
- recovery path: not applicable

## loading

- visible UI: document skeleton
- copy: Loading document…
- available actions: none except cancel/back
- inaccessible actions: editing, AI actions
- recovery path: retry/open another document

## empty

- visible UI: blank document prompt
- copy: Start writing or ask AI to help draft this document.
- available actions: type, generate from prompt, import text
- inaccessible actions: source compare until content/source exists
- recovery path: create/open document

## error

- visible UI: error panel inside canvas
- copy: This document could not be loaded.
- available actions: retry, open snapshot, return to document list
- inaccessible actions: editing
- recovery path: restore snapshot or reopen

## disabled

- visible UI: read-only canvas
- copy: This document is read-only.
- available actions: copy, export, duplicate
- inaccessible actions: edit/apply AI
- recovery path: switch permission or duplicate

## validation warning

- visible UI: subtle badges/underlines
- copy: Section prompt may be stale.
- available actions: review warning, update prompt
- inaccessible actions: none
- recovery path: open RightPanel

## validation blocked

- visible UI: export/apply action blocked, document still editable
- copy: Resolve blockers before this action.
- available actions: write, review blockers
- inaccessible actions: blocked action only
- recovery path: open observer/export readiness panel

---

# 8. Interactions

- primary action: write/edit document text
- secondary actions:
  - select text
  - apply formatting
  - insert heading/source reference/image/prompt block
  - add comment
  - accept/reject AI suggestion
- keyboard actions:
  - standard editor shortcuts
  - heading shortcuts later
  - command palette shortcut
- hover/focus behavior:
  - reveal inline controls subtly
  - focus rings visible
- mobile/touch behavior:
  - basic editing only initially
- confirmation needs:
  - applying AI patch
  - replacing selected content
  - destructive deletion of large section later
- destructive action safeguards:
  - undo/redo
  - autosave
  - document version
  - snapshot for major changes

---

# 9. Data + Qual / Quant Handling

## Qualitative

- user notes/comments: attached to ranges or headings
- labels/context: heading path, current section, prompt status
- subjective state: writing/review/focus mode
- rationale: AI suggestion explanations in RightPanel

## Quantitative

- counts: word count, comment count, suggestion count
- scores: source relevance shown outside canvas
- status values: saved/unsaved, prompt stale, metadata needs review
- progress: saving indicator
- timing: last saved timestamp

---

# 10. Safety / Privacy / RBAC

- sensitive data display: document content is private/local/vault by default
- redaction behavior: do not expose raw text in repo-safe logs
- visibility labels: local/vault where needed
- role restrictions: owner/editor can edit, viewer later read-only
- agent/tool restrictions: AI may propose, not silently apply
- local/vault boundaries: editor content stored outside Git

---

# 11. Accessibility + Regulation UX

- semantic element requirements:
  - headings must remain semantic
  - document area must be labelled
- ARIA requirements:
  - editor role/label appropriate to chosen editor
  - comments/suggestions accessible
- keyboard focus order:
  - toolbar → document → inline controls → composer/right panel
- reduced motion needs:
  - no animated text jumps by default
- sensory load constraints:
  - quiet suggestions, no flashing warnings
- cognitive load controls:
  - focus mode, hidden semantic markup by default
- plain-language copy:
  - warnings explain recovery, not internal engine names

---

# 12. Styling / Token Use

- design tokens:
  - spacing, typography, surfaces, borders, focus, status
- spacing:
  - use 8px base system
- typography:
  - readable document typography, style-based formatting
- color roles:
  - semantic statuses, not color-only meaning
- surface/elevation:
  - document surface distinct from app chrome
- responsive behavior:
  - centered readable measure on desktop
- forbidden inline styles:
  - no one-off inline layout styles except unavoidable editor internals

---

# 13. Testing Requirements

- unit tests:
  - renders states
  - emits cursor context
  - handles heading creation
- integration tests:
  - save document
  - accept/reject suggestion
  - insert source reference
  - insert image placeholder
- accessibility tests:
  - keyboard focus
  - headings semantic
  - labels present
- visual regression:
  - basic canvas states
- permission state tests:
  - readonly mode
- data state tests:
  - stale prompt, unsaved, error

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
editor engine changes
Document data model changes
CursorContext model changes
suggestion/comment model changes
image placement model changes
component styling tokens change
```

---

# 16. Acceptance Criteria

```text
DocumentCanvas can be implemented without inventing state/event behavior.
AI suggestions are reviewable, not silent overwrites.
Cursor context emission is required.
Document content remains local/vault safe.
```

---

# 17. Open Gaps

```text
final editor engine
exact editor plugin architecture
track-change-like suggestion model
image node implementation
comment threading model
```
