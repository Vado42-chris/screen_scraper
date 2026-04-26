# Story Spine and Storyboard System v1

This document defines the planning layer that sits beside the word processor and connects long-form writing to the backend research, lexicon, analysis, and event systems.

## Core thesis

Many long-form writers do not start with polished prose. They start with a spine:

```text
chapters
sections
story beats
key events
characters
locations
timelines
source notes
research dependencies
open holes
```

The app should treat that spine as first-class project data, not as loose notes trapped outside the document.

## Product principle

The story spine is a planning board connected to the manuscript.

```text
Storyboard item → document section → source context → analysis → ledger events → export
```

The user should be able to move between planning and writing without losing context.

## User-facing concept

Add a workspace called:

```text
Plan
```

Plain UI mode list:

```text
Write
Plan
Sources
Analyze
Export
Settings
```

The Plan workspace should support multiple views over the same underlying data.

## Planning views

### 1. Spine View

A hierarchical outline of the whole project.

```text
Book / Project
  Part
    Chapter
      Section
        Scene
          Beat
```

Use for:

```text
chapter planning
section order
long-form coherence
collapse/expand navigation
jump to writing surface
```

### 2. Storyboard View

A card-based board for scenes, beats, chapters, or sections.

Card contents:

```text
title
summary
status
characters
locations
source links
tags
conflict / goal / outcome
notes
linked document section
```

Use for:

```text
dragging beats around
visualizing gaps
keeping events coherent
seeing what still needs writing
```

### 3. Timeline View

A chronological or sequence-based view of events.

Use for:

```text
story chronology
flashbacks
cause/effect tracking
series continuity
historical/research timelines
```

### 4. Matrix View

A table-like continuity view.

Columns may include:

```text
chapter
scene
POV
characters
location
time
plotline
status
source dependency
open question
word target
actual word count
```

Use for:

```text
continuity audits
missing character/location checks
progress tracking
series planning
```

### 5. Entity Map View

A network view for relationships.

Entities:

```text
characters
locations
objects
organizations
themes
sources
blocks
events
```

Use sparingly. This is an advanced view, not the default writing surface.

## Planning object model

Minimum entities:

```text
StoryProject
StorySpine
StoryNode
StoryBeat
StoryEvent
Character
Location
ObjectOrProp
Theme
Plotline
OpenQuestion
ResearchNeed
SourceLink
DocumentLink
Status
```

## StoryNode

A StoryNode is any structural planning unit.

Examples:

```text
part
chapter
section
scene
beat
appendix
article section
sourcebook section
```

Suggested shape:

```json
{
  "id": "uuid",
  "project_id": "uuid",
  "parent_id": "uuid_or_null",
  "type": "chapter|section|scene|beat|custom",
  "title": "Chapter 4: The Broken Gate",
  "summary": "Short planning summary",
  "status": "idea|planned|drafting|drafted|reviewing|locked|cut",
  "order_index": 1200,
  "linked_document_id": "uuid_or_null",
  "linked_document_range": null,
  "characters": [],
  "locations": [],
  "plotlines": [],
  "tags": [],
  "source_links": [],
  "open_questions": []
}
```

## StoryEvent

A StoryEvent is a meaningful event in the world/story logic.

Examples:

```text
character meets ally
battle begins
secret revealed
ritual fails
source claim introduced
research fact established
```

Suggested shape:

```json
{
  "id": "uuid",
  "project_id": "uuid",
  "title": "The ritual fails",
  "summary": "The intended binding collapses and releases the ember spirit.",
  "story_time": "custom_or_iso_or_sequence",
  "narrative_order": 18,
  "location_ids": [],
  "character_ids": [],
  "source_ids": [],
  "story_node_ids": [],
  "causes": [],
  "effects": [],
  "status": "planned|written|revised|verified"
}
```

## Status model

Use plain status labels in the UI.

```text
Idea
Planned
Needs Research
Ready to Draft
Drafting
Drafted
Needs Revision
Reviewed
Locked
Cut
```

Backend can map these to richer state if needed.

## Link planning to writing

Every planning card should be able to become:

```text
a document section
a scene draft
a source research task
a reusable block
a checklist
a prompt to AI
a snapshot point
```

Every document section should be able to reveal:

```text
which storyboard card it came from
which characters should appear
which locations are expected
which sources are relevant
which open questions remain
```

## AI-assisted creation

AI should help populate the spine, not replace the writer's control.

Useful actions:

```text
generate spine from premise
generate chapter list from synopsis
generate beats from chapter summary
generate missing scenes between two events
extract characters from planning notes
extract locations from planning notes
turn rough notes into storyboard cards
turn storyboard card into scene draft
summarize scene into storyboard card
find gaps in the spine
find unresolved open questions
find character continuity errors
find location/time conflicts
suggest source needs for each beat
```

## AI as planning assistant

Suggested action IDs:

```text
plan.generate_spine
plan.expand_chapter_to_beats
plan.extract_entities_from_notes
plan.create_storyboard_cards
plan.find_spine_gaps
plan.find_continuity_conflicts
plan.link_sources_to_beats
plan.draft_from_card
plan.summarize_draft_to_card
plan.update_card_from_document
```

Each action must emit ledger events.

## Example workflow

```text
1. User creates project.
2. User writes rough premise.
3. User asks AI to create an initial spine.
4. App creates chapters and beat cards.
5. User edits/reorders cards manually.
6. User attaches characters, locations, sources, and notes.
7. User selects one card and clicks Draft Section.
8. AI creates a proposal in the word processor.
9. User accepts, edits, or rejects.
10. Ledger records planning and writing events.
11. Snapshot is created at major milestones.
```

## Reference panel while writing

The writer needs planning context one click away.

In Write mode, the RightPanel should support:

```text
Current Card
Expected Characters
Expected Locations
Relevant Sources
Open Questions
Continuity Warnings
Linked Plotlines
Nearby Beats
```

This keeps the spine visible without crowding the page.

## Card-to-document behavior

When a storyboard card is linked to a document section, changes should sync carefully.

Allowed sync directions:

```text
card summary → drafting prompt
document summary → card update suggestion
card status → document planning state
document word count → card progress
accepted AI analysis → card warning/resolution
```

Do not silently overwrite card summaries or manuscript text. Use suggestions and confirmations.

## Planning views share the same data

Spine View, Storyboard View, Timeline View, Matrix View, and Entity Map View should all read/write the same planning objects.

No duplicate planning systems.

## Research integration

Planning cards can declare research needs.

Examples:

```text
needs source
needs location detail
needs dialogue reference
needs historical check
needs worldbuilding answer
needs character motivation
```

The source library can then suggest relevant sources or create research tasks.

## Lexicon integration

Planning entities should connect to the lexicon system:

```text
#tags
@characters
@locations
[[blocks]]
custom aliases
canonical mappings
```

Typing in a planning card should use the same autocomplete logic as the editor.

## Event ledger integration

Planning operations emit ledger events.

Examples:

```text
plan.spine_created
plan.node_created
plan.node_reordered
plan.card_updated
plan.event_created
plan.character_linked
plan.location_linked
plan.source_linked
plan.card_drafted
plan.card_synced_from_document
plan.continuity_warning_created
plan.gap_detected
```

## Snapshot integration

Snapshots should capture planning state.

Useful snapshot labels:

```text
Initial spine created
Before major reorder
Before draft generation
After chapter 1 locked
Before export
```

Rollback should allow restoring planning state as a branch/copy by default.

## MVP scope

Build the planning layer in this order:

```text
1. Spine View: chapters/sections/scenes/beats
2. Storyboard cards linked to document sections
3. Character and location fields on cards
4. Status and notes on cards
5. AI: generate spine from premise
6. AI: expand card into draft suggestion
7. AI: summarize draft back to card
8. RightPanel: Current Card while writing
9. Ledger events for planning actions
10. Snapshot planning state
```

## Not MVP

Defer:

```text
complex graph visualization
multi-user planning boards
real-time collaboration
advanced calendar chronology
series-scale continuity engine
visual map/location editor
```

## Product truth

The spine is not separate from the manuscript.

The spine is the manuscript's skeleton, and the word processor is where the skeleton gets flesh.
