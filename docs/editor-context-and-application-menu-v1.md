# Editor Context and Application Menu v1

This document defines how the AI chat remains contextually aware of the open word-processing document, how it can navigate the document safely, and how the top application menu should be structured.

## Core problem

The AI chat must not be a disconnected sidebar.

It must always understand:

```text
which document is open
where the cursor is
what text is selected
which heading/section contains the cursor
which storyboard card or planning node is linked
which sources are active
which prompt/status markers apply
what the user most recently did
```

At the same time, the editor must remain usable as a word processor. The AI must not constantly steal focus, move the cursor, or rewrite text without review.

## Cursor context model

The editor should publish a live CursorContext object to the frontend state and backend action layer.

Suggested shape:

```json
{
  "document_id": "uuid",
  "document_version_id": "uuid_or_null",
  "cursor_anchor": {
    "block_id": "stable_block_id",
    "offset": 42,
    "editor_position": 12345
  },
  "selection": {
    "is_collapsed": true,
    "from": 12345,
    "to": 12345,
    "selected_text_preview": "safe short preview"
  },
  "heading_path": [
    { "level": 1, "text": "Chapter 3", "block_id": "..." },
    { "level": 2, "text": "The Broken Gate", "block_id": "..." }
  ],
  "current_section": {
    "heading_block_id": "uuid",
    "story_node_id": "uuid_or_null",
    "section_prompt_id": "uuid_or_null",
    "status": "drafting"
  },
  "nearby_context": {
    "before_block_ids": [],
    "current_block_id": "uuid",
    "after_block_ids": []
  },
  "active_sources": [],
  "active_tags": [],
  "active_comments": [],
  "active_suggestions": []
}
```

## Stable anchors instead of raw line numbers

Line numbers are useful visually, but word processors reflow text. Raw line numbers are unstable when:

```text
font changes
window width changes
zoom changes
content is edited
print layout differs from web layout
```

Use stable anchors internally:

```text
block_id
heading_id
paragraph_id
range anchors
editor positions
source references
snapshot/version IDs
```

Then optionally display human-friendly numbers:

```text
paragraph numbers
block numbers
section numbers
visible line numbers, view-only
```

## Invisible line/block numbering

The app should maintain invisible identifiers for major editor nodes.

Examples:

```text
block:doc-abc:h1-0004
block:doc-abc:p-0027
block:doc-abc:prompt-0002
```

The View menu can toggle visible helpers:

```text
Show Paragraph Numbers
Show Block IDs, developer mode
Show Line Numbers, approximate/reflow-aware
Show Semantic Markup
Show Prompt Blocks
Show Source References
Show Non-printing Characters
```

## AI navigation powers

AI may propose navigation or perform navigation only when explicitly asked or when the user clicks a result.

Allowed AI navigation actions:

```text
jump_to_heading
jump_to_block
jump_to_comment
jump_to_suggestion
jump_to_source_reference
select_range
scroll_to_section
open_evidence_drawer
open_current_story_card
```

Unsafe behavior:

```text
AI silently moving cursor while user types
AI replacing text without preview
AI changing selection during composition
AI jumping document focus without explanation
```

## AI chat context contract

Every AI chat request from the document workspace should include a compact context packet.

Context packet should include:

```text
current document id
current document title
cursor anchor
selection range
selected text, if user selected text
current heading path
current section prompt
linked story node
nearby text window
active source set
privacy mode
model routing policy
```

The backend context builder decides how much text can safely enter the model context.

## Chat commands that use cursor context

Natural language examples:

```text
Rewrite this paragraph.
What should come next here?
Find sources for this section.
Draft this H1 from its prompt.
Compare this scene to the active source.
Move me to the next unresolved prompt.
Show the card for this section.
```

The system maps these to registered actions:

```text
rewrite.current_selection_or_block
continue.from_cursor
source.find_for_current_section
outline.draft_section_from_prompt
compare.current_section_to_source
outline.jump_to_next_unresolved_prompt
plan.open_current_story_node
```

## Top application menu

The app should support a familiar document-processor menu structure.

Recommended top-level menus:

```text
File
Edit
Insert
Format
View
Plan
Sources
Tools
AI
Window
Help
```

For narrow screens, these can collapse into a command palette or app menu.

## File menu

Document/project lifecycle and export.

```text
New Project...
New Document...
New From Template...
Open Project...
Open Recent
Close Document
Save
Save Version...
Create Snapshot...
Restore From Snapshot...
Import...
Export
  Markdown
  DOCX
  PDF
  Plain Text
  Screenplay Style
Print Preview
Print...
Project Settings...
Vault Settings...
Exit
```

Open surfaces:

```text
New Project: modal wizard
New From Template: template picker page/modal
Open Project: project picker page/modal
Save Version: modal
Create Snapshot: modal
Restore From Snapshot: history/snapshot page
Import: source import page or modal
Export: export workspace
Project Settings: settings page
Vault Settings: settings page
```

## Edit menu

Text editing, review editing, and selection actions.

```text
Undo
Redo
Cut
Copy
Paste
Paste Without Formatting
Select All
Find...
Find and Replace...
Go To...
Insert Comment
Insert Writer Note
Resolve Comment
Accept Suggestion
Reject Suggestion
Accept All Suggestions in Section
Reject All Suggestions in Section
Delete Section Prompt
```

Open surfaces:

```text
Find: inline find bar
Find and Replace: panel/modal
Go To: command palette scoped to document anchors
Comments: right panel or inline thread
Suggestions: review pane
```

## Insert menu

Insert document content and semantic objects.

```text
Heading
Page Break
Section Break
Link
Comment
Writer Note
Image, later
Table, later
Source Reference
Citation Chip
Section Prompt
Story Block
Reusable Block
Character Reference
Location Reference
Date/Event Reference
Horizontal Rule
Special Character, later
```

Open surfaces:

```text
Source Reference: source picker modal
Section Prompt: prompt editor panel
Story Block: block picker
Character/Location Reference: entity picker
```

## Format menu

Document styles and appearance.

```text
Bold
Italic
Underline
Strikethrough
Inline Code
Clear Formatting
Paragraph Style
  Title
  Subtitle
  Heading 1
  Heading 2
  Heading 3
  Body
  Quote
  Scene Heading
  Dialogue
  Character Name
Lists
Alignment
Line Spacing
Indentation
Styles...
Document Theme...
```

Open surfaces:

```text
Styles: style manager panel
Document Theme: theme/template dialog
```

## View menu

Workspace visibility and cognitive overlays.

```text
Focus Writing
Research Writing
Plan Split View
Source Split View
Outline
Storyboard
Right Context Panel
Chat Composer
Status Bar
Activity Timeline
Zoom In
Zoom Out
Reset Zoom
Show Ruler, later
Show Non-printing Characters
Show Paragraph Numbers
Show Line Numbers
Show Semantic Markup
Show Prompt Blocks
Show Source References
Show Comments
Show Suggestions
Developer Overlays
```

Open surfaces:

```text
Outline: left rail panel
Storyboard: Plan workspace or split panel
Activity Timeline: timeline drawer/page
Developer Overlays: debug-only panel
```

## Plan menu

Story spine, storyboard, milestones, and section planning.

```text
Open Plan Workspace
Create Story Spine...
Create Storyboard Card From Current Heading
Generate Prompts For All H1s
Find Sections Missing Prompts
Find Stale Prompts
Open Current Section Card
Link Current Heading To Story Node
Update Card From Current Section
Draft Section From Current Prompt
Find Continuity Issues
```

Open surfaces:

```text
Plan Workspace: page/workspace
Create Story Spine: wizard
Storyboard Card: right panel/modal
Continuity Issues: analysis panel
```

## Sources menu

Source library and evidence workflow.

```text
Add Source...
Import From File...
Import From URL..., later
Open Source Library
Search Sources
Find Sources For Current Section
Show Active Source Set
Attach Source To Document
Detach Source From Document
Open Evidence Drawer
Reindex Selected Source
Source Privacy Settings
```

Open surfaces:

```text
Add Source: import modal/page
Source Library: Sources workspace
Search Sources: source search panel
Evidence Drawer: right drawer
Source Privacy Settings: settings page/modal
```

## Tools menu

General writing, diagnostics, and utility tools.

```text
Word Count
Document Statistics
Spelling and Grammar, later
Accessibility Check, later
Document Health Check
Validate Export Readiness
Review Unresolved Comments
Review Unaccepted Suggestions
Clean Formatting
Convert Large Paste To Source
Command Palette
Keyboard Shortcuts
Event Timeline
Error Log
Run Smoke Check, developer mode
```

Open surfaces:

```text
Word Count: modal/panel
Document Statistics: panel
Document Health Check: analysis panel
Export Readiness: export workspace checklist
Event Timeline: timeline page/drawer
Error Log: diagnostics page
Keyboard Shortcuts: modal
```

## AI menu

AI-specific settings and actions should be first-class, not buried in Tools.

```text
Ask About Current Cursor
Rewrite Selection
Continue From Cursor
Summarize Current Section
Find Sources For Current Section
Compare With Source...
Generate Section Prompt
Draft Section From Prompt
Explain Suggestion
Open AI Settings
Open Model Manager
Check Ollama Status
Discover Models
Provider Settings
Privacy and Routing Rules
Context Budget Viewer
AI Job Queue
```

Open surfaces:

```text
AI Settings: settings page
Model Manager: settings page
Ollama Status: health panel
Discover Models: model discovery page/panel
Provider Settings: settings page
Context Budget Viewer: diagnostics panel
AI Job Queue: job queue panel
```

## Window menu

Mostly useful later for desktop/self-host shells.

```text
New Window, later
Switch Workspace
Toggle Full Screen
Minimize, desktop shell
Reload App, developer mode
Open Dev Tools, developer mode
```

## Help menu

User help and diagnostics.

```text
Quick Start
Writing Workflow Guide
Source Library Guide
AI Privacy Guide
Keyboard Shortcuts
Report Issue
Open Logs Folder
About
```

## Command palette requirement

Every major menu action should be registered in a command registry so it can be triggered from:

```text
menu item
button
toolbar
keyboard shortcut
slash command
BBCode-like command
chat intent
context menu
```

This prevents duplicate implementations.

## Menu action schema

```json
{
  "id": "ai.continue_from_cursor",
  "label": "Continue From Cursor",
  "menu_path": "AI > Continue From Cursor",
  "shortcut": null,
  "requires_document": true,
  "requires_selection": false,
  "requires_cursor_context": true,
  "opens": "suggestion_patch",
  "backend_action": "writing.continue_from_cursor",
  "ledger_events": ["ai.requested", "ai.completed", "suggestion.created"],
  "privacy_boundary": "uses_document_context"
}
```

## Page templates for opened surfaces

### Settings page template

```text
Left: settings navigation
Main: selected settings form
Right: contextual explanation/help
Bottom/status: save state, provider health
```

Used by:

```text
AI Settings
Provider Settings
Vault Settings
Project Settings
Privacy Routing Rules
```

### Model Manager template

```text
Top: provider status summary
Left: providers/models filter
Main: installed/recommended model cards
Right: selected model details, roles, context size, test button
Bottom: model jobs/download status
```

### Source Library template

```text
Left: source filters/list
Main: source reader or source cards
Right: metadata, privacy, provenance, tags
Bottom: import/indexing job status
```

### Plan Workspace template

```text
Left: spine tree
Main: storyboard/timeline/matrix view
Right: selected card details, sources, prompts
Bottom: planning actions/job status
```

### History/Timeline template

```text
Left: calendar/date filter
Main: event timeline
Right: selected event/snapshot detail and restore preview
Bottom: snapshot/rollback actions
```

### Diagnostics template

```text
Left: diagnostic categories
Main: logs/events/errors table
Right: selected error details and suggested fixes
Bottom: export diagnostic bundle, developer mode only
```

## MVP menu scope

MVP should implement a reduced but future-compatible menu:

```text
File: New Document, Save, Save Version, Create Snapshot, Import, Export Markdown
Edit: Undo, Redo, Cut, Copy, Paste, Find, Find and Replace, Insert Comment
Insert: Heading, Link, Comment, Source Reference, Section Prompt
Format: Bold, Italic, Heading 1/2/3, Body, Quote, Lists, Clear Formatting
View: Outline, Right Context Panel, Chat Composer, Show Prompt Blocks, Show Semantic Markup
Plan: Open Plan Workspace, Create Card From Current Heading, Generate Prompt For Current H1
Sources: Add Source, Open Source Library, Find Sources For Current Section
Tools: Word Count, Document Health Check, Event Timeline, Error Log, Keyboard Shortcuts
AI: Continue From Cursor, Rewrite Selection, Generate Section Prompt, Open AI Settings, Check Ollama Status
Help: Quick Start, Keyboard Shortcuts, About
```

## Product truth

The AI chat becomes useful when it knows where the user is in the document.

The menu system becomes powerful when every menu item, toolbar button, slash command, and chat intent calls the same registered action.

The editor remains trustworthy when AI can navigate and suggest, but not silently overwrite or steal focus.
