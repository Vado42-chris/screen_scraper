# Backend Research Integration v1

This document defines how the word processor takes full advantage of the backend research engines without turning the UI into a system dashboard.

## Core thesis

The app should feel like a serious word processor, but behave like a source-aware research and analysis system underneath.

```text
Writer sees: document, sources, suggestions, comments, export.
Backend sees: events, sources, chunks, embeddings, tags, references, analysis jobs, snapshots, provenance, and model routing.
```

The difference between this app and an ordinary word processor is that the writing surface is continuously connected to a private research library and event ledger.

## Backend engines

The writing surface should integrate with these engines:

```text
ingress engine
source library engine
retrieval engine
analysis engine
lexicon engine
writing intelligence engine
AI gateway
ledger/snapshot engine
egress/export engine
```

No UI component should talk directly to an AI provider, raw file path, or source parser. Everything routes through backend services.

## Integration principles

### 1. Research should appear as assistance, not homework

The backend can do deep work, but the writer should see useful, timely interventions:

```text
This paragraph has no clear conflict yet.
This source contains a similar scene pattern.
This claim needs a source.
This character name differs from your notes.
This scene resembles three saved examples.
This section is ready for export.
```

### 2. Every visible suggestion should be explainable

When the app suggests something, the user should be able to ask:

```text
Why are you suggesting this?
What source did you use?
What changed?
Can I ignore it?
Can I apply it?
Can I save this pattern?
```

### 3. AI changes must use editor review mechanics

Backend intelligence should not silently mutate writing.

Allowed surfaces:

```text
comment
inline suggestion
replacement preview
analysis card
source citation chip
block proposal
patch proposal
new document draft
```

### 4. Source-backed writing must be bounded

The AI should operate against a selected source set, active project library, or explicitly requested corpus.

Do not dump the whole library into context.

Use:

```text
retrieval
summaries
semantic chunks
source filters
tags
active document selection
context budget planning
```

## User-facing integration moments

### While writing

The app can quietly watch meaningful document changes and queue lightweight analysis.

Examples:

```text
new heading created
scene block completed
large paste added
source reference inserted
AI patch accepted
comment resolved
section marked ready
```

Possible UI results:

```text
subtle insight chip
comment suggestion
source match card
outline update
word count/structure update
```

### When selecting text

Selection unlocks context-aware actions:

```text
Rewrite
Summarize
Compare to source
Find supporting source
Find contradiction
Tag this passage
Save as block
Create note
Ask about this
```

### When using chat

Chat requests should compile into structured backend actions.

Example user request:

```text
Make this scene more tense and compare it to the interrogation source.
```

Backend plan:

```text
intent: rewrite_with_source_comparison
selection: current scene
sources: active source set + interrogation-tagged sources
analysis: conflict/tension/subtext
output: suggestion patch + explanation + source chips
ledger: ai.requested, retrieval.performed, ai.completed, suggestion.created
```

### When importing sources

A source import should become a research object, not just text in a folder.

Pipeline:

```text
capture provenance
store original where allowed
clean text
normalize structure
chunk
summarize chunks
extract metadata
infer tags
build embeddings
add to source reader
emit ledger events
create source health card
```

### When exporting

Export should use backend validation before generating files.

Checks:

```text
unresolved comments
unaccepted suggestions
missing source references
broken block embeds
semantic tags visible/hidden setting
style consistency
format requirements
```

## Research-to-editor components

The backend should feed these reusable components:

```text
InsightCard
CitationChip
EvidenceDrawer
SourceMatchCard
AnalysisDrawer
SuggestionPatch
CommentThread
TagPill
ReferenceChip
BlockEmbed
SourceHealthCard
JobQueueStatus
TimelineEventCard
SnapshotMarker
```

## Integration patterns

### Pattern 1: Source Match

Trigger:

```text
User writes or selects a passage.
```

Backend:

```text
embed passage
retrieve similar source chunks
rank by relevance
filter by active source policy
return safe snippets and metadata
```

UI:

```text
Small card: "3 similar source passages found"
Click: opens EvidenceDrawer
```

### Pattern 2: Claim Support

Trigger:

```text
User writes a factual or source-dependent statement.
```

Backend:

```text
detect claim-like sentence
search active library
rank evidence
flag unsupported or contradicted claims
```

UI:

```text
soft underline or comment: "Needs source?"
```

### Pattern 3: Structural Review

Trigger:

```text
User completes a scene, section, chapter, or block.
```

Backend:

```text
identify structure
compare against template or similar sources
measure setup/conflict/payoff patterns
return plain-language review
```

UI:

```text
InsightCard: "This scene has setup and mood, but weak reversal."
```

### Pattern 4: Style Memory

Trigger:

```text
User accepts/rejects AI suggestions over time.
```

Backend:

```text
record decision events
extract preference signals
update local style profile
never silently change style rules
```

UI:

```text
Suggestion: "You usually prefer tighter dialogue. Apply that here?"
```

### Pattern 5: Block Reuse

Trigger:

```text
User writes [[block]] or saves selected passage as reusable pattern.
```

Backend:

```text
store block
map aliases
infer scale/function
link to tags and examples
make it available through autocomplete
```

UI:

```text
Inline BlockEmbed with expand/preview/apply controls
```

### Pattern 6: Event-Aware Recovery

Trigger:

```text
User wants to go back, compare, recover, or inspect history.
```

Backend:

```text
query ledger
find snapshots
generate restore preview
create safety snapshot before rollback
```

UI:

```text
History calendar / timeline with snapshot markers
```

## Action registry requirement

Buttons, menus, slash commands, BBCode commands, selection menus, and chat intents should call the same registered backend actions.

Example actions:

```text
rewrite.selection
summarize.selection
compare.selection_to_source
find.supporting_source
insert.source_reference
save.selection_as_block
analyze.document_structure
export.document
snapshot.create
rollback.preview
```

Each action should define:

```text
id
label
description
input schema
required permissions
privacy boundary
backend service
ledger events emitted
UI result type
failure states
```

## Privacy boundaries

Backend integration must be strong, but privacy rules stay stronger.

Do not send private sources or document text to cloud models unless:

```text
user enabled cloud mode
source policy allows cloud use
request clearly indicates what will be sent
user has approved or configured permission
```

## MVP integration scope

First integration loop:

```text
1. Import local text or markdown source.
2. Normalize and index source.
3. Open document editor.
4. Select text.
5. Ask: "Find relevant source support."
6. Retrieve source snippets locally.
7. Show CitationChip and EvidenceDrawer.
8. Ask AI to rewrite selected text using retrieved source context.
9. Show rewrite as suggestion patch.
10. Accept patch.
11. Emit ledger events.
12. Create document snapshot.
```

This proves the app is not just a word processor and not just a chat wrapper.

## Anti-patterns

Avoid:

```text
AI sidebar disconnected from the document
source search that cannot insert into writing
analysis dashboard that does not affect revision
comments that are separate from AI suggestions
exports that ignore unresolved review state
ledger events that cannot be surfaced to users
model calls that bypass source policy
```

## Product promise

The backend research engines should make the writer feel like the app has memory, context, taste, and discipline.

The user should still feel like they are writing, not operating a research machine.
