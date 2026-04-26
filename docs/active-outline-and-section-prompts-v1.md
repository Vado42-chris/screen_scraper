# Active Outline and Section Prompts v1

This document defines the active outline system: a split-view/navigation layer that connects headings, story spine items, section prompts, source context, AI actions, and writing progress.

## Core thesis

Traditional word processors use headings to create a navigable document outline. This app should go further.

The outline should become an active planning and drafting surface.

```text
Heading in document
→ outline item
→ optional section prompt
→ source/context suggestions
→ status markers
→ AI actions
→ ledger events
```

## Product principle

The outline is not only navigation. It is a live map of the document's planned work.

The document remains the primary writing surface. The outline/sidebar helps the writer understand:

```text
where they are
what each section is supposed to do
which sections still need prompts
which sections need updates
which sections have source/context suggestions
which sections are drafted, reviewed, or stale
```

## Split view

The app should support split view between:

```text
left: active outline / overview / storyboard
right: document editor
```

Or, depending on screen size:

```text
primary: document editor
right panel: current outline item / section prompt / sources
```

The split view should be optional, resizable, and collapsible.

## Heading-driven outline

Headings in the document create outline items.

Initial mapping:

```text
H1 = major milestone / chapter / top-level section
H2 = section / scene group
H3 = beat / subsection
H4-H6 = optional detail levels
```

The exact labels can vary by template.

Example templates:

```text
Book: H1 = Chapter, H2 = Scene, H3 = Beat
Article: H1 = Major Section, H2 = Subsection
Screenplay Notes: H1 = Act, H2 = Sequence, H3 = Scene
TTRPG Sourcebook: H1 = Chapter, H2 = Topic, H3 = Encounter/Rule/Location
```

## SectionPrompt object

Each heading can optionally have a section prompt.

Suggested shape:

```json
{
  "id": "uuid",
  "document_id": "uuid",
  "heading_node_id": "editor_node_id_or_stable_anchor",
  "heading_text": "Chapter 3: The Broken Gate",
  "heading_level": 1,
  "prompt_text": "Draft this chapter around the failed ritual and the first reveal of the ember spirit.",
  "status": "missing|draft|ready|used|stale|needs_update|resolved",
  "source_links": [],
  "story_node_id": "uuid_or_null",
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "last_used_at": "timestamp_or_null"
}
```

## Prompt statuses

Use simple visual status markers in the outline.

```text
No prompt
Prompt draft
Prompt ready
Prompt used
Prompt stale
Needs update
Resolved
```

Suggested icons are implementation details, but the meaning must be consistent.

## Outline status indicators

Each heading row can show lightweight indicators:

```text
prompt status
source status
comment count
suggestion count
open question count
word count / target
last updated state
snapshot marker
```

Example:

```text
Chapter 4: The Broken Gate   [Prompt ready] [3 sources] [2 open questions]
```

## New heading behavior

When the user adds a new H1, the app should recognize it as a new major section.

Non-intrusive prompt:

```text
Create a planning prompt for this section?
```

Options:

```text
Generate from project spine
Generate from active sources
Write my own
Skip
Don't ask again for this document
```

For H2/H3 headings, the app should be more subtle:

```text
small outline badge or context menu action: Add prompt
```

Do not interrupt flow for every minor heading.

## Section prompt generation

When generating a prompt, the backend can use:

```text
heading text
nearby headings
current project spine
storyboard card
active source set
characters/locations linked to this section
open questions
previous/next sections
style profile
```

The generated prompt should appear as editable text, not as a hidden command.

## Prompt block syntax

Support a targeted block type for section prompts.

Suggested syntax:

```text
[[prompt:section]]
```

Optional extended forms:

```text
[[prompt:section id="chapter-3-broken-gate"]]
[[prompt:section source="story-spine"]]
[[prompt:section status="ready"]]
```

This block should not render as prose by default. It should render as:

```text
inline prompt marker in the document, when semantic markup is visible
button/status/action in the outline
editable prompt in the section planning panel
```

## Rendering behavior

Default writing view:

```text
Prompt block hidden or collapsed
Outline shows prompt status
Right panel can show current prompt
```

Semantic markup view:

```text
Prompt block visible as a subtle chip/card
```

Export behavior:

```text
clean manuscript export hides prompt blocks
review export may include prompts
planning export includes prompts
```

## Active outline actions

Each outline item should support actions:

```text
Jump to section
Add prompt
Edit prompt
Generate prompt
Use prompt to draft
Find sources for section
Show related storyboard card
Create storyboard card from heading
Update card from section
Mark section ready
Create snapshot before editing
```

## AI actions

Suggested action IDs:

```text
outline.generate_prompt_for_heading
outline.generate_prompts_for_all_h1
outline.find_sections_missing_prompts
outline.find_stale_prompts
outline.draft_section_from_prompt
outline.update_prompt_from_draft
outline.find_sources_for_section
outline.link_heading_to_story_node
outline.create_story_node_from_heading
```

Each action emits ledger events.

## Stale prompt detection

A prompt becomes stale when:

```text
heading text changes significantly
linked storyboard card changes
linked source set changes
section draft changes significantly after prompt was used
previous/next section changes create continuity mismatch
```

The outline should show a soft warning, not an error.

Example:

```text
Prompt may need update
```

## Document-to-spine sync

Adding an H1 should be able to create a StoryNode.

Creating a StoryNode should be able to create an H1.

Sync must be explicit or suggested, not silent destructive behavior.

Allowed sync flows:

```text
H1 created → suggest StoryNode
StoryNode created → suggest document heading
StoryNode summary → suggest section prompt
Section draft → suggest updated StoryNode summary
```

## Cognitive retention

The active outline helps the user remember the plan.

It should answer at a glance:

```text
What sections exist?
What is each section supposed to do?
Which sections still need drafting?
Which prompts are ready?
Which prompts are stale?
Where are my source-backed sections?
What changed recently?
```

## MVP scope

Build in this order:

```text
1. Generate outline from H1/H2/H3.
2. Click outline item to jump to heading.
3. Store prompt per H1.
4. Show prompt status badge in outline.
5. Add/edit prompt manually.
6. Generate prompt from heading + project context.
7. Use prompt to draft section as AI suggestion.
8. Mark prompt used/stale.
9. Create StoryNode from H1.
10. Link H1 to StoryNode.
```

## Not MVP

Defer:

```text
complex drag/reorder synced with document moves
full bidirectional live sync for all heading levels
automatic destructive document restructuring
multi-user outline collaboration
prompt generation for every heading by default
```

## Product truth

The active outline is where table of contents, storyboard, section prompts, source readiness, and drafting status meet.

It makes the document navigable, plan-aware, and AI-assisted without forcing the writer out of the manuscript.
