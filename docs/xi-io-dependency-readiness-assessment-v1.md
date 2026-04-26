# xi-io Dependency Readiness Assessment v1

## Question

Is `Vado42-chris/xi-io.net` complete enough to use as the backend foundation for `screen_scraper`, or does more work need to happen in `xi-io.net` first?

## Verdict

`xi-io.net` is complete enough as an architectural source of truth and template authority.

It is not yet complete enough as a reusable executable backend package that `screen_scraper` can import and run directly.

Therefore:

```text
Do not block screen_scraper development.
Do not wait for xi-io.net to become a full backend framework.
Do make screen_scraper compliant with xi-io engine templates and governance rules from the start.
```

## Current xi-io readiness

### Ready now

`xi-io.net` provides enough planning structure for:

```text
backend engine model
project template format
data model template
event model template
component contract template
provider spec template
security/privacy/rbac/audit/accessibility template direction
```

This is enough to standardize `screen_scraper` documentation, local engine artifact stubs, schemas, provider specs, and development gates.

### Not ready yet

`xi-io.net` does not appear to be an executable reusable backend framework yet.

Missing or not confirmed:

```text
importable engine packages
shared runtime service
shared Python/Node package
published schemas as versioned package
provider SDK
engine runner
validation CLI
Workbench-driven artifact generator
common migration system
shared test harness
```

## Development decision

Start `screen_scraper` now, but implement it as a product-specific adapter that conforms to xi-io contracts.

Correct pattern:

```text
screen_scraper owns its MVP runtime
screen_scraper creates local engine artifacts
screen_scraper follows xi-io template metadata and safety gates
screen_scraper can later be absorbed/managed by xi-io.net
```

Incorrect pattern:

```text
pause screen_scraper until xi-io.net is finished
fork a separate engine model inside screen_scraper
hardcode incompatible event/data/provider patterns
ignore xi-io template metadata
```

## Practical implementation plan

### Phase 1: local compliant implementation

Create in `screen_scraper`:

```text
engines/ingress/
engines/binning/
engines/analysis/
engines/lexicon/
engines/egress/
engines/observer/
```

Populate with project-local stubs based on xi-io templates.

### Phase 2: build MVP against local contracts

Build the first app runtime using local backend services:

```text
FastAPI backend
React/Vite frontend
SQLite event/data store
local vault
Ollama provider adapter
source import pipeline
editor/document service
```

### Phase 3: keep xi-io compatibility

Every local service should map to xi-io engine concepts:

```text
source import → ingress event
classification/tagging → binning/lexicon
source relevance/export checks → analysis
approved outputs/exports → egress
stale/missing/blocked states → observer
```

### Phase 4: later extraction or integration

When `xi-io.net` matures into an executable operations/control plane, migrate shared parts upward:

```text
schemas
engine runners
provider adapters
validation CLI
artifact generator
repo/local state sync
workflow dashboards
```

## Minimum xi-io work that would help but should not block

Useful next work in `xi-io.net`:

```text
1. engine artifact generator
2. schema validation CLI
3. template instance registry
4. repo readiness scanner
5. shared provider spec registry
6. shared event taxonomy registry
7. local project state sync model
```

None of those are required before starting `screen_scraper` MVP.

## Build gate for screen_scraper

Before implementation code, create these local artifacts:

```text
docs/planning/project-brief.md
docs/planning/prd-word-processor-core.md
docs/planning/prd-source-library-ingress.md
docs/planning/prd-ai-gateway-local-first.md
engines/ingress/ingress-config.yaml
engines/analysis/analysis-rules.yaml
engines/lexicon/lexicon.yaml
engines/egress/egress-config.yaml
docs/providers/ollama-provider-spec.md
docs/data/document-data-model.yaml
docs/events/event-model.yaml
```

After those exist, implementation can begin safely.

## Product truth

`xi-io.net` is mature enough to govern `screen_scraper`.

It is not mature enough to replace `screen_scraper`'s local backend implementation.

That is fine. The right move is to build locally now, but build in the xi-io shape so nothing has to be thrown away later.
