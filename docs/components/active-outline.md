# Component Contract: ActiveOutline

## Template Metadata

- template_id: component-contract-template
- template_version: 1.0.0
- template_status: screen_scraper_initial
- artifact_type: component_contract
- required_for: every_reusable_component_or_major_ui_module

---

# 1. Artifact Metadata

- artifact_id: screen-scraper-component-active-outline-v1
- tenant_id: local_default
- project_id: screen_scraper
- parent_id: screen-scraper-core-workspace-wireframe-v1
- component_name: ActiveOutline
- component_type: major_ui_module
- product_area: active_outline_and_section_prompts
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

ActiveOutline turns document headings into an active navigation, planning, prompt, and status surface.

It extends the familiar word-processor table-of-contents pattern into a section-aware drafting control surface without forcing the user into a separate system UI.

---

# 3. Source Evidence

## Tier 0 Local Evidence

- local files:
  - /mnt/data/scripts_plan.md
- notes:
  - User requested split view and heading-driven prompts where H1s can become milestones/sections.

## Tier 1 Repo Evidence

- repo files:
  - docs/active-outline-and-section-prompts-v1.md
  - docs/story-spine-and-storyboard-system-v1.md
  - docs/editor-context-and-application-menu-v1.md
  - docs/planning/information-architecture-map.md
  - docs/planning/page-system-map.md
  - docs/planning/wireframe-spec.md
  - docs/data/document-data-model.yaml
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
  - H1/H2/H3 generate navigable outline.
  - H1 can have section prompt.
  - Prompt generation is suggested, not forced.

## Missing Evidence

- exact editor anchor API
- final tree/list implementation
- final prompt status iconography

---

# 4. Component Identity

- component name: ActiveOutline
- component family: navigation / planning / document intelligence
- component role: heading navigation plus section prompt/status system
- parent surfaces:
  - LeftRail in Write workspace
  - Plan Split View
  - Export outline panel
- child components:
  - OutlineTreeItem
  - PromptStatusBadge
  - SourceCountBadge
  - CommentCountBadge
  - ObserverWarningBadge
  - OutlineActionMenu
- reusable: yes
- project-specific: yes, until generic xi-io outline abstraction exists

---

# 5. Inputs / Props / Data

- name: documentId
  - type: uuid
  - required: true
  - default: null
  - source object: Document
  - validation: existing document
  - visibility constraints: project
  - safe for repo examples: yes

- name: headingAnchors
  - type: HeadingAnchor[]
  - required: true
  - default: []
  - source object: HeadingAnchor
  - validation: stable heading ids, ordered by document order
  - visibility constraints: project
  - safe for repo examples: yes

- name: sectionPrompts
  - type: SectionPrompt[]
  - required: false
  - default: []
  - source object: SectionPrompt
  - validation: linked heading ids
  - visibility constraints: prompt content may be vault_only
  - safe for repo examples: no

- name: observerWarnings
  - type: ObserverWarning[]
  - required: false
  - default: []
  - source object: Observer/Ibal
  - validation: linked affected item ids
  - visibility constraints: no raw private text
  - safe for repo examples: partial

- name: activeHeadingId
  - type: string|null
  - required: false
  - default: null
  - source object: CursorContext
  - validation: heading id or null
  - visibility constraints: project
  - safe for repo examples: yes

---

# 6. Output / Events

- name: outline.jump_to_heading
  - trigger: user selects outline item
  - payload: document_id, heading_id
  - ledger impact: none by default
  - audit impact: none
  - parent handler: DocumentCanvas navigation
  - failure behavior: show stale anchor warning and rebuild outline

- name: outline.generate_prompt_for_heading
  - trigger: user chooses Generate Prompt
  - payload: document_id, heading_id, context_policy
  - ledger impact: ai.requested and section_prompt.generated
  - audit impact: yes if AI generated
  - parent handler: Planning/AI Gateway
  - failure behavior: allow manual prompt creation

- name: outline.create_story_node_from_heading
  - trigger: user chooses Create Card/Story Node
  - payload: document_id, heading_id, heading_text, heading_level
  - ledger impact: plan.node_created
  - audit impact: no
  - parent handler: StorySpineService
  - failure behavior: show error, no document mutation

- name: outline.find_stale_prompts
  - trigger: command/action or observer refresh
  - payload: document_id
  - ledger impact: observer.warning_created where applicable
  - audit impact: no
  - parent handler: ObserverService
  - failure behavior: show retry in Analyze/Outline panel

---

# 7. States

## default

- visible UI: heading tree with badges
- copy: none
- available actions: jump, add/edit prompt, generate prompt, open menu
- inaccessible actions: none if document loaded
- recovery path: not applicable

## loading

- visible UI: skeleton tree
- copy: Loading outline…
- available actions: none
- inaccessible actions: navigation/prompt actions
- recovery path: retry

## empty

- visible UI: empty outline message
- copy: Add headings to build your outline.
- available actions: insert H1, generate outline from spine later
- inaccessible actions: jump/prompt generation
- recovery path: create heading

## populated

- visible UI: heading tree with H1/H2/H3 nesting
- copy: none
- available actions: jump, prompt actions, story node actions
- inaccessible actions: none
- recovery path: rebuild if stale

## error

- visible UI: error state in rail
- copy: Outline could not be loaded.
- available actions: retry, rebuild outline
- inaccessible actions: jump/prompt actions
- recovery path: rebuild from document headings

## disabled

- visible UI: dimmed outline
- copy: Outline unavailable in this mode.
- available actions: none or jump only
- inaccessible actions: prompt/story actions
- recovery path: switch to Write/Plan mode

## validation warning

- visible UI: badges for stale prompts/missing prompts/open questions
- copy: Prompt may need update.
- available actions: review/update prompt
- inaccessible actions: none
- recovery path: open CurrentSectionPanel

## validation blocked

- visible UI: blocker badge
- copy: Section has export blockers.
- available actions: open blocker details
- inaccessible actions: export clean copy may be blocked elsewhere
- recovery path: resolve blocker

## success/confirmation

- visible UI: prompt created/updated badge
- copy: Prompt ready.
- available actions: draft from prompt
- inaccessible actions: none
- recovery path: edit prompt

---

# 8. Interactions

- primary action: jump to heading
- secondary actions:
  - add prompt
  - edit prompt
  - generate prompt
  - draft from prompt
  - find sources for section
  - create story node/card
  - mark section ready
- keyboard actions:
  - arrow navigation in tree
  - Enter jumps to selected heading
  - context menu key opens actions
- hover/focus behavior:
  - reveal row action menu
  - badges remain visible
- mobile/touch behavior:
  - larger row targets, actions in drawer/menu
- confirmation needs:
  - AI-generated prompt can be accepted/edited
  - destructive heading reorder not MVP
- destructive action safeguards:
  - no destructive document restructuring in MVP

---

# 9. Data + Qual / Quant Handling

## Qualitative

- user notes/comments: prompt text and open questions shown in panel, not crowded in tree
- labels/context: heading text, prompt status, linked story node
- subjective state: section status if available
- rationale: prompt stale reason shown on request

## Quantitative

- counts: source count, comment count, suggestion count, open question count
- scores: source relevance maybe shown in panel, not tree by default
- status values: prompt state, stale/missing/resolved
- progress: word count/target later
- timing: last updated/stale timestamp later

---

# 10. Safety / Privacy / RBAC

- sensitive data display: prompt text may be private, tree shows status not full private content by default
- redaction behavior: no raw source/document excerpts in outline rows
- visibility labels: local/project/vault where necessary
- role restrictions: owner/editor can generate/edit prompts, viewer later read-only
- agent/tool restrictions: AI can suggest prompt, not silently update without user review
- local/vault boundaries: prompt text stored database/vault, not repo

---

# 11. Accessibility + Regulation UX

- semantic element requirements:
  - tree/list semantics for headings
  - heading levels communicated
- ARIA requirements:
  - aria-current for active heading
  - labels for badges/actions
- keyboard focus order:
  - tree root → items → row action menu
- reduced motion needs:
  - no animated auto-scroll unless user action
- sensory load constraints:
  - badges subtle, warnings grouped
- cognitive load controls:
  - show only key statuses by default
  - advanced counts hidden until expanded
- plain-language copy:
  - Prompt missing, Prompt ready, Prompt may need update

---

# 12. Styling / Token Use

- design tokens:
  - spacing, typography, status badges, focus, hover
- spacing:
  - compact rail spacing using 8px base
- typography:
  - hierarchy by indentation and weight
- color roles:
  - badges must not rely on color only
- surface/elevation:
  - rail surface quiet and secondary
- responsive behavior:
  - drawer on small screens
- forbidden inline styles:
  - no one-off inline layout styles

---

# 13. Testing Requirements

- unit tests:
  - renders empty/loading/error/populated states
  - nests H1/H2/H3 correctly
  - shows prompt status badges
- integration tests:
  - click jumps to heading
  - generate prompt action emits correct action
  - create story node action emits correct action
- accessibility tests:
  - keyboard tree navigation
  - aria-current active heading
  - badge labels
- visual regression:
  - normal, stale prompt, missing prompt, warning states
- permission state tests:
  - read-only viewer later
- data state tests:
  - stale anchor rebuild path

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
HeadingAnchor model changes
SectionPrompt model changes
StoryNode linking changes
CursorContext model changes
outline actions change
wireframe left rail changes
```

---

# 16. Acceptance Criteria

```text
ActiveOutline can be implemented as heading navigation plus prompt/status system.
H1/H2/H3 hierarchy is supported.
Prompt generation is optional and reviewable.
Outline remains a writing aid, not a system dashboard.
```

---

# 17. Open Gaps

```text
exact heading anchor API
prompt status icons
drag/reorder behavior later
story node sync implementation
word target display later
```
