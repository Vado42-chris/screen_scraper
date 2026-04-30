# screen_scraper Bounded Radial Evidence Adapter v1

## Status

Planning/adaptor mapping only.

No runtime implementation is approved by this document.

## Purpose

This document maps the framework-neutral Bounded Radial Evidence Engine into the `screen_scraper` writing and research workflow.

The visible editor should remain simple and writer-facing. The evidence engine works behind the scenes as a source, claim, contradiction, continuity, outline-gap, and export-readiness processor.

## Core framing

```text
The editor stays simple.
The engine works behind the editor.
Bins are weighted evidence states, not folders.
Fire is attention-worthy signal, not confirmed truth.
Collapse means safe-to-use writing guidance, not absolute truth.
```

## Framework relationship

This adapter should conform to the future framework-level standard:

```text
xi-io.net/docs/framework/bounded-radial-evidence-engine-standard-v1.md
```

Until that standard exists, this adapter is provisional and should not become runtime code.

## Product role

`screen_scraper` uses the Bounded Radial Evidence Engine to support writing and research workflows.

It does not expose the full radial/bin machinery by default.

The writer should experience:

```text
clearer source packets
better section prompts
continuity warnings
contradiction warnings
outline-gap warnings
export-readiness warnings
next-question recommendations only when useful
```

The writer should not be forced to manage:

```text
bin assignment
radial geometry
invariant scoring
mirror tests
fire scores
collapse formulas
```

## Engine placement in screen_scraper

```text
Ingress -> Source/Claim Packets -> Bin/Geometry Analysis -> Observer Scoring -> Writer-facing Guidance -> Egress/Export Readiness
```

Existing local engine alignment:

```text
Ingress Engine
Analysis Engine
Lexicon Engine
Egress Engine
Event Ledger
```

The Bounded Radial Evidence adapter should sit primarily behind the Analysis Engine and feed the Egress Engine when export readiness or answer readiness is evaluated.

## Source packet mapping

Each imported source should eventually become a structured source packet.

Minimum packet fields:

```text
source_id
title
source_type
source_text_ref
created_at
updated_at
provenance
rights_status
reliability_score
relevance_score
extracted_claims
entities
tags
contradiction_flags
summary
```

Runtime note:

Raw source text may exist in local runtime storage, but event payloads must remain summary-only.

## Claim mapping

Each source/document claim should be represented as a claim object.

Minimum claim fields:

```text
claim_id
source_id
document_id, optional
section_id, optional
claim_text_ref
claim_summary
semantic_vector_ref
entities
tags
source_reliability_score
relevance_score
uncertainty_score
contradiction_score
timestamp
bin_weights
```

## Bin state mapping

Bins are weighted states.

A bin is not a folder.

A bin should maintain:

```text
bin_id
bin_name
bin_description
bin_center_version
allowed_tags
owner
change_history
weighted_claim_refs
state_summary
confidence_score
contradiction_load
last_updated
```

## Bin governance

Bin centers must be governed.

Each bin center needs:

```text
version
owner
purpose
allowed tags
neighbor policy
opposite/mirror policy
change reason
change timestamp
migration note
```

This prevents silent drift in the analysis model.

## Stability scoring

Exact cross-bin intersections are too strict for real writing/research workflows.

The adapter should use stability scoring instead.

A candidate pattern becomes useful when it appears across enough bin lenses with enough confidence and low enough variance.

Practical state labels:

```text
candidate_pattern
stable_pattern
candidate_invariant
variable_pattern
framing_sensitive_pattern
noise
```

## Fire scoring

Fire means attention-worthy signal.

It does not mean confirmed truth.

Fire signals should surface as:

```text
repeated_overlap_detected
growing_theme_detected
contradiction_cluster_detected
continuity_pressure_detected
source_cluster_detected
```

They should not surface as:

```text
confirmed_truth
final_answer
absolute conclusion
```

## Continuity use cases

The adapter should support continuity checks across:

```text
chapter headings
section prompts
characters
locations
timeline events
repeated claims
repeated themes
source references
media/figure references
lexicon terms
```

Writer-facing examples:

```text
This chapter introduces a claim not supported by the current source packet.
This character appears with conflicting location context.
This section repeats an earlier argument with weaker source support.
This outline has a gap between setup and payoff.
```

## Outline-gap processor

The engine should compare:

```text
current outline
planned beats
section headings
source packets
active claims
unresolved blockers
export profile requirements
```

It should generate warnings such as:

```text
missing support section
unresolved contradiction
unused source packet
orphaned section prompt
chapter has no claim support
export profile requires source appendix but sources are unresolved
```

## Next-question gate

The system should prevent runaway research and runaway AI questioning.

A next question is allowed only when it does at least one of these:

```text
changes a writing/export decision
resolves a blocker
fills a meaningful evidence gap
reduces contradiction load
improves continuity or source readiness
```

Questions should be blocked or archived when they are only:

```text
curiosity expansion
low-impact branching
duplicate inquiry
speculative tangent
unbounded worldbuilding drift
```

## Export readiness integration

The adapter should feed the Egress Engine with export readiness signals.

Readiness signals:

```text
source_reference_count
unsupported_claim_count
contradiction_count
outline_gap_count
unresolved_rights_count
unresolved_license_count
orphan_prompt_count
lexicon_unresolved_count
media_metadata_gap_count
```

Export should remain possible for local draft formats with warnings, but share/publish/archive profiles may require acknowledgement or blocking depending on risk.

## Writer-facing UI principle

Default UI should show simple guidance, not the machinery.

Allowed default guidance:

```text
Needs source support
Contradiction found
Continuity warning
Outline gap
Export warning
Useful next question
```

Power-user views may expose deeper evidence structure later, but only behind intentional actions such as:

```text
Show evidence map
Show source clusters
Show contradiction graph
Show bin analysis
Show export readiness details
```

## Event ledger posture

Events should record summary outcomes only.

Potential future events:

```text
evidence.source_packet_created
evidence.claim_extracted
evidence.contradiction_detected
evidence.continuity_warning_created
evidence.outline_gap_detected
evidence.next_question_allowed
evidence.next_question_blocked
evidence.export_readiness_scored
```

Forbidden event payload fields:

```text
raw source content
raw document content
raw claim text
raw AI suggestion text
secret values
absolute local filesystem paths
private user directory names
```

Allowed summary fields:

```text
source_id
document_id
section_id
claim_id
bin_id
pattern_id
warning_type
confidence_score
contradiction_score
stability_score
warning_count
blocked_reason
```

## Non-goals

Do not implement yet:

```text
radial visualization
multi-bin runtime engine
automatic claim extraction runtime
semantic vector store
cross-lens invariant computation
full contradiction graph
AI-driven auto-rewrite based on evidence score
```

## First future implementation target

When implementation begins, start with the smallest safe loop:

```text
1. Source packet summary
2. Manual/lightweight claim extraction
3. Source-to-section association
4. Unsupported-claim warning
5. Export readiness warning count
6. Summary-only ledger events
```

Do not begin with full radial geometry.

## Acceptance criteria for this adapter plan

This plan is acceptable when:

```text
editor remains writer-facing
evidence machinery stays behind the editor
bins are treated as weighted states
fire is treated as attention signal
stability scoring replaces exact intersections
bin center governance is required
next-question gating prevents runaway branching
export readiness receives evidence signals
no runtime implementation is implied
```
