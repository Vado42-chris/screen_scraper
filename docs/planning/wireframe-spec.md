# Wireframe Spec: Core Workspace Shell

## Template Metadata

- template_id: wireframe-spec-template
- template_version: 1.0.0
- template_status: screen_scraper_initial
- artifact_type: wireframe_spec
- required_for: every_page_screen_microsite_or_major_ui_surface

---

# 1. Artifact Metadata

- artifact_id: screen-scraper-core-workspace-wireframe-v1
- tenant_id: local_default
- project_id: screen_scraper
- parent_id: screen-scraper-page-system-map-v1
- page_or_surface_name: Core Workspace Shell
- related_page_system_map: docs/planning/page-system-map.md
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

Define the first implementable UI structure for the screen_scraper cooperative word processor.

This wireframe keeps the visible experience focused on writing, while making room for source context, planning prompts, AI chat, metadata review, and observer warnings through progressive disclosure.

---

# 3. Source Evidence

## Tier 0 Local Evidence

- local files:
  - /mnt/data/scripts_plan.md
- old version lineage:
  - none confirmed for this repo
- screenshots/previews:
  - local folder screenshots from user
- notes:
  - User wants a simple cooperative word processor, not a system dashboard.

## Tier 1 Repo Evidence

- repo files:
  - docs/planning/information-architecture-map.md
  - docs/planning/page-system-map.md
  - docs/ui-composition-contract-v1.md
  - docs/editor-context-and-application-menu-v1.md
  - docs/active-outline-and-section-prompts-v1.md
  - docs/component-inventory-v1.md
  - docs/workspace-modes-v1.md
- components/routes/styles:
  - not implemented yet

## Tier 2 Management Evidence

- page/system map:
  - docs/planning/page-system-map.md
- IA map:
  - docs/planning/information-architecture-map.md
- user journey map:
  - not yet formalized
- product requirements:
  - docs/planning/project-brief.md

## Missing Evidence

- final visual design tokens
- final editor engine
- implemented component states
- usability testing

---

# 4. Surface Summary

- surface name: Core Workspace Shell
- route/path: /app/:projectId/*
- user goal: write, plan, use sources, ask AI, review, and export without losing flow
- system goal: keep UI actions connected to document context, source library, AI gateway, event ledger, and xi-io engines
- primary content: document editor or selected workspace canvas
- primary action: write/edit or run context-aware AI action
- secondary actions: import source, generate section prompt, review metadata, export, configure provider
- key constraints:
  - do not expose backend complexity by default
  - do not let AI overwrite without review
  - do not allow UI to call providers directly
  - do not commit runtime/private data

---

# 5. Layout Grid

Target breakpoints:

```text
mobile: 360-767px, not primary MVP target
tablet: 768-1199px
desktop: 1200-1599px
wide: 1600px+
```

Max width:

```text
Document content column: readable measure, approximately 720-900px.
App shell: full width.
```

Column system:

```text
Desktop default:
LeftRail 280px
PrimaryCanvas flexible
RightPanel 340px
BottomComposer full width within main area
StatusBar full width
```

Spacing scale:

```text
4px micro
8px base
12px compact
16px standard
24px section
32px major
```

Major regions:

```text
TopBar
LeftRail
PrimaryCanvas
RightPanel
BottomComposer
StatusBar
OverlayLayer
```

Sticky/fixed regions:

```text
TopBar sticky
BottomComposer sticky
StatusBar sticky/low priority
LeftRail fixed within viewport
RightPanel fixed within viewport
```

Scroll behavior:

```text
PrimaryCanvas scrolls independently.
LeftRail and RightPanel can scroll internally.
BottomComposer remains visible unless focus writing mode hides it.
```

---

# 6. Region Specifications

## Region: TopBar

- placement: top, full width
- size/priority: 48-56px height, always visible on desktop
- contents:
  - AppMenu
  - ProjectSwitcher
  - DocumentTitle
  - WorkspaceModeSwitcher
  - AIStatus
  - VaultStatus
  - AutosaveStatus
  - CommandPaletteButton
- component list:
  - TopBar
  - AppMenu
  - ProjectSwitcher
  - WorkspaceModeSwitcher
  - StatusIndicator
- states:
  - ready
  - loading project
  - provider warning
  - vault warning
  - unsaved changes
- actions:
  - open menu
  - switch workspace
  - open command palette
  - open settings/status
- empty/loading/error behavior:
  - no project: show project picker action
  - loading: skeleton title
  - error: show recoverable banner/dropdown
- responsive behavior:
  - mobile/tablet collapse menus into app menu

## Region: LeftRail

- placement: left side
- size/priority: 260-320px, collapsible
- contents by mode:
  - Write: ActiveOutline + DocumentList shortcut
  - Plan: StorySpineTree
  - Sources: SourceList/filters
  - Analyze: AnalysisScopeSelector
  - Export: DocumentOutline
  - Settings: SettingsNav
- component list:
  - LeftRail
  - ActiveOutline
  - DocumentList
  - SourceList
  - StorySpineTree
  - SettingsNav
- states:
  - empty
  - loading
  - ready
  - error
  - collapsed
- actions:
  - jump to item
  - create new item
  - filter/search
  - open context menu
- empty/loading/error behavior:
  - mode-specific empty prompts
  - retry for failed source/list load
- responsive behavior:
  - drawer on tablet/mobile

## Region: PrimaryCanvas

- placement: center
- size/priority: highest priority, flexible
- contents by mode:
  - Write: DocumentCanvas
  - Plan: StoryboardView / SpineView / MatrixView
  - Sources: SourceReader
  - Analyze: AnalysisBoard
  - Export: ExportPreview
  - Settings: SettingsView
- component list:
  - PrimaryCanvas
  - DocumentCanvas
  - StoryboardView
  - SourceReader
  - AnalysisBoard
  - ExportPreview
  - SettingsView
- states:
  - empty
  - loading
  - ready
  - error
  - offline/provider limited
- actions:
  - edit/write
  - select text
  - insert item
  - open context actions
  - drag/reorder where applicable
- empty/loading/error behavior:
  - Write empty: Create or open a document
  - Sources empty: Add source
  - Plan empty: Create or generate spine
- responsive behavior:
  - remains primary on all breakpoints

## Region: RightPanel

- placement: right side
- size/priority: 320-420px, collapsible
- contents:
  - CurrentSectionPanel
  - EvidenceDrawer
  - MetadataReviewPanel
  - StoryCardDetails
  - SourceMetadataPanel
  - ExportReadinessPanel
  - ProviderDetailsPanel
- component list:
  - RightPanel
  - EvidenceDrawer
  - MetadataReviewPanel
  - CurrentSectionPanel
  - ObserverWarningPanel
- states:
  - hidden
  - empty
  - loading
  - ready
  - warning
  - blocked
- actions:
  - approve/edit/reject metadata
  - open source excerpt
  - apply/reject AI suggestion
  - resolve warning
- empty/loading/error behavior:
  - no context selected: show current section summary or quiet empty state
  - error: allow retry
- responsive behavior:
  - drawer/modal on tablet/mobile

## Region: BottomComposer

- placement: bottom of workspace, beneath PrimaryCanvas or spanning main area
- size/priority: 72-160px depending expanded state
- contents:
  - ChatComposer
  - CommandComposer
  - selected context indicator
  - active source count
- component list:
  - BottomComposer
  - ChatComposer
  - CommandInput
  - ContextChip
- states:
  - idle
  - focused
  - AI running
  - provider unavailable
  - context too large
- actions:
  - submit prompt
  - run slash command
  - attach selected source/context
  - cancel running job
- empty/loading/error behavior:
  - placeholder: Ask about this document, section, or source
  - provider error: Keep writing manually, check AI status
- responsive behavior:
  - sticky bottom, compact on mobile

## Region: StatusBar

- placement: bottom edge or below composer
- size/priority: 24-32px, low visual weight
- contents:
  - JobQueueStatus
  - PrivacyModeBadge
  - ActiveSourceCount
  - LastActionStatus
  - ObserverWarningCount
- component list:
  - StatusBar
  - StatusIndicator
  - JobQueueStatus
- states:
  - quiet
  - active job
  - warning
  - blocked
- actions:
  - open job queue
  - open event timeline
  - open observer warnings
- empty/loading/error behavior:
  - quiet if nothing active
- responsive behavior:
  - icon-only on small screens

## Region: OverlayLayer

- placement: above all regions
- size/priority: temporary
- contents:
  - CommandPalette
  - Dialog
  - Drawer
  - Popover
  - Toast
- component list:
  - CommandPalette
  - ModalDialog
  - Toast
- states:
  - open
  - closed
  - loading
  - error
- actions:
  - confirm/cancel/run action
- empty/loading/error behavior:
  - action-specific
- responsive behavior:
  - full-screen modals on mobile

---

# 7. Component Behavior

## DocumentCanvas

- purpose: primary word processor surface
- data inputs:
  - Document, editor state, HeadingAnchors, comments, suggestions, SourceReferences, ImagePlacements
- user actions:
  - write, select, format, insert, comment, accept/reject suggestion
- emitted events:
  - document.saved, heading.created, selection.changed, suggestion.accepted
- visual states:
  - empty, editing, saving, review, focus mode
- validation states:
  - unsaved, saved, stale prompt, unresolved comment
- permission states:
  - editable owner/editor, read-only viewer later
- accessibility notes:
  - keyboard editing, focus visible, semantic headings

## ChatComposer

- purpose: cursor-aware AI/chat command input
- data inputs:
  - CursorContext, active sources, privacy mode, provider status
- user actions:
  - ask, command, cancel, attach context
- emitted events:
  - ai.requested, ai.cancelled
- visual states:
  - idle, focused, running, provider unavailable, blocked by privacy
- validation states:
  - context too large, no provider, no document selected
- permission states:
  - owner/editor only initially
- accessibility notes:
  - labelled input, keyboard submit, escape cancels menu

## ActiveOutline

- purpose: heading navigation plus section prompt/status surface
- data inputs:
  - HeadingAnchors, SectionPrompts, ObserverWarnings
- user actions:
  - jump, add prompt, generate prompt, draft from prompt
- emitted events:
  - outline.generate_prompt_for_heading, section_prompt.generated
- visual states:
  - no headings, headings ready, stale prompt warning
- validation states:
  - missing prompt, stale prompt, linked story node missing
- permission states:
  - editable owner/editor
- accessibility notes:
  - tree navigation semantics

## RightPanel / EvidenceDrawer

- purpose: show source support, current section context, metadata review, warnings
- data inputs:
  - selected item, analysis results, source refs, metadata proposals
- user actions:
  - approve, reject, open source, resolve warning
- emitted events:
  - metadata.approved, observer.warning_resolved, source_reference.inserted
- visual states:
  - hidden, empty, ready, warning, blocked
- validation states:
  - source missing, metadata low confidence, unknown rights
- permission states:
  - owner/editor
- accessibility notes:
  - focus trap in drawer mode, labelled regions

---

# 8. Interaction Flow

## Flow: Ask AI from cursor

- default state: document open, cursor in document, composer idle
- user action: user types request into ChatComposer
- system response:
  - build CursorContext
  - check provider and privacy policy
  - route through AI gateway
  - return answer/suggestion/patch
- confirmation step:
  - document changes require preview/accept
- success state:
  - suggestion inserted or answer displayed
- failure state:
  - provider unavailable, context too large, privacy blocked
- recovery action:
  - retry smaller context, change model, keep writing manually

## Flow: Generate prompt for H1

- default state: H1 exists with no prompt
- user action: click Add/Generate Prompt in ActiveOutline
- system response:
  - build heading/project/story/source context
  - generate editable SectionPrompt
- confirmation step:
  - user approves/edits prompt
- success state:
  - prompt status ready
- failure state:
  - provider unavailable or insufficient context
- recovery action:
  - write prompt manually

## Flow: Insert image at cursor

- default state: document open, cursor placed
- user action: Insert > Image From File
- system response:
  - store MediaAsset in vault
  - create ImagePlacement anchored to cursor
  - propose metadata
- confirmation step:
  - user reviews metadata/alt/caption
- success state:
  - image appears in document with metadata status
- failure state:
  - vault unavailable or unsupported file
- recovery action:
  - reconnect vault or choose another file

---

# 9. Content + Copy Requirements

Headings:

```text
Write
Plan
Sources
Analyze
Export
Settings
```

Labels:

```text
Add Source
Generate Prompt
Find Sources
Review Metadata
Export Markdown
Check Ollama
```

Helper text:

```text
AI suggestions are previews until you accept them.
Private sources stay local unless you enable cloud use.
Metadata was generated. Review before export.
```

Empty state copy:

```text
Start a document or generate a spine from a premise.
Add a source to make writing assistance source-aware.
```

Error copy:

```text
Local AI is not reachable. You can keep writing manually.
Your vault is unavailable. Saving and imports are paused.
```

Safety/privacy copy:

```text
This action may send selected text to a cloud provider. Continue?
```

Plain-language requirements:

```text
Avoid engine jargon in default UI.
Use verbs: Write, Add, Review, Export, Restore.
```

---

# 10. Data + Qual / Quant Display

Data displayed:

```text
Document title/content
Heading outline
Section prompt status
Source list and snippets
Metadata review fields
Provider status
Observer warning count
```

Qualitative display:

```text
AI rationale
source summary
prompt text
metadata description
warning explanation
```

Quantitative display:

```text
word count
active source count
comment count
suggestion count
metadata confidence
source relevance
job progress
```

---

# 11. Event / Ledger / Audit Display

Events shown:

```text
last save
AI job running/completed
source imported
metadata needs review
snapshot created
export generated
```

Ledger links:

```text
StatusBar opens timeline.
Document history opens document-specific events.
Diagnostics opens full event log in expert mode.
```

Audit indicators:

```text
AI-applied changes
rights changes
cloud provider use
rollback
```

Calendar/timeline links:

```text
File > Restore From Snapshot
Tools > Event Timeline
StatusBar > Last Action
```

Hidden raw log details:

```text
private prompts
source text
document text
provider raw payloads
```

---

# 12. Safety / Privacy / RBAC UI

Visibility labels:

```text
Local
Vault Only
Project
Cloud Off
Cloud Requires Approval
```

Protected data display:

```text
show safe summaries and IDs, not private raw payloads
```

Disabled action explanations:

```text
AI unavailable because Ollama is not reachable.
Export blocked because two images need alt text.
Cloud use is disabled in this project.
```

Confirmation requirements:

```text
cloud AI with private context
AI patch apply
metadata approve batch
rights migration
rollback replace current
```

Redaction states:

```text
redacted path
vault reference only
private text hidden
```

Local/vault boundaries:

```text
Vault status always visible or one click away.
```

---

# 13. AI / Ibal UI

Ibal placement:

```text
ChatComposer
RightPanel explanations
Analyze workspace
StatusBar warnings
MetadataReviewPanel
ExportReadinessPanel
```

Available prompts:

```text
Continue from cursor
Rewrite selection
Find sources for section
Generate section prompt
Draft from prompt
Explain this warning
Generate metadata
```

Explanation surfaces:

```text
Why this source?
Why this metadata?
Why export blocked?
Why prompt stale?
```

Generation actions:

```text
text suggestions
section prompts
source summaries
alt text
captions
image prompts
story spine drafts
```

Confirmation requirements:

```text
apply text
approve metadata
change rights
use cloud
restore rollback
```

Blocked actions:

```text
silent overwrite
silent rights change
silent cloud fallback
```

---

# 14. Accessibility + Regulation UX

Keyboard path:

```text
Alt/menu access
Command palette
Tab order through shell
Editor shortcuts
Escape closes overlays
```

Focus management:

```text
Modals trap focus.
Drawers restore focus on close.
AI suggestion application returns focus to document.
```

ARIA landmarks:

```text
banner TopBar
navigation LeftRail
main PrimaryCanvas
complementary RightPanel
form BottomComposer
status StatusBar
```

Contrast/readability:

```text
high contrast support
readable document measure
visible focus rings
```

Motion constraints:

```text
reduce or disable panel animations under reduced motion
no flashing indicators
```

Sensory load concerns:

```text
quiet default UI
badges instead of alarms
warnings grouped in panels
```

Cognitive load controls:

```text
progressive disclosure
focus writing mode
plain labels
restore/recovery visible
```

Safe exit/recovery actions:

```text
cancel AI job
close panel
undo/redo
restore snapshot as copy
continue writing manually if AI fails
```

---

# 15. Responsive States

## Mobile

- layout: single-column
- hidden/collapsed regions:
  - LeftRail as drawer
  - RightPanel as drawer
  - menu collapsed
- priority actions:
  - Write, composer, save, command palette

## Tablet

- layout: two-column optional
- navigation behavior:
  - LeftRail collapsible
- context rail behavior:
  - RightPanel drawer or split panel

## Desktop

- layout:
  - TopBar full width
  - LeftRail + PrimaryCanvas + RightPanel
  - BottomComposer sticky
  - StatusBar low profile
- multi-column behavior:
  - split view supported
- power user controls:
  - semantic markup, prompt blocks, source references toggles

---

# 16. Validation Rules

This wireframe spec is valid when:

```text
it maps to page-system-map.md
every region has purpose and behavior
components have data/actions/states
empty/loading/error states are specified
accessibility and regulation UX are addressed
safety/privacy/RBAC states are visible
implementation can proceed without layout guessing
```

---

# 17. Freshness Rules

Mark stale when:

```text
page-system map changes
IA map changes
component contracts change
product requirements change
data model changes
event model changes
accessibility requirements change
editor engine choice changes
```

---

# 18. Acceptance Criteria

```text
A developer can build the first shell layout from this spec.
A designer can review the app structure without guessing intent.
AI chat, document editor, outline, right panel, and status regions are all defined.
Safety/privacy states are represented.
Responsive behavior is described enough for MVP desktop/tablet.
```

---

# 19. Open Gaps

```text
visual design tokens
exact component styling
editor engine behavior
component contracts
implemented routes
storybook/preview environment
```
