# Component Contract: ChatComposer

## Template Metadata

- template_id: component-contract-template
- template_version: 1.0.0
- template_status: screen_scraper_initial
- artifact_type: component_contract
- required_for: every_reusable_component_or_major_ui_module

---

# 1. Artifact Metadata

- artifact_id: screen-scraper-component-chat-composer-v1
- tenant_id: local_default
- project_id: screen_scraper
- parent_id: screen-scraper-core-workspace-wireframe-v1
- component_name: ChatComposer
- component_type: major_ui_module
- product_area: ai_chat_and_command_input
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

ChatComposer is the primary conversational and command input for the writing workspace. It lets the user ask the AI for help while preserving live awareness of the current document, cursor, selection, heading path, section prompt, active source set, privacy mode, and provider state.

It must feel like a natural chat box, but every action must route through the backend AI gateway and command/action registry.

---

# 3. Source Evidence

## Tier 0 Local Evidence

- local files:
  - /mnt/data/scripts_plan.md
- notes:
  - Source direction says users spend most time writing collaboratively with AI, while deeper systems remain hidden.

## Tier 1 Repo Evidence

- repo files:
  - docs/editor-context-and-application-menu-v1.md
  - docs/backend-research-integration-v1.md
  - docs/providers/ollama-provider-spec.md
  - docs/planning/wireframe-spec.md
  - docs/events/event-model.yaml
  - docs/development-readiness-gate-v1.md
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
  - UI must not call Ollama directly.
  - AI document changes require preview/approval.

## Missing Evidence

- command/action registry contract
- backend AI gateway implementation
- final model routing defaults

---

# 4. Component Identity

- component name: ChatComposer
- component family: input / AI / command
- component role: context-aware AI and command entry point
- parent surfaces:
  - BottomComposer
  - Write workspace
  - Sources workspace, contextual variant
  - Plan workspace, contextual variant
- child components:
  - CommandInput
  - ContextChip
  - ProviderStatusInline
  - SubmitButton
  - CancelJobButton
  - Attachment/SourceContextButton later
- reusable: yes
- project-specific: yes, until generic xi-io composer abstraction exists

---

# 5. Inputs / Props / Data

- name: cursorContext
  - type: CursorContext
  - required: true
  - default: null
  - source object: DocumentCanvas/context service
  - validation: document_id and current anchor required when document open
  - visibility constraints: selected text preview may be private
  - safe for repo examples: no

- name: activeSources
  - type: SourceReference[] | SourceArtifact[]
  - required: false
  - default: []
  - source object: SourceLibraryService
  - validation: valid project sources
  - visibility constraints: source excerpts vault_only
  - safe for repo examples: no

- name: providerStatus
  - type: ProviderStatus
  - required: true
  - default: unknown
  - source object: AIGateway/OllamaProvider
  - validation: reachable|unreachable|no_models|unknown
  - visibility constraints: local path details local_only
  - safe for repo examples: partial

- name: privacyMode
  - type: local_only|local_first|ask_before_cloud|cloud_assisted
  - required: true
  - default: local_only
  - source object: ProjectSettings
  - validation: enum
  - visibility constraints: project
  - safe for repo examples: yes

- name: availableActions
  - type: RegisteredAction[]
  - required: true
  - default: []
  - source object: CommandRegistry
  - validation: action ids must be registered
  - visibility constraints: project
  - safe for repo examples: yes

---

# 6. Output / Events

- name: ai.requested
  - trigger: user submits natural language AI request
  - payload: action_id or inferred intent, cursor_context_ref, privacy mode, provider id
  - ledger impact: AI request event
  - audit impact: yes if document-affecting
  - parent handler: AIGatewayService
  - failure behavior: show provider/privacy/context error

- name: command.requested
  - trigger: user enters slash command or command palette-like action
  - payload: command/action id and arguments
  - ledger impact: depends on action
  - audit impact: depends on action
  - parent handler: CommandRegistry
  - failure behavior: show unknown/invalid command recovery

- name: ai.cancelled
  - trigger: user cancels running job
  - payload: job_id
  - ledger impact: optional job event
  - audit impact: no
  - parent handler: JobQueueService
  - failure behavior: mark cancellation failed if job already completed

---

# 7. States

## default

- visible UI: composer textarea/input, placeholder, submit button
- copy: Ask about this document, section, or source…
- available actions: type, submit, open command suggestions
- inaccessible actions: none
- recovery path: not applicable

## loading

- visible UI: running indicator, cancel button
- copy: Working locally…
- available actions: cancel, continue editing elsewhere
- inaccessible actions: submit duplicate request unless allowed later
- recovery path: cancel job

## empty

- visible UI: placeholder only
- copy: Ask AI to continue, rewrite, find sources, or generate a prompt.
- available actions: type or choose suggested action
- inaccessible actions: submit empty message
- recovery path: type request

## error

- visible UI: inline error message
- copy: Local AI is not reachable. You can keep writing manually.
- available actions: Check Ollama Status, Open AI Settings, Retry
- inaccessible actions: AI submit until provider returns
- recovery path: provider health check

## disabled

- visible UI: disabled input
- copy: AI is disabled for this project.
- available actions: open settings if owner
- inaccessible actions: submit
- recovery path: enable provider/settings

## permission restricted

- visible UI: disabled/cloud action warning
- copy: This action needs permission because it may use private context.
- available actions: open privacy prompt/settings
- inaccessible actions: submit cloud-bound action
- recovery path: approve or use local-only mode

## validation warning

- visible UI: context warning chip
- copy: This request may exceed the selected model context.
- available actions: submit smaller context, change model, ask for summary first
- inaccessible actions: none unless blocked
- recovery path: adjust context

## validation blocked

- visible UI: blocked message
- copy: This request is blocked by privacy settings.
- available actions: change settings, remove private sources, cancel
- inaccessible actions: submit blocked request
- recovery path: update privacy/routing policy

## success/confirmation

- visible UI: response/suggestion appears in appropriate surface
- copy: Review the suggestion before applying.
- available actions: accept, reject, edit, save as block
- inaccessible actions: silent apply
- recovery path: reject or edit

---

# 8. Interactions

- primary action: submit context-aware AI request
- secondary actions:
  - run slash command
  - choose suggested action
  - attach active source context
  - cancel running job
  - open AI settings/model manager
- keyboard actions:
  - Enter submit if configured
  - Shift+Enter newline
  - Escape close suggestions/cancel focus
  - slash opens command mode
- hover/focus behavior:
  - show context chips and helper actions
- mobile/touch behavior:
  - larger tap targets, drawer suggestions
- confirmation needs:
  - cloud context use
  - destructive action
  - applying AI patch handled outside composer
- destructive action safeguards:
  - composer cannot directly destroy content

---

# 9. Data + Qual / Quant Handling

## Qualitative

- user notes/comments: user prompt text, not stored in repo-safe logs
- labels/context: current document, heading path, selected text indicator
- subjective state: user request intent
- rationale: AI explanation appears with result, not hidden

## Quantitative

- counts: selected text length, active source count
- scores: context budget estimate
- status values: provider reachable, model selected, privacy mode
- progress: job running/progress where available
- timing: latency displayed in expert diagnostics only

---

# 10. Safety / Privacy / RBAC

- sensitive data display: selected text and source snippets are private
- redaction behavior: prompts are not written to repo-safe logs
- visibility labels: Local, Cloud Requires Approval, Vault Context
- role restrictions: owner/editor can run AI; viewer later read-only ask may be limited
- agent/tool restrictions: AI calls only through backend gateway
- local/vault boundaries: private prompt/context stored in local DB/vault only if retained

---

# 11. Accessibility + Regulation UX

- semantic element requirements:
  - labelled textarea/input
  - status region for job state
- ARIA requirements:
  - aria-describedby for privacy/provider warnings
  - command suggestion list should be navigable
- keyboard focus order:
  - input → suggestions → submit/cancel/context buttons
- reduced motion needs:
  - no animated typing required
- sensory load constraints:
  - quiet status, no aggressive spinners
- cognitive load controls:
  - plain placeholder, suggested actions, hidden advanced controls
- plain-language copy:
  - avoid provider jargon in default errors

---

# 12. Styling / Token Use

- design tokens:
  - spacing, typography, focus, surface, border, status
- spacing:
  - compact but not cramped, 8px base
- typography:
  - readable input text
- color roles:
  - provider/status semantic, not color-only
- surface/elevation:
  - composer distinct but calm
- responsive behavior:
  - sticky bottom, compact mobile
- forbidden inline styles:
  - no one-off inline styles

---

# 13. Testing Requirements

- unit tests:
  - renders provider states
  - validates empty submit blocked
  - shows privacy warning
- integration tests:
  - submit request routes to backend action
  - slash command routes to command registry
  - provider unavailable blocks request gracefully
- accessibility tests:
  - labelled input
  - keyboard navigation
  - status announcements
- visual regression:
  - idle, running, error, blocked
- permission state tests:
  - cloud disabled
- data state tests:
  - context too large warning

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
command registry changes
AI gateway changes
provider model changes
CursorContext changes
privacy routing changes
chat UX changes
```

---

# 16. Acceptance Criteria

```text
ChatComposer can submit context-aware requests through backend only.
Provider/privacy/context failure states are visible and recoverable.
AI document changes cannot be silently applied from composer.
Slash/command input is planned to share the action registry.
```

---

# 17. Open Gaps

```text
command/action registry contract
exact chat transcript persistence model
streaming response behavior
model role mapping
provider fallback policy
```
