# Command and Action Registry v1

## Status

This document defines the shared command/action layer for `screen_scraper`.

It exists to prevent menus, buttons, keyboard shortcuts, slash commands, BBCode-like syntax, chat intents, context menus, and automation hooks from becoming separate implementations of the same behavior.

---

# 1. Core Rule

Every user-visible action must resolve to a registered command/action ID.

```text
menu item
button
toolbar control
keyboard shortcut
slash command
[[block]] action
#tag / @reference action
chat intent
context menu
AI suggested action
```

All of these must call the same registered action rather than duplicating behavior.

---

# 2. Product Principle

The UI can offer many ways to do something, but the system should only have one canonical action path.

```text
Many entrances.
One action registry.
One backend service path.
One event trail.
```

---

# 3. Source Evidence

## Tier 0 Local Evidence

- local files:
  - /mnt/data/scripts_plan.md
- notes:
  - The source direction emphasizes a simple chat/document surface with hidden structure, optional tags, references, and blocks.

## Tier 1 Repo Evidence

- repo files:
  - docs/editor-context-and-application-menu-v1.md
  - docs/planning/information-architecture-map.md
  - docs/planning/page-system-map.md
  - docs/planning/wireframe-spec.md
  - docs/components/chat-composer.md
  - docs/components/document-canvas.md
  - docs/components/active-outline.md
  - docs/events/event-model.yaml
  - docs/data/document-data-model.yaml
  - docs/development-readiness-gate-v1.md
- code files:
  - not implemented yet

## Tier 2 Management Evidence

- xi-io alignment:
  - actions should emit events
  - actions should respect egress approval gates
  - actions should preserve privacy boundaries
  - actions should remain compatible with future xi-io.net management

## Missing Evidence

- implementation location
- frontend state management choice
- backend service routes
- exact keyboard shortcut set

---

# 4. Registry Object Model

## RegisteredAction

Suggested shape:

```json
{
  "id": "ai.continue_from_cursor",
  "label": "Continue From Cursor",
  "description": "Ask the active AI provider to continue from the current document cursor.",
  "category": "ai",
  "menu_path": "AI > Continue From Cursor",
  "surfaces": ["menu", "chat", "slash_command", "context_menu"],
  "requires": {
    "project": true,
    "document": true,
    "cursor_context": true,
    "selection": false,
    "provider": true,
    "vault": false
  },
  "permissions": {
    "roles": ["owner", "editor"],
    "privacy_policy": "local_first",
    "cloud_requires_confirmation": true
  },
  "input_schema": "schemas/actions/ai.continue_from_cursor.input.json",
  "output_mode": "suggestion_patch",
  "backend_service": "ai_gateway",
  "backend_action": "writing.continue_from_cursor",
  "approval_gate": "required_for_document_patch",
  "events": ["ai.requested", "ai.completed", "suggestion.created"],
  "audit_required": true,
  "enabled_when": ["document_open", "provider_available"],
  "disabled_message": "Open a document and connect a local AI provider first."
}
```

---

# 5. Action Categories

```text
file
edit
insert
format
view
plan
sources
tools
ai
window
help
metadata
rights
media
export
event
settings
developer
```

---

# 6. Required MVP Actions

## File

```yaml
- id: file.new_document
  label: New Document
  surfaces: [menu, command_palette]
  backend_service: document_service
  backend_action: document.create
  events: [document.created]
  approval_gate: not_required

- id: file.save_document
  label: Save
  surfaces: [menu, keyboard_shortcut, toolbar]
  backend_service: document_service
  backend_action: document.save
  events: [document.saved]
  approval_gate: not_required

- id: file.create_snapshot
  label: Create Snapshot
  surfaces: [menu, command_palette]
  backend_service: snapshot_service
  backend_action: snapshot.create
  events: [snapshot.created]
  approval_gate: not_required

- id: file.export_markdown
  label: Export Markdown
  surfaces: [menu, export_workspace, command_palette]
  backend_service: export_service
  backend_action: export.markdown
  events: [export.generated]
  approval_gate: warning_if_blockers
```

## Edit

```yaml
- id: edit.undo
  label: Undo
  surfaces: [menu, keyboard_shortcut, toolbar]
  backend_service: editor_runtime
  backend_action: editor.undo
  events: []
  approval_gate: not_required

- id: edit.redo
  label: Redo
  surfaces: [menu, keyboard_shortcut, toolbar]
  backend_service: editor_runtime
  backend_action: editor.redo
  events: []
  approval_gate: not_required

- id: edit.find
  label: Find
  surfaces: [menu, keyboard_shortcut, command_palette]
  backend_service: frontend_ui
  backend_action: find.open
  events: []
  approval_gate: not_required

- id: edit.insert_comment
  label: Insert Comment
  surfaces: [menu, context_menu, toolbar]
  backend_service: document_service
  backend_action: comment.create
  events: [comment.created]
  approval_gate: not_required
```

## Insert

```yaml
- id: insert.heading
  label: Insert Heading
  surfaces: [menu, toolbar, slash_command]
  backend_service: editor_runtime
  backend_action: editor.insert_heading
  events: [heading.created]
  approval_gate: not_required

- id: insert.source_reference
  label: Insert Source Reference
  surfaces: [menu, source_drawer, context_menu]
  backend_service: document_service
  backend_action: source_reference.insert
  events: [source_reference.inserted]
  approval_gate: not_required_or_warning_if_restricted

- id: insert.section_prompt
  label: Insert Section Prompt
  surfaces: [menu, active_outline, slash_command]
  backend_service: planning_service
  backend_action: section_prompt.create
  events: [section_prompt.created]
  approval_gate: not_required

- id: insert.image_from_file
  label: Image From File
  surfaces: [menu, toolbar, command_palette]
  backend_service: media_service
  backend_action: image.insert_from_file
  events: [image.uploaded, image.inserted, metadata.generated]
  approval_gate: metadata_review_required
```

## Plan

```yaml
- id: plan.generate_prompt_for_heading
  label: Generate Prompt For Current Heading
  surfaces: [plan_menu, active_outline, chat_intent, command_palette]
  backend_service: planning_service
  backend_action: outline.generate_prompt_for_heading
  events: [ai.requested, section_prompt.generated]
  approval_gate: user_review_required

- id: plan.create_story_node_from_heading
  label: Create Story Card From Heading
  surfaces: [plan_menu, active_outline, context_menu]
  backend_service: story_spine_service
  backend_action: story_node.create_from_heading
  events: [plan.node_created]
  approval_gate: not_required

- id: plan.find_stale_prompts
  label: Find Stale Prompts
  surfaces: [plan_menu, analyze_workspace, command_palette]
  backend_service: observer_service
  backend_action: observer.find_stale_prompts
  events: [observer.warning_created]
  approval_gate: not_required
```

## Sources

```yaml
- id: sources.add_source
  label: Add Source
  surfaces: [sources_menu, source_drawer, command_palette]
  backend_service: source_library_service
  backend_action: source.import
  events: [source.imported]
  approval_gate: not_required

- id: sources.find_for_current_section
  label: Find Sources For Current Section
  surfaces: [sources_menu, source_drawer, ai_menu, chat_intent]
  backend_service: retrieval_service
  backend_action: source.find_for_current_section
  events: [retrieval.performed, analysis.completed]
  approval_gate: not_required_local_only

- id: sources.attach_to_document
  label: Attach Source To Document
  surfaces: [source_drawer, context_menu]
  backend_service: source_library_service
  backend_action: source.attach_to_document
  events: [source.attached_to_document]
  approval_gate: not_required
```

## Metadata

```yaml
- id: metadata.approve
  label: Approve Metadata
  surfaces: [metadata_review_panel, command_palette]
  backend_service: metadata_service
  backend_action: metadata.approve
  events: [metadata.approved]
  approval_gate: user_intent_required

- id: metadata.edit
  label: Edit Metadata
  surfaces: [metadata_review_panel]
  backend_service: metadata_service
  backend_action: metadata.edit
  events: [metadata.edited]
  approval_gate: user_intent_required

- id: metadata.reject
  label: Reject Metadata
  surfaces: [metadata_review_panel]
  backend_service: metadata_service
  backend_action: metadata.reject
  events: [metadata.rejected]
  approval_gate: user_intent_required

- id: metadata.regenerate
  label: Regenerate Metadata
  surfaces: [metadata_review_panel, ai_menu]
  backend_service: metadata_service
  backend_action: metadata.regenerate
  events: [ai.requested, metadata.generated]
  approval_gate: privacy_check_required
```

## AI

```yaml
- id: ai.continue_from_cursor
  label: Continue From Cursor
  surfaces: [ai_menu, chat_intent, slash_command, command_palette]
  backend_service: ai_gateway
  backend_action: writing.continue_from_cursor
  events: [ai.requested, ai.completed, suggestion.created]
  approval_gate: document_patch_review_required

- id: ai.rewrite_selection
  label: Rewrite Selection
  surfaces: [ai_menu, context_menu, chat_intent, selection_action_bar]
  backend_service: ai_gateway
  backend_action: writing.rewrite_selection
  events: [ai.requested, ai.completed, suggestion.created]
  approval_gate: document_patch_review_required

- id: ai.generate_section_prompt
  label: Generate Section Prompt
  surfaces: [ai_menu, active_outline, chat_intent]
  backend_service: ai_gateway
  backend_action: planning.generate_section_prompt
  events: [ai.requested, section_prompt.generated]
  approval_gate: user_review_required

- id: ai.check_ollama_status
  label: Check Ollama Status
  surfaces: [ai_menu, settings, command_palette]
  backend_service: provider_service
  backend_action: ollama.health_check
  events: [ollama.health_checked]
  approval_gate: not_required

- id: ai.list_ollama_models
  label: Refresh Ollama Models
  surfaces: [model_manager, ai_menu, settings]
  backend_service: provider_service
  backend_action: ollama.list_models
  events: [ollama.models_listed]
  approval_gate: not_required
```

## View

```yaml
- id: view.toggle_outline
  label: Outline
  surfaces: [view_menu, toolbar, command_palette]
  backend_service: frontend_ui
  backend_action: ui.toggle_outline
  events: []
  approval_gate: not_required

- id: view.toggle_right_panel
  label: Right Context Panel
  surfaces: [view_menu, toolbar, command_palette]
  backend_service: frontend_ui
  backend_action: ui.toggle_right_panel
  events: []
  approval_gate: not_required

- id: view.show_semantic_markup
  label: Show Semantic Markup
  surfaces: [view_menu, command_palette]
  backend_service: frontend_ui
  backend_action: ui.toggle_semantic_markup
  events: []
  approval_gate: not_required
```

---

# 7. Invocation Surfaces

## Menu Items

Menu items display the action label and run the registered action.

```text
File > Save → file.save_document
AI > Continue From Cursor → ai.continue_from_cursor
Plan > Generate Prompt For Current H1 → plan.generate_prompt_for_heading
```

## Toolbar Buttons

Toolbar buttons call the same action IDs.

## Keyboard Shortcuts

Keyboard shortcuts map to registered action IDs.

Shortcuts must never bypass permission, privacy, or approval gates.

## Slash Commands

Slash commands are aliases for registered actions.

```text
/continue → ai.continue_from_cursor
/rewrite → ai.rewrite_selection
/source → sources.find_for_current_section
/prompt → plan.generate_prompt_for_heading
```

## BBCode-like Blocks

Semantic blocks can expose actions.

```text
[[prompt:section]] → plan.generate_prompt_for_heading or plan.draft_section_from_prompt
[[image:prompt]] → media.generate_image_from_prompt
[[block:scene_template]] → block.insert_or_expand
```

## Chat Intents

Natural language chat intents resolve to registered actions.

Example:

```text
User: Continue from here.
Resolved action: ai.continue_from_cursor
```

The resolver must show intent uncertainty if confidence is low.

---

# 8. Approval Gates

Approval gates are not optional implementation details.

```text
not_required
warning_if_blockers
user_review_required
document_patch_review_required
metadata_review_required
privacy_check_required
cloud_confirmation_required
rights_confirmation_required
rollback_confirmation_required
blocked
```

Rules:

```text
Document text changes from AI require preview.
Metadata proposals require user approval.
Rights/license changes require explicit confirmation.
Cloud use with private context requires confirmation or saved policy.
Rollback replacement requires confirmation and preferably restore-as-copy default.
```

---

# 9. Required Action State Checks

Every action may be:

```text
enabled
disabled
hidden
warning
blocked
running
completed
failed
```

Disabled/blocked actions must have a plain-language reason.

Examples:

```text
Open a document first.
Local AI is not reachable.
This source has unknown rights.
Cloud use is disabled for this project.
This action needs a selected paragraph.
```

---

# 10. Privacy and Safety Rules

Actions must check:

```text
project privacy mode
provider routing policy
vault availability
raw content sensitivity
cloud boundary
rights status
role permission
required context availability
```

Actions must not:

```text
send private content to cloud without approval
write raw private content to repo-safe logs
silently apply AI text changes
silently approve metadata
silently change rights/license fields
bypass the event ledger for meaningful state changes
```

---

# 11. Event and Ledger Rules

Every meaningful action must declare:

```text
events emitted
ledger entry type
audit requirement
calendar/timeline projection if meaningful
```

UI-only actions may emit no ledger event, but should remain registered.

Examples of UI-only actions:

```text
toggle right panel
toggle semantic markup
open command palette
```

Examples of ledger-worthy actions:

```text
source import
AI request
AI patch accepted
metadata approved
rights changed
snapshot created
export generated
```

---

# 12. Error Handling

All actions must return a standard result shape.

```json
{
  "ok": true,
  "action_id": "ai.continue_from_cursor",
  "status": "completed",
  "message": "Suggestion ready for review.",
  "events": ["ai.requested", "ai.completed", "suggestion.created"],
  "payload_ref": "vault_or_database_ref_if_private"
}
```

Failure shape:

```json
{
  "ok": false,
  "action_id": "ai.continue_from_cursor",
  "status": "failed",
  "message": "Local AI is not reachable. You can keep writing manually.",
  "recovery_actions": ["ai.check_ollama_status", "settings.open_ai"],
  "events": ["ai.failed"]
}
```

---

# 13. Implementation Placement

Proposed future locations:

```text
app/frontend/src/actions/registry.ts
app/frontend/src/actions/resolveAction.ts
app/frontend/src/actions/useActionState.ts
app/backend/app/actions/registry.py
app/backend/app/services/command_gateway.py
schemas/actions/*.json
```

The exact stack may change, but the principle must not.

---

# 14. Testing Requirements

```text
all registered actions have unique IDs
all menu items map to registered actions
all slash commands map to registered actions
all chat-intent actions route through registry
permission checks are enforced
privacy gates are enforced
approval gates are enforced
events are emitted for meaningful state changes
disabled/blocked states provide user-facing messages
```

---

# 15. MVP Scope

MVP registry must include:

```text
file.new_document
file.save_document
file.create_snapshot
file.export_markdown
edit.undo
edit.redo
edit.find
insert.heading
insert.source_reference
insert.section_prompt
insert.image_from_file
plan.generate_prompt_for_heading
sources.add_source
sources.find_for_current_section
metadata.approve
metadata.edit
metadata.reject
ai.continue_from_cursor
ai.rewrite_selection
ai.check_ollama_status
ai.list_ollama_models
view.toggle_outline
view.toggle_right_panel
view.show_semantic_markup
```

---

# 16. Not MVP

```text
full plugin marketplace
user-authored automation macros
multi-user permissions
cloud provider fallback chains
complex action scripting
remote execution via xi-io.net
```

---

# 17. Acceptance Criteria

```text
Every major UI action has one registered action ID.
Menus, chat, slash commands, context menus, and buttons share the same action path.
Action availability respects document/cursor/provider/privacy state.
Meaningful actions emit events.
Approval gates are explicit.
Implementation can scaffold without inventing one-off handlers.
```

---

# 18. Open Gaps

```text
exact input/output schemas for each action
keyboard shortcut map
chat intent resolver confidence rules
frontend/backend registry synchronization method
action registry validation test
```
