# Page / System Map: screen_scraper

## Template Metadata

- template_id: page-system-map-template
- template_version: 1.0.0
- template_status: screen_scraper_initial
- artifact_type: page_system_map
- required_for: every_page_screen_microsite_or_major_system_surface

---

# 1. Artifact Metadata

- artifact_id: screen-scraper-page-system-map-v1
- tenant_id: local_default
- project_id: screen_scraper
- parent_id: screen-scraper-information-architecture-map-v1
- page_or_system_name: Core Workspace Shell
- route_or_location: /app/:projectId/*
- product_area: frontend_workspace_system
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

Define the major front-end surfaces for the cooperative word processor so design, implementation, QA, automation, and future xi-io.net handoff understand exactly how the UI is composed.

This map covers the initial app shell and primary workspaces:

```text
Write
Plan
Sources
Analyze
Export
Settings
```

---

# 3. Source Evidence

## Tier 0 Local Evidence

- local files:
  - /mnt/data/scripts_plan.md
- old version lineage:
  - none confirmed for this repo
- screenshots/previews:
  - local path screenshots from user
- notes:
  - UI must remain a writing interface, not a system dashboard.

## Tier 1 Repo Evidence

- repo files:
  - docs/planning/information-architecture-map.md
  - docs/ui-composition-contract-v1.md
  - docs/workspace-modes-v1.md
  - docs/component-inventory-v1.md
  - docs/editor-context-and-application-menu-v1.md
  - docs/active-outline-and-section-prompts-v1.md
  - docs/word-processor-requirements-v1.md
  - docs/backend-research-integration-v1.md
- components/routes:
  - not implemented yet
- styles:
  - not implemented yet

## Tier 2 Management Evidence

- Workbench docs:
  - xi-io.net docs/templates/universal/page-system-map-template.md
- system specs:
  - docs/backend-engine-alignment-v1.md
- wireframes:
  - docs/planning/wireframe-spec.md, planned

## Conversation / Decision Evidence

- conversation_record_ids:
  - current planning conversation
- decision_ids:
  - use slot-based workspace shell
  - preserve simple default UI
  - AI chat must be cursor/selection/section aware
  - actions must route through command registry

## Missing Evidence

- final React route implementation
- final component implementation
- final editor engine
- visual design tokens

---

# 4. Surface Identity

- page/system name: Core Workspace Shell
- route/path: /app/:projectId/*
- parent navigation: project root
- child surfaces:
  - /write/:projectId/:documentId
  - /plan/:projectId
  - /sources/:projectId
  - /analyze/:projectId
  - /export/:projectId
  - /settings/:projectId
- microsite type if applicable: not applicable
- primary user intent: write and revise long-form documents with AI/source support
- primary system purpose: route user activity through document, source, AI, event, metadata, and egress services

---

# 5. Entry + Exit Points

## Entry Points

- navigation link: workspace mode switcher
- search result: search jumps to document/source/story/event
- calendar/timeline link: snapshot/event opens related document/source/export
- notification: observer warning opens affected item
- related artifact/event: evidence drawer, metadata review, export readiness
- direct route: route paths listed above

## Exit Points

- next action: write, import, analyze, export, configure
- related page: Plan/Sources/Analyze/Export/Settings
- save/submit/commit: document save, metadata approval, export generation
- cancel/back: close panel, return to Write
- error/recovery: provider health panel, diagnostics, retry, restore snapshot

---

# 6. Layout Regions

## Region: TopBar

- purpose: orientation, menus, project/document identity, global status
- contained components:
  - AppMenu
  - ProjectSwitcher
  - DocumentTitle
  - WorkspaceModeSwitcher
  - AIStatus
  - VaultStatus
  - AutosaveStatus
  - CommandPaletteButton
- data required:
  - Project, Document, ProviderStatus, VaultStatus, AutosaveState
- actions:
  - open menus, switch mode, open command palette
- empty state:
  - project not selected
- loading state:
  - loading project/document metadata
- error state:
  - project unavailable, provider unavailable
- responsive behavior:
  - collapse menus into app menu on narrow screens

## Region: LeftRail

- purpose: workspace navigation and contextual lists
- contained components:
  - ActiveOutline
  - DocumentList
  - SourceList
  - StorySpineTree
  - SettingsNav
- data required:
  - workspace mode, document outline, sources, story nodes
- actions:
  - jump to heading, open document/source/card/settings section
- empty state:
  - no document/source/card available
- loading state:
  - skeleton list
- error state:
  - list unavailable
- responsive behavior:
  - collapsible drawer on tablet/mobile

## Region: PrimaryCanvas

- purpose: main work surface
- contained components:
  - DocumentCanvas
  - StoryboardView
  - SourceReader
  - AnalysisBoard
  - ExportPreview
  - SettingsView
- data required:
  - mode-specific objects
- actions:
  - edit document, plan, read source, inspect analysis, export, configure
- empty state:
  - mode-specific empty state
- loading state:
  - page-level skeleton
- error state:
  - recoverable error panel
- responsive behavior:
  - always highest priority region

## Region: RightPanel

- purpose: contextual intelligence, evidence, metadata, planning, warnings
- contained components:
  - CurrentSectionPanel
  - EvidenceDrawer
  - MetadataReviewPanel
  - SourceMetadataPanel
  - StoryCardDetails
  - ExportReadinessPanel
  - ProviderDetailsPanel
- data required:
  - cursor context, selected item, observer warnings, analysis results
- actions:
  - approve metadata, open source, apply suggestion, resolve warning
- empty state:
  - no contextual item selected
- loading state:
  - panel skeleton
- error state:
  - failed to load context
- responsive behavior:
  - drawer/modal on smaller screens

## Region: BottomComposer

- purpose: AI chat, command input, contextual action composer
- contained components:
  - ChatComposer
  - CommandComposer
  - SelectionActionBar
- data required:
  - CursorContext, selected text, active sources, AI mode
- actions:
  - submit chat, run command, request AI action
- empty state:
  - placeholder prompt
- loading state:
  - AI job in progress
- error state:
  - provider unavailable or context too large
- responsive behavior:
  - sticky bottom, compact on mobile

## Region: StatusBar

- purpose: low-distraction system state
- contained components:
  - JobQueueStatus
  - ActiveSourceCount
  - PrivacyModeBadge
  - LastActionStatus
  - ObserverWarningCount
- data required:
  - job queue, active source set, privacy mode, observer warnings
- actions:
  - open job queue, timeline, warnings panel
- empty state:
  - no active jobs/warnings
- loading state:
  - status pending
- error state:
  - system warning
- responsive behavior:
  - compact icons on narrow screens

## Region: OverlayLayer

- purpose: temporary interactions
- contained components:
  - CommandPalette
  - Dialog
  - Drawer
  - Popover
  - Toast
- data required:
  - registered actions and active context
- actions:
  - run action, confirm, cancel
- empty state:
  - no action/result
- loading state:
  - modal progress
- error state:
  - action failed with recovery
- responsive behavior:
  - full-screen modal on mobile

---

# 7. Components

Initial critical components:

```text
AppShell
TopBar
LeftRail
PrimaryCanvas
RightPanel
BottomComposer
StatusBar
CommandPalette
DocumentCanvas
ChatComposer
ActiveOutline
SourceDrawer
EvidenceDrawer
MetadataReviewPanel
ModelManager
EventTimeline
```

Each requires a formal component contract before implementation hardens.

---

# 8. Data Model Touchpoints

Objects read:

```text
Project
Document
HeadingAnchor
SectionPrompt
StoryNode
SourceArtifact
SourceReference
MediaAsset
InsertedItemMetadata
ProjectRightsProfile
Snapshot
Event
ObserverWarning
ProviderConfig
```

Objects created:

```text
Document
SectionPrompt
StoryNode
SourceArtifact
MediaAsset
InsertedItemMetadata
Snapshot
ExportJob
```

Objects updated:

```text
Document
SectionPrompt
StoryNode
InsertedItemMetadata
ImagePlacement
ProjectRightsProfile
ProviderConfig
```

Local-only data:

```text
project configuration
source metadata
provider health
```

Vault-only data:

```text
private document text
raw source text
generated media
exports
snapshots
embeddings
```

Repo-safe data:

```text
planning docs
schemas
example configs without secrets
```

---

# 9. Qual / Quant Touchpoints

## Qualitative

```text
section prompt text
AI suggestion rationale
source summary
metadata description
observer warning explanation
story card notes
comments
```

## Quantitative

```text
word count
active source count
comment count
suggestion count
metadata confidence
source relevance
provider latency
job progress
observer warning count
```

---

# 10. Events / Ledger / Audit

Events emitted:

```text
document.created
document.saved
heading.created
section_prompt.generated
source.imported
source_reference.inserted
metadata.generated
metadata.approved
image.inserted
ai.requested
ai.completed
snapshot.created
export.generated
observer.warning_created
```

Events consumed:

```text
ollama.health_checked
provider.unavailable
analysis.completed
observer.warning_resolved
```

Ledger entries created:

```text
document
source
ai
metadata
media
snapshot
export
observer
```

Audit entries required:

```text
AI patch accepted
metadata approved
rights changed
cloud provider enabled
rollback completed
export generated
```

Calendar/timeline projection:

```text
project history
document history
source history
export history
snapshot/rollback history
error history
```

---

# 11. Interactions + Threads

Allowed interaction types:

```text
comment
annotation
AI suggestion
metadata review
observer warning
source note
story card note
decision note
```

Where comments/notes attach:

```text
document range
heading
source artifact/excerpt
metadata item
story card
event
snapshot
export job
```

Thread behavior:

```text
max default nesting: 2
states: open, needs_review, resolved, archived
```

Free-floating comments allowed: no

Decision promotion behavior:

```text
important review outcomes can become decision notes and ledger events
```

Moderation/safety checks:

```text
private content stays local/vault
cloud-bound actions require policy
```

---

# 12. Permissions / Visibility

Roles allowed:

```text
owner initially
editor/viewer later
agent_limited for backend tools
```

Unavailable states:

```text
Ollama offline
vault unavailable
document missing
source missing
provider context too large
```

Hidden states:

```text
advanced bins hidden by default
raw event payloads hidden by default
developer overlays hidden by default
```

Disabled states:

```text
AI actions disabled if provider unavailable
Export disabled if no document selected
Cloud disabled unless configured
Destructive rollback disabled without confirmation
```

Visibility labels:

```text
public
project
local_only
vault_only
```

---

# 13. Accessibility + Regulation UX

Keyboard behavior:

```text
menu navigation
editor keyboard shortcuts
focusable panels
skip to editor
skip to composer
command palette access
```

Focus order:

```text
TopBar → LeftRail → PrimaryCanvas → RightPanel → BottomComposer → StatusBar
```

ARIA landmarks:

```text
banner
navigation
main
complementary
form
status
```

Motion/sensory constraints:

```text
reduced motion support
no flashing warnings
subtle status changes
```

Cognitive load controls:

```text
progressive disclosure
simple labels
collapsible advanced panels
plain-language warnings
focus writing mode
```

Plain-language copy needs:

```text
explain provider failures
explain privacy boundaries
explain metadata review
explain export blockers
```

Regulation support patterns:

```text
manual writing continues when AI fails
safe exit from modal flows
undo/restore paths visible
```

---

# 14. Responsive Behavior

Mobile:

```text
not primary MVP target
single-column
LeftRail and RightPanel as drawers
BottomComposer sticky
```

Tablet:

```text
primary target after desktop
collapsible side panels
split view available
```

Desktop:

```text
primary MVP target
slot-based shell
resizable side panels
menu bar visible
```

Wide screen:

```text
document centered
outline and context panel can remain open
source split view supported
```

Print/export:

```text
handled through Export workspace, not live shell
```

---

# 15. Failure + Recovery States

Failure: Ollama unavailable
- cause: service stopped, wrong port, no models
- user-facing message: Local AI is not reachable. You can keep writing manually.
- recovery action: Check Ollama Status, Refresh Models, Open AI Settings
- event/log/audit created: provider.unavailable, ai.failed when request attempted

Failure: vault unavailable
- cause: path missing, drive unmounted, permission issue
- user-facing message: Local vault is not available. Saving/importing is paused.
- recovery action: Reconnect vault, choose new vault, retry
- event/log/audit created: vault.unavailable

Failure: metadata needs review
- cause: low confidence, unknown rights, missing alt text
- user-facing message: Metadata needs review before clean export.
- recovery action: Open Metadata Review Panel
- event/log/audit created: metadata.review_requested

Failure: export blocked
- cause: unresolved blockers
- user-facing message: Export has blockers. Review before continuing.
- recovery action: Open Export Readiness Panel
- event/log/audit created: export.blocked

---

# 16. Validation Rules

A page/system map is valid when:

```text
entry and exit points are defined
all layout regions are mapped
all critical components are listed
data/events/permissions are explicit
empty/loading/error states exist
accessibility/regulation UX is addressed
comments/interactions are event-bound or object-bound
acceptance criteria are testable
```

---

# 17. Freshness Rules

Mark stale when:

```text
routes change
layout regions change
component contracts change
data model changes
event taxonomy changes
permissions change
visibility changes
wireframes change
storyboards change
```

---

# 18. Acceptance Criteria

```text
A developer can scaffold the app shell without guessing regions.
Each major workspace has a route and purpose.
Each region has state and responsive behavior.
Events/data/permissions are represented.
Default UI remains writing-first.
```

---

# 19. Open Gaps

```text
formal wireframe spec
component contracts
visual design tokens
final editor engine
route implementation
frontend state management choice
```
