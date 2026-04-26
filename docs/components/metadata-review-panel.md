# Component Contract: MetadataReviewPanel

## Template Metadata

- template_id: component-contract-template
- template_version: 1.0.0
- template_status: screen_scraper_initial
- artifact_type: component_contract
- required_for: every_reusable_component_or_major_ui_module

---

# 1. Artifact Metadata

- artifact_id: screen-scraper-component-metadata-review-panel-v1
- tenant_id: local_default
- project_id: screen_scraper
- parent_id: screen-scraper-component-right-context-panel-v1
- component_name: MetadataReviewPanel
- component_type: major_ui_module
- product_area: metadata_review_and_approval
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

MetadataReviewPanel lets the user approve, edit, reject, regenerate, or defer metadata proposed by the system for inserted/generated/imported items.

The panel exists because the app should do the clerical work, but the user remains the approving authority.

```text
System proposes.
User approves.
Ledger records.
Document remains trustworthy.
```

---

# 3. Source Evidence

## Tier 0 Local Evidence

- local files:
  - /mnt/data/scripts_plan.md
- notes:
  - User explicitly corrected the plan: inserted items should generate metadata where applicable and allow user approval, rather than forcing manual entry.

## Tier 1 Repo Evidence

- repo files:
  - docs/inserted-item-metadata-approval-v1.md
  - docs/license-and-rights-metadata-v1.md
  - docs/document-media-layout-and-generation-v1.md
  - docs/data/document-data-model.yaml
  - docs/events/event-model.yaml
  - docs/planning/wireframe-spec.md
  - docs/components/right-context-panel.md
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
  - Generated metadata cannot be silently approved.
  - Rights/license fields need project-level inheritance and item-level overrides.

## Missing Evidence

- final metadata service implementation
- rights/license registry implementation
- batch review UX details

---

# 4. Component Identity

- component name: MetadataReviewPanel
- component family: review / metadata / rights / approval
- component role: review and approve generated metadata for inserted/imported/generated items
- parent surfaces:
  - RightContextPanel
  - Media Library later
  - Source Library later
  - Export Readiness workspace later
- child components:
  - MetadataFieldEditor
  - MetadataConfidenceBadge
  - RightsStatusSelector
  - AltTextSuggestionEditor
  - CaptionSuggestionEditor
  - MetadataHistoryDrawer
  - BatchMetadataReviewControls later
- reusable: yes
- project-specific: yes

---

# 5. Inputs / Props / Data

- name: metadataItem
  - type: InsertedItemMetadata|null
  - required: false
  - default: null
  - source object: MetadataService
  - validation: valid item_id and item_type
  - visibility constraints: metadata may include private descriptions/provenance
  - safe for repo examples: partial

- name: targetItem
  - type: MediaAsset|SourceReference|SectionPrompt|StoryNode|ExportJob|object|null
  - required: false
  - default: null
  - source object: item-specific service
  - validation: item_id matches metadataItem.item_id
  - visibility constraints: depends on target object
  - safe for repo examples: partial

- name: projectRightsProfile
  - type: ProjectRightsProfile|null
  - required: false
  - default: null
  - source object: RightsService
  - validation: active profile if present
  - visibility constraints: project/local
  - safe for repo examples: yes without private author if redacted

- name: confidence
  - type: MetadataConfidence|null
  - required: false
  - default: null
  - source object: Analysis engine
  - validation: 0..1 per field where available
  - visibility constraints: project
  - safe for repo examples: yes

- name: reviewMode
  - type: single|batch|readonly
  - required: true
  - default: single
  - source object: UI state
  - validation: enum
  - visibility constraints: public
  - safe for repo examples: yes

---

# 6. Output / Events

- name: metadata.approved
  - trigger: user approves proposed metadata
  - payload: metadata_id, item_id, approved_fields, review_note
  - ledger impact: metadata event
  - audit impact: yes
  - parent handler: MetadataService/EventLedger
  - failure behavior: keep proposed state and show retry

- name: metadata.edited
  - trigger: user edits one or more fields
  - payload: metadata_id, item_id, changed_fields
  - ledger impact: metadata event
  - audit impact: yes
  - parent handler: MetadataService/EventLedger
  - failure behavior: preserve unsaved edits locally and show error

- name: metadata.rejected
  - trigger: user rejects proposal
  - payload: metadata_id, item_id, rejection_reason optional
  - ledger impact: metadata event
  - audit impact: yes
  - parent handler: MetadataService/EventLedger
  - failure behavior: keep proposed state and show retry

- name: metadata.regenerated
  - trigger: user requests regenerated metadata
  - payload: metadata_id, item_id, requested_fields, provider_policy
  - ledger impact: ai.requested/metadata.generated
  - audit impact: yes if private context/provider involved
  - parent handler: MetadataService/AIGateway
  - failure behavior: preserve current metadata and show error

- name: rights.item_license_updated
  - trigger: user updates item rights/license fields
  - payload: item_id, old_license_id, new_license_id, manual_override
  - ledger impact: rights event
  - audit impact: yes
  - parent handler: RightsService/EventLedger
  - failure behavior: keep previous rights state

---

# 7. States

## default

- visible UI: metadata fields and review controls
- copy: Review generated metadata.
- available actions: approve, edit, reject, regenerate
- inaccessible actions: batch actions unless batch mode
- recovery path: not applicable

## loading

- visible UI: skeleton fields
- copy: Loading metadata…
- available actions: close panel
- inaccessible actions: approve/edit/reject
- recovery path: retry

## empty

- visible UI: empty review state
- copy: No metadata item selected.
- available actions: select item, close panel
- inaccessible actions: approve/edit/reject
- recovery path: select inserted item

## populated

- visible UI: item preview, metadata fields, confidence, rights fields, controls
- copy: mode-specific helper text
- available actions: approve, edit, reject, regenerate, explain
- inaccessible actions: none unless policy blocks
- recovery path: save/cancel edits

## error

- visible UI: error card
- copy: Metadata could not be loaded.
- available actions: retry, close, diagnostics
- inaccessible actions: approve/edit/reject
- recovery path: retry/reopen

## disabled

- visible UI: readonly metadata
- copy: Metadata is read-only in this mode.
- available actions: copy/view history
- inaccessible actions: approve/edit/reject
- recovery path: switch role/mode

## permission restricted

- visible UI: restricted state
- copy: You need owner permission to change rights metadata.
- available actions: view only
- inaccessible actions: rights/license update
- recovery path: switch role later

## validation warning

- visible UI: warning badge beside field(s)
- copy: This field has low confidence or needs review.
- available actions: edit field, approve after review
- inaccessible actions: approve all high-confidence if low-confidence present
- recovery path: edit/reject/regenerate

## validation blocked

- visible UI: blocking warning
- copy: Rights or required metadata must be reviewed before export.
- available actions: review fields
- inaccessible actions: clean export elsewhere
- recovery path: approve/edit required fields

## success/confirmation

- visible UI: confirmation state
- copy: Metadata approved.
- available actions: continue, view history, undo if supported
- inaccessible actions: none
- recovery path: metadata history/ledger

---

# 8. Interactions

- primary action: approve or edit proposed metadata
- secondary actions:
  - reject proposal
  - regenerate fields
  - explain suggestion
  - open source/provenance
  - change rights/license status
  - mark needs review
- keyboard actions:
  - tab through fields
  - Enter/shortcut save field where appropriate
  - Escape cancel unsaved edit
- hover/focus behavior:
  - field confidence/explanation visible on focus
- mobile/touch behavior:
  - fields stack vertically
- confirmation needs:
  - rights/license change
  - batch approve
  - cloud regeneration using private content
- destructive action safeguards:
  - rejecting metadata does not delete item
  - rights changes audited

---

# 9. Data + Qual / Quant Handling

## Qualitative

- user notes/comments: review note, provenance note, rejection reason
- labels/context: title, description, caption, alt text, rights label
- subjective state: needs_review, approved, rejected, stale
- rationale: why metadata was suggested

## Quantitative

- counts: fields needing review, batch count later
- scores: confidence overall and per field
- status values: proposed, approved, edited, rejected, stale, needs_review
- progress: regeneration job status
- timing: generated/approved/edited timestamps

---

# 10. Safety / Privacy / RBAC

- sensitive data display: descriptions/provenance may include private context
- redaction behavior: private source/document details by reference or safe summary
- visibility labels: Project, Local, Vault Only, Unknown Rights, Needs Review
- role restrictions: owner/editor can approve metadata; owner required for rights migration later
- agent/tool restrictions: AI can suggest/regenerate, user approves
- local/vault boundaries: private item contents remain local/vault

---

# 11. Accessibility + Regulation UX

- semantic element requirements:
  - form fields with labels
  - grouped sections for general metadata, accessibility, rights, provenance
- ARIA requirements:
  - confidence/warning messages tied to fields
  - status announcements for save/approve
- keyboard focus order:
  - item preview → fields → confidence/explanation → actions
- reduced motion needs:
  - no flashing confidence indicators
- sensory load constraints:
  - progressive disclosure for advanced rights fields
- cognitive load controls:
  - show essential fields first
  - advanced metadata collapsed
- plain-language copy:
  - Use “Needs review” and “Unknown rights” rather than legal/code jargon by default

---

# 12. Styling / Token Use

- design tokens:
  - form fields, badges, status, warning, focus, panel surfaces
- spacing:
  - 8px base, field groups separated clearly
- typography:
  - clear field labels and helper text
- color roles:
  - confidence/status not color-only
- surface/elevation:
  - panel form surface
- responsive behavior:
  - stack fields on narrow panels
- forbidden inline styles:
  - no one-off inline styles

---

# 13. Testing Requirements

- unit tests:
  - states render
  - fields editable
  - confidence warnings show
  - rights field restrictions
- integration tests:
  - approve metadata
  - edit metadata
  - reject metadata
  - regenerate metadata request
  - update rights field
- accessibility tests:
  - labelled fields
  - warning descriptions
  - keyboard save/cancel
- visual regression:
  - proposed, approved, warning, blocked states
- permission state tests:
  - readonly and owner-only rights behavior
- data state tests:
  - stale metadata, unknown rights, missing alt text

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
InsertedItemMetadata model changes
ProjectRightsProfile model changes
license registry changes
metadata lifecycle changes
image/media model changes
export readiness requirements change
```

---

# 16. Acceptance Criteria

```text
MetadataReviewPanel lets users approve/edit/reject generated metadata.
Generated metadata is never silently approved.
Rights/license fields are visible and auditable where relevant.
Missing alt text and unknown rights can be surfaced before export.
```

---

# 17. Open Gaps

```text
batch review UX
rights license registry implementation
field-level confidence schema
metadata history UI
integration with export readiness checker
```
