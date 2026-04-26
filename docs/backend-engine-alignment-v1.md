# Backend Engine Alignment v1

This document aligns `screen_scraper` with the white-label xi-io backend engine model.

## Core correction

`screen_scraper` should not invent a separate backend engine architecture.

It should be a product-specific writing/document/research adapter built on top of the xi-io reusable engine stack:

```text
Ingress → Binning → Analysis → Lexicon → Egress
```

with the 43/Ibal observer layer watching freshness, contradiction, missing context, unresolved state, and handoff integrity.

## xi-io engine model

The xi-io backend engine architecture defines a reusable backend foundation that can apply across websites, apps, games, books, TTRPGs, video, animation, research, and mixed-media products.

The standard engine stack is:

```text
Ingress
Binning
Analysis
Lexicon / Rosetta
Egress
Observer Layer — 43 / Ibal
```

## How screen_scraper maps to xi-io engines

### Ingress

Purpose in xi-io:

```text
capture incoming signals without interpretation
```

Purpose in screen_scraper:

```text
capture imported sources, pasted text, uploaded files, document edits, chat instructions, generated media, metadata proposals, project planning changes, provider health events, and export actions
```

Screen_scraper-specific ingress adapters:

```text
local file import
large paste import
script/transcript import
source URL import, later
editor event adapter
chat instruction adapter
media upload adapter
AI provider result adapter
GitHub/repo state adapter, later
```

### Binning

Purpose in xi-io:

```text
classify and organize events into reusable category systems
```

Purpose in screen_scraper:

```text
classify writing, source, metadata, rights, planning, media, and analysis events into project bins, story bins, source bins, semantic tags, unresolved states, and observer flags
```

Screen_scraper should treat binning as a backend classification layer, not as a default visible UI burden.

### Analysis

Purpose in xi-io:

```text
interpret meaning, impact, stability, resolution, and relationships
```

Purpose in screen_scraper:

```text
analyze source relevance, document structure, continuity, section readiness, unresolved prompts, metadata confidence, rights uncertainty, image placement issues, export readiness, and writing/story coherence
```

Analysis outputs should surface as:

```text
InsightCard
CitationChip
EvidenceDrawer
ContinuityWarning
MetadataReviewChip
DocumentHealthCheck
ExportReadinessCheck
TimelineEventCard
```

### Lexicon / Rosetta

Purpose in xi-io:

```text
normalize terms across project types and domains
```

Purpose in screen_scraper:

```text
normalize #tags, @references, [[blocks]], section prompts, character/location aliases, glossary terms, rights/license labels, style terms, source categories, and user-defined mental models
```

This is the correct home for the user-facing semantic language.

### Egress

Purpose in xi-io:

```text
route approved outputs and staged actions to UI, docs, repo, notifications, and external tools
```

Purpose in screen_scraper:

```text
route approved document edits, AI suggestions, generated media, exports, metadata updates, snapshot restores, source insertions, glossary updates, document generation, repo-safe planning docs, and future provider actions
```

Egress must enforce approval gates:

```text
AI proposes, user approves
metadata proposes, user approves
rights changes preview, user approves
rollback preview, user approves
cloud use prompts, user approves
```

### Observer Layer — 43 / Ibal

Purpose in xi-io:

```text
detect inconsistency, freshness drift, missing documentation, contradictions, and unresolved state
```

Purpose in screen_scraper:

```text
watch for stale prompts, unresolved comments, source contradictions, missing alt text, unknown rights, stale metadata, broken source links, incomplete planning cards, export blockers, missing provider specs, and stale project docs
```

## Product-specific modules vs core engines

Some `screen_scraper` modules are real product services, but they should not be mistaken for new white-label engines.

These are product-specific services/adapters:

```text
word processor/editor service
source library service
retrieval/context builder
AI gateway/model router
media library service
story spine/storyboard service
active outline service
snapshot service
export renderer
```

They plug into the xi-io engines.

Example:

```text
source library import
→ Ingress captures source.imported
→ Binning classifies source type and tags
→ Analysis summarizes/relevance-scores/chunks
→ Lexicon maps aliases/tags/entities
→ Egress updates UI/source library/search index
→ Observer flags missing provenance or rights uncertainty
```

## White-label boundary

The engines should remain reusable across xi-io products.

`screen_scraper` should contribute product-specific adapters and schemas, not fork the engine model.

Correct:

```text
engines/ingress + adapters/writing_source_import
engines/analysis + rules/document_structure_analysis
engines/lexicon + domain/writing_terms
engines/egress + outputs/document_export
```

Incorrect:

```text
screen_scraper creates a separate unrelated analysis system
screen_scraper creates a separate tag engine incompatible with Rosetta
screen_scraper stores event history outside the xi-io event model
screen_scraper has its own undocumented egress rules
```

## Required screen_scraper engine artifacts

To become xi-io-compliant, `screen_scraper` needs local instances of the engine artifacts.

```text
engines/ingress/ingress-engine-spec.md
engines/ingress/ingress-config.yaml
engines/ingress/ingress-schema.json
engines/ingress/ingress-adapters.yaml

engines/binning/binning-engine-spec.md
engines/binning/bin-map-42.yaml
engines/binning/binning-schema.json

engines/analysis/analysis-engine-spec.md
engines/analysis/analysis-rules.yaml
engines/analysis/analysis-schema.json

engines/lexicon/lexicon-engine-spec.md
engines/lexicon/lexicon.yaml
engines/lexicon/aliases.yaml
engines/lexicon/domain-terms.yaml

engines/egress/egress-engine-spec.md
engines/egress/egress-config.yaml
engines/egress/egress-schema.json

engines/observer/observer-engine-spec.md
engines/observer/ibal-context-schema.json
engines/observer/observer-rules.yaml
```

## MVP alignment sequence

Build the engine alignment before app scaffolding hardens:

```text
1. Create screen_scraper engine artifact stubs from xi-io templates.
2. Define writing/source/media/project adapters for ingress.
3. Define first event taxonomy.
4. Define lexicon primitives: #tags, @refs, [[blocks]], [[prompt:section]], [[image:prompt]].
5. Define analysis rules for MVP: source relevance, metadata confidence, prompt staleness, export readiness.
6. Define egress rules for approved document edits, source insertion, metadata approval, export generation.
7. Define observer rules for stale/missing/blocked states.
```

## Product truth

`screen_scraper` is not only a word processor.

It is a writing-focused surface over the xi-io white-label engine stack.

The user should feel like they are writing, while the engines quietly capture, classify, analyze, normalize, and safely output the work.
