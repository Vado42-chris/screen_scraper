# Observer Engine Spec

## Template Metadata

- template_id: xi-io-observer-engine-spec
- template_version: 1.0.0
- template_status: screen_scraper_initial
- artifact_type: engine_spec
- engine: observer
- observer_layer: 43/Ibal
- required_for: xi-io_compliant_event_bound_products

---

# 1. Purpose

Detect unresolved state, freshness drift, contradiction, missing evidence, unsafe output risk, stale metadata, and broken handoff integrity across the writing product.

The observer layer should help the user without turning the UI into a debugging dashboard.

---

# 2. Relationship to xi-io

The observer watches the engine stack:

```text
Ingress → Binning → Analysis → Lexicon → Egress
          ↑                         ↓
          └────── 43/Ibal Observer ─┘
```

---

# 3. Responsibilities

```text
monitor engine outputs
identify missing docs/configs
flag stale prompts
flag unknown rights
flag missing alt text
flag unresolved comments/suggestions
flag broken source links
flag provider failures
flag unsafe cloud-boundary requests
flag export blockers
flag repo-safety risks
report freshness and validation state
support timeline/calendar projections
```

---

# 4. User-facing tone

Observer warnings must be plain-language and actionable.

Good:

```text
This section prompt may be stale because the section changed after it was used.
```

Bad:

```text
Observer state invalid for bin 04 due to downstream projection mismatch.
```

Advanced details can be visible in expert/developer mode.

---

# 5. Initial observer flags

```text
missing_prompt
stale_prompt
missing_source_provenance
unknown_rights
missing_alt_text
unapproved_metadata
unresolved_comment
unaccepted_suggestion
provider_unavailable
cloud_permission_required
export_blocked
snapshot_recommended
repo_safety_warning
freshness_stale
validation_blocked
```

---

# 6. Event touchpoints

The observer may emit:

```text
observer.warning_created
observer.warning_resolved
observer.warning_dismissed
observer.freshness_marked_stale
observer.validation_blocked
observer.snapshot_recommended
observer.export_blocker_created
observer.repo_safety_warning_created
```

---

# 7. Safety rules

The observer must not:

```text
silently rewrite user text
silently change metadata
silently change rights/license status
send private content to cloud
block user writing unnecessarily
surface raw private source text in logs
```

The observer may:

```text
warn
recommend
open review panel
queue validation job
request user approval
mark freshness state
```

---

# 8. Acceptance criteria

Observer is MVP-ready when:

```text
initial flags are defined
observer rules file exists
observer events are in event model
warnings can link to affected item IDs
warnings can be resolved/dismissed
warnings can be hidden from default writing flow when low urgency
```
