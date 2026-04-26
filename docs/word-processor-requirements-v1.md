# Word Processor Requirements v1

This app is not a chat tool with a text box. It is a new home for writers.

The writing surface must be planned as a serious word processor with AI/source-aware capabilities layered in carefully. The editor must support ordinary writing expectations first, then add source-aware intelligence without breaking document flow.

## Product premise

The visible product is a cooperative word processor.

The hidden system is an event-based source, analysis, lexicon, retrieval, and export engine.

Both must be true.

```text
User-facing: write, revise, review, export.
System-facing: ingest, index, analyze, log, snapshot, route, recover.
```

## Non-negotiable rule

Do not treat the editor as a replaceable textarea.

The editor is the core product surface. It requires explicit planning, contracts, and tests.

## Lessons from existing word processors

Writers expect mature word processors to provide:

```text
formatting
styles
templates
spellcheck
autocorrect
comments
track changes / suggestions
version history
find and replace
outline/navigation
headers and footers
page layout
print/export
image/table support
accessibility checking
long-document stability
```

This app does not need every advanced feature on day one, but its architecture must not block them.

## Capability tiers

### Tier 0: Editor foundation

Required before the app can be considered a real writing tool.

```text
create document
open document
save document
autosave
manual save/version marker
undo/redo
copy/paste
select text
keyboard navigation
basic formatting
plain text mode
rich text mode
markdown-aware storage/export
word count
character count
current document title
save status
```

### Tier 1: Writer essentials

Required for serious daily writing.

```text
paragraph formatting
headings
lists
block quotes
horizontal rule
inline formatting: bold, italic, underline, strike, code
links
find
replace
find next/previous
case-sensitive search option
whole-word search option
document outline
section navigation
spellcheck integration
autocorrect hooks
format painter or equivalent style copy later
```

### Tier 2: Structured document work

Required for book, script, article, and long-form projects.

```text
styles
style presets
custom styles
templates
document sections
front matter
body matter
back matter
page breaks
section breaks
table of contents generation
footnotes/endnotes later
bibliography/reference hooks later
headers/footers later
page numbering later
```

### Tier 3: Collaboration and review

Required before writers trust the app for revision workflows.

```text
comments
inline notes
resolved/unresolved comments
suggested edits
accept/reject suggestion
track changes
show/hide markup
review pane
filter changes by author/system/AI
AI proposals as suggestions, not silent edits
compare versions
document history
named versions
restore version as branch/copy
```

### Tier 4: Source-aware writing

Unique value layer.

```text
attach sources to document
show active source set
insert source citation chip
preview source excerpt
ask AI about selected source
compare passage to source
source-backed rewrite suggestion
show evidence drawer
mark source reliability
source usage ledger event
```

### Tier 5: Semantic writing layer

Power-user layer that must remain optional.

```text
#tags
@references
[[blocks]]
slash commands
autocomplete for tags/refs/blocks
semantic chips
block embeds
block library
lexicon mapping
show structure on request
```

### Tier 6: Production and export

Required for useful artifacts.

```text
markdown export
docx export
pdf export
plain text export
html export later
screenplay-style export
print preview
export presets
export history
export ledger event
```

## Document model requirements

The document model must support both user writing and system intelligence.

Minimum document entities:

```text
Project
Document
DocumentVersion
Section
Block
InlineMark
Comment
Suggestion
SourceReference
SemanticTag
BlockReference
ExportJob
Snapshot
```

## Storage model

Store user-readable artifacts wherever possible.

Recommended storage approach:

```text
canonical document model in local database
periodic markdown/html snapshots in vault
export artifacts as files
ledger events in SQLite
large source files outside database
```

Avoid storing everything as opaque editor JSON only. Opaque editor state may be useful internally, but writers need durable, portable artifacts.

## Formatting model

Separate meaning from appearance.

Styles should be semantic first:

```text
Title
Subtitle
Heading 1
Heading 2
Body
Quote
Scene Heading
Dialogue
Character Name
Action
Note
Source Excerpt
```

Visual formatting should derive from styles and templates.

## Editing modes

The editor should support multiple modes without becoming multiple apps.

```text
Writing Mode
Review Mode
Source Compare Mode
Focus Mode
Print/Layout Preview Mode
Semantic Markup Mode
```

Modes should change visible tools, not replace the document surface.

## AI editing rules

AI must never silently overwrite user work.

AI outputs should be one of:

```text
chat answer
inline suggestion
replacement preview
comment/note
patch proposal
new block/document draft
analysis report
```

Applying AI output should create a ledger event and, where appropriate, a document version.

## Suggestion and track-change rules

AI-generated rewrites should use the same review machinery as human suggestions.

```text
AI proposes
user previews
user accepts/rejects
accepted change updates document
rejected change remains in history or is dismissed
ledger records outcome
```

## Comments and notes

Support both ordinary comments and private writer notes.

```text
Comment: attached to text, review-oriented
Writer Note: personal planning note
Source Note: note attached to source/reference
AI Note: generated insight, user can keep or dismiss
```

## Source reference behavior

When AI uses a source, the document should be able to show:

```text
source title
source type
source reliability
excerpt used
retrieval reason
whether source text left local machine
```

Source visibility should be one click away, not forced into the writing flow.

## Long document requirements

The editor must support long manuscripts.

Requirements:

```text
virtualized rendering or section-based loading
outline navigation
section collapse/expand
search across full document
stable autosave
no single giant context dump to AI
section-level analysis
project-level summaries
```

## Script and book writing requirements

Because the app begins with scripts/transcripts but may grow into books, it must support genre-aware templates.

Initial templates:

```text
Blank Document
Article / Essay
Chapter Draft
Scene Draft
Screenplay-style Scene
Transcript Notes
Source Analysis Note
Worldbuilding Note
```

Future templates:

```text
Novel Manuscript
TV Episode
Film Script
TTRPG Sourcebook Section
Campaign Chapter
Research Dossier
```

## Accessibility requirements

The editor is an authoring tool. It must be accessible and help produce accessible output.

Requirements:

```text
keyboard-first editing
visible focus
screen-reader labels
semantic headings
high contrast support
reduced motion support
text scaling
accessible comments/review pane
accessible export warnings
alt text support for images later
accessibility checker later
```

## Paste/import requirements

Paste is a major ingress path.

The editor must handle:

```text
plain text paste
rich text paste
markdown paste
html paste
large paste converted to source
paste cleanup preview
preserve headings and lists where possible
strip unsafe markup
create source artifact for massive paste
```

## Find, search, and navigation

Writers rely heavily on retrieval inside documents.

Required:

```text
find in document
replace in document
search project
search sources
search tags
search comments
jump to heading
jump to next comment
jump to next suggestion
jump to source reference
```

## Undo, history, and rollback

Use layered recovery.

```text
Undo/redo: immediate editor actions
Autosave: short-term recovery
Document versions: named meaningful saves
Snapshots: project/document recovery points
Event ledger: audit trail and reconstruction aid
Rollback: restore as branch/copy by default
```

## Printing and export expectations

Export must be treated as a first-class feature.

```text
preview before export
export selected document
export whole project later
export with/without comments
export with/without semantic tags
export clean manuscript
export review copy
export source-cited draft
```

## Minimum viable editor target

MVP editor must include:

```text
document create/open/save
autosave
undo/redo
basic rich text
headings
lists
block quotes
links
word count
find
outline
comments, basic
source reference chip, basic
AI suggestion as preview, not overwrite
markdown export
snapshot on major save
ledger events for save/import/export/AI apply
```

## Explicitly not MVP

Defer these until foundation is stable:

```text
real-time multi-user collaboration
mail merge
advanced page layout
complex tables
full bibliography manager
full desktop publishing
track changes parity with Word
master documents
formula editor
image layout engine
```

## Architectural warning

Do not choose an editor library only because it renders rich text quickly.

Evaluate editor candidates against:

```text
schema extensibility
collaboration/review support
custom inline nodes
comments/suggestions support
markdown/html/docx export path
large document performance
accessibility
clipboard handling
plugin architecture
React integration
long-term maintainability
```

## Acceptance test direction

Before the editor is considered stable, create tests for:

```text
paste markdown
paste rich text
save document
restore autosave
apply AI suggestion
reject AI suggestion
add comment
resolve comment
insert source reference
export markdown
create snapshot
restore snapshot as copy
```

## Product truth

A writer must be able to ignore the backend and still trust the editor.

The event system, source library, AI gateway, lexicon, and analysis engines only matter if the writing surface feels safe, familiar, and powerful.
