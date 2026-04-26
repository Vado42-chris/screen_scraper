# Editor Engine Evaluation v1

## Status

This document evaluates candidate editor engines for `screen_scraper` before implementation hardens.

The editor engine is a structural decision, not a cosmetic library choice. It controls the document model, cursor context, section anchors, comments, suggestions, semantic blocks, image nodes, source references, export path, accessibility behavior, and AI editing safety.

---

# 1. Decision Summary

Recommended MVP direction:

```text
Primary candidate: Tiptap / ProseMirror
Secondary candidate: Lexical
Do not choose Slate/Plate for MVP unless a later spike proves it solves our requirements better.
```

Reason:

```text
Tiptap/ProseMirror best matches the current requirements for custom nodes, structured document schema, stable node positions, rich inline objects, semantic blocks, comments/suggestions potential, image nodes, and long-term document-production workflows.
```

This is a recommendation for a first implementation spike, not an irreversible final selection.

---

# 2. Source Evidence

## Tier 0 Local Evidence

- local files:
  - /mnt/data/scripts_plan.md
- notes:
  - Source direction emphasizes a simple writing/chat/document surface with hidden backend structure, optional #tags, @references, [[blocks]], and a live document panel. The app must feel like writing, while deeper structure works underneath.

## Tier 1 Repo Evidence

- repo files:
  - docs/word-processor-requirements-v1.md
  - docs/editor-context-and-application-menu-v1.md
  - docs/document-media-layout-and-generation-v1.md
  - docs/active-outline-and-section-prompts-v1.md
  - docs/story-spine-and-storyboard-system-v1.md
  - docs/command-and-action-registry-v1.md
  - docs/backend-service-boundaries-v1.md
  - docs/components/document-canvas.md
  - docs/components/chat-composer.md
  - docs/components/active-outline.md
  - docs/planning/wireframe-spec.md

## Tier 2 Management Evidence

- xi-io alignment:
  - editor actions must emit events
  - AI changes require review
  - semantic syntax must map to the lexicon engine
  - private document content stays local/vault

## Missing Evidence

- implementation spike results
- exact plugin package choices
- performance testing on long documents
- export pipeline proof

---

# 3. Evaluation Criteria

The editor must support or leave a clean path for:

```text
custom block nodes
custom inline nodes/chips
stable heading anchors
cursor/selection context
comments
suggestions / track-change-like review
source reference chips
#tag / @reference / [[block]] inline syntax
image insertion and image placement nodes
section prompt markers
semantic markup toggle
Markdown import/export
HTML import/export
future DOCX/PDF export path
large document behavior
React integration
keyboard accessibility
plugin extensibility
local-first persistence
AI patch previews
```

Hard requirements:

```text
AI must not silently overwrite text.
Document changes must be representable as patches/suggestions.
Heading anchors must support active outline and cursor context.
Custom nodes must support source refs, image placements, prompt blocks, and semantic blocks.
```

---

# 4. Candidate: Tiptap / ProseMirror

## Fit Summary

Tiptap is a React-friendly editor framework built on ProseMirror's structured document model and plugin system.

It is the strongest candidate for MVP because it gives us a schema-based rich document model and mature patterns for custom nodes/marks.

## Strengths

```text
structured document schema
strong custom node/mark support
React integration through Tiptap
rich extension ecosystem
good fit for inline chips and block nodes
heading/outline extraction is practical
image node support is practical
Markdown/HTML pathways are practical
collaboration can be considered later without making it MVP
```

## Risks

```text
ProseMirror concepts can be complex
track-change-like suggestions may require custom extension work
floating image layout may require careful custom node/view design
large document performance must be tested
export parity with Word/LibreOffice will still require a separate export layer
```

## Fit Against screen_scraper Needs

| Requirement | Fit | Notes |
|---|---:|---|
| Custom semantic blocks | High | Good schema/node fit |
| #tags / @refs / chips | High | Marks/inline nodes fit |
| [[blocks]] | High | Custom block/inline nodes fit |
| Active outline | High | Extract headings from document state |
| CursorContext | High | Selection and resolved position support this well |
| Comments | Medium-High | Needs extension/model work |
| AI suggestions | Medium | Needs custom review/suggestion system |
| Image insertion | High | Image nodes/node views are practical |
| Advanced wrapping/floating images | Medium | Possible, but not MVP |
| Markdown/HTML export | High | Practical path |
| DOCX/PDF export | Medium | Requires external export/rendering layer |
| Accessibility | Medium-High | Must be implemented carefully |

## Implementation Spike Tasks

```text
create Tiptap document shell
load/save editor JSON
extract heading anchors
publish CursorContext
insert source reference chip
insert [[prompt:section]] block marker
insert image placeholder node
create suggestion preview decoration
export Markdown from editor state
```

## Verdict

Recommended first implementation spike.

---

# 5. Candidate: Lexical

## Fit Summary

Lexical is a modern editor framework with strong React affinity and good performance/design choices.

It is a credible second candidate, especially for interactive editing and custom nodes, but may require more custom product architecture work for our document-production requirements.

## Strengths

```text
modern architecture
React-friendly ecosystem
good custom node potential
performance-oriented editing model
clean interactive editor experience
```

## Risks

```text
document-production/export path may need more custom work
plugin ecosystem may not align as directly with our long-form writing/export needs
comments/suggestions and semantic block workflows still require custom design
migration path from custom Lexical state to export formats must be proven
```

## Fit Against screen_scraper Needs

| Requirement | Fit | Notes |
|---|---:|---|
| Custom semantic blocks | High | Custom nodes possible |
| #tags / @refs / chips | High | Custom text/entity nodes possible |
| [[blocks]] | High | Possible with custom nodes |
| Active outline | Medium-High | Must extract reliably from editor state |
| CursorContext | High | Editor state/selection can support this |
| Comments | Medium | Custom work likely |
| AI suggestions | Medium | Custom review layer required |
| Image insertion | Medium-High | Possible with custom nodes |
| Advanced wrapping/floating images | Medium | Custom work |
| Markdown/HTML export | Medium | Needs proof for our exact path |
| DOCX/PDF export | Medium-Low | Requires external layer and more proof |
| Accessibility | Medium-High | Must be implemented carefully |

## Implementation Spike Tasks

```text
create Lexical document shell
load/save editor state
extract heading anchors
publish CursorContext
insert source reference chip
insert [[prompt:section]] marker
insert image placeholder node
create suggestion preview mechanism
prove Markdown export path
```

## Verdict

Strong backup candidate. Consider if the Tiptap spike fails or if Lexical proves better for performance/custom-node ergonomics.

---

# 6. Candidate: Slate / Plate

## Fit Summary

Slate and Plate can support flexible rich-text editing, but this project needs a very reliable structured document environment with many semantic nodes, events, source references, prompts, AI patches, and export flows.

Slate/Plate may still be viable, but it carries more risk for this project unless a spike proves otherwise.

## Strengths

```text
very flexible document structures
React-friendly
Plate provides higher-level editor patterns
custom inline/block behavior possible
```

## Risks

```text
flexibility can become architecture drift
schema discipline may require more app-level enforcement
complex nested semantic blocks may become brittle
track-change/comment/export workflows still custom
long-term maintainability risk if document model becomes too ad hoc
```

## Fit Against screen_scraper Needs

| Requirement | Fit | Notes |
|---|---:|---|
| Custom semantic blocks | Medium-High | Possible, but discipline required |
| #tags / @refs / chips | Medium-High | Possible |
| [[blocks]] | Medium | Possible, but schema enforcement concern |
| Active outline | Medium | Must enforce heading model carefully |
| CursorContext | Medium-High | Possible |
| Comments | Medium | Custom work |
| AI suggestions | Medium | Custom work |
| Image insertion | Medium | Possible |
| Advanced wrapping/floating images | Medium | Custom work |
| Markdown/HTML export | Medium | Requires careful mapping |
| DOCX/PDF export | Medium-Low | External/custom layer required |
| Accessibility | Medium | Must be implemented carefully |

## Verdict

Not recommended for MVP unless a specific implementation spike proves a strong advantage over Tiptap/ProseMirror.

---

# 7. Comparative Scorecard

Scale:

```text
1 = poor fit
2 = weak fit
3 = workable
4 = strong
5 = excellent
```

| Criterion | Tiptap/ProseMirror | Lexical | Slate/Plate |
|---|---:|---:|---:|
| Structured document model | 5 | 4 | 3 |
| Custom nodes/marks | 5 | 5 | 4 |
| Heading anchors/outline | 5 | 4 | 3 |
| CursorContext support | 5 | 5 | 4 |
| Semantic syntax support | 5 | 5 | 4 |
| Image node support | 4 | 4 | 3 |
| Suggestion/review path | 3 | 3 | 3 |
| Export path confidence | 4 | 3 | 3 |
| Plugin ecosystem fit | 4 | 3 | 4 |
| Long-term document production fit | 5 | 4 | 3 |
| Complexity risk | 3 | 3 | 3 |
| Overall MVP fit | 5 | 4 | 3 |

---

# 8. Recommended Decision

Choose **Tiptap / ProseMirror** for the first implementation spike.

Do not overbuild the editor in slice 1.

The first editor spike should prove only:

```text
document loads/saves
heading anchors extract correctly
cursor context updates correctly
source reference chip can be inserted
prompt block marker can be inserted
image placeholder can be inserted
AI suggestion can appear as a reviewable patch/decoration
Markdown export is plausible
```

If that spike fails, run a Lexical spike against the same requirements.

---

# 9. MVP Editor Scope

MVP editor capabilities:

```text
paragraphs
H1/H2/H3 headings
bold/italic/lists/quotes
manual save/autosave checkpoint
cursor context publication
active outline extraction
source reference chips
section prompt markers
image placeholder/block insertion
comment anchor stub
AI suggestion preview stub
Markdown export
```

Not MVP:

```text
full track changes parity
advanced floating image layout
DOCX/PDF perfect export
complex tables
real-time collaboration
mobile-first editing
full desktop publishing layout
```

---

# 10. Required Editor Adapter Boundary

Do not let editor-specific code leak throughout the app.

Create an adapter boundary:

```text
EditorAdapter
  loadDocument(state)
  serializeDocument()
  getCursorContext()
  getHeadingAnchors()
  insertHeading(level)
  insertSourceReference(ref)
  insertPromptBlock(prompt)
  insertImagePlacement(image)
  applySuggestionPreview(patch)
  acceptSuggestion(id)
  rejectSuggestion(id)
  exportMarkdown()
```

Future implementation locations may be:

```text
app/frontend/src/editor/EditorAdapter.ts
app/frontend/src/editor/tiptap/TiptapEditorAdapter.ts
app/frontend/src/editor/types.ts
```

This protects us if we need to switch editor engines later.

---

# 11. Event Requirements

The editor adapter must support events:

```text
selection.changed
cursor_context.changed
heading.created
heading.updated
document.saved
source_reference.inserted
image.inserted
suggestion.created
suggestion.accepted
suggestion.rejected
comment.created
```

Not all need ledger persistence, but meaningful document state changes must route through services/events.

---

# 12. Safety Requirements

```text
AI output appears as suggestion/preview first.
Accept/reject is explicit.
Raw private document text is never written to repo-safe logs.
Autosave does not replace named versions silently.
Large destructive changes should recommend snapshot first.
```

---

# 13. Accessibility Requirements

```text
semantic headings
keyboard navigation
visible focus
screen-reader labels for chips/comments/suggestions
non-color-only warning states
reduced-motion friendly behavior
```

---

# 14. Testing Requirements

The editor spike must test:

```text
load/save document state
extract heading outline
cursor context update
insert source reference chip
insert prompt block
insert image placeholder
show AI suggestion preview
accept/reject suggestion
export Markdown smoke test
keyboard focus smoke test
```

---

# 15. Acceptance Criteria

Implementation may proceed with Tiptap/ProseMirror if the spike proves:

```text
custom nodes work for source refs, prompt blocks, and images
heading anchors are stable enough for ActiveOutline
cursor context can be published on selection changes
AI suggestion previews are feasible
Markdown export is feasible
DocumentCanvas can remain editor-engine isolated through an adapter
```

---

# 16. Open Gaps

```text
exact Tiptap extensions to install
license/package review
large document performance test
Markdown serializer choice
DOCX/PDF export strategy
comment/suggestion detailed data model
image layout node design
```
