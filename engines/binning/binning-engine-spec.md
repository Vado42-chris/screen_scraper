# Binning Engine Spec

## Template Metadata

- template_id: xi-io-binning-engine-spec
- template_version: 1.0.0
- template_status: screen_scraper_initial
- artifact_type: engine_spec
- engine: binning
- required_for: xi-io_compliant_event_bound_products

---

# 1. Purpose

Classify captured events, documents, sources, media, metadata, rights, planning objects, and unresolved states into reusable category systems without forcing those systems onto the default writing UI.

The binning engine is a backend organizer, not a front-end burden.

---

# 2. Relationship to xi-io

This engine conforms to the xi-io backend engine model:

```text
Ingress → Binning → Analysis → Lexicon → Egress
```

Ingress captures signals. Binning classifies them. Analysis interprets them. Lexicon normalizes their language. Egress routes safe outputs.

---

# 3. Primary responsibilities

```text
assign bin IDs
assign confidence scores
link related bins
mark unresolved observer flags
support 42-bin / 43-observer model
support product-specific writing bins
support source/library bins
support rights/media/planning bins
emit binning events
feed analysis and observer layers
```

---

# 4. Product-specific bin domains

Initial screen_scraper domains:

```text
document_structure
source_library
story_spine
metadata_review
rights_license
media_layout
ai_provider
export_readiness
runtime_health
privacy_boundary
```

---

# 5. Classification rules

The binning engine may classify by:

```text
event_type
target_type
source_type
document_section
semantic tag
rights status
metadata status
provider capability
analysis domain
observer flag
```

The binning engine should not claim final meaning. It organizes candidate categories for downstream analysis.

---

# 6. User visibility

Default user view:

```text
plain-language statuses and badges
```

Advanced view:

```text
bin IDs
bin confidence
related bins
observer flags
raw classification metadata
```

---

# 7. Safety and privacy

Binning must not expose private source text, document text, secrets, or raw provider payloads in repo-safe artifacts or logs.

Store references, IDs, hashes, counts, and safe summaries instead.

---

# 8. Initial event touchpoints

```text
source.imported
source.normalized
source.indexed
document.created
document.saved
heading.created
section_prompt.generated
metadata.generated
metadata.approved
rights.item_license_updated
image.inserted
image.generated
ai.requested
ai.completed
export.generated
snapshot.created
observer.warning_created
```

---

# 9. Acceptance criteria

The binning engine is MVP-ready when:

```text
bin map exists
binning schema exists
events can receive bin IDs and confidence
unresolved observer flags are supported
advanced bin view can be hidden from normal users
analysis engine can consume bin output
```
