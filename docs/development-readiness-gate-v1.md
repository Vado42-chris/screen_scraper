# Development Readiness Gate v1

## Status

This document defines the gate between planning and implementation for `screen_scraper`.

The goal is to begin development without drifting away from the xi-io backend engine model, without losing the word processor requirements, and without accidentally committing runtime/private data.

---

# 1. Current Verdict

`screen_scraper` is close to implementation-ready.

The repo now has enough product, engine, event, data, provider, security, and local environment planning to begin scaffolding once the remaining critical decisions below are addressed.

Recommended verdict:

```text
Planning foundation: sufficient
Engine compliance foundation: sufficient for MVP scaffold
Implementation code: not started
Ready to scaffold: yes, after editor decision short-list and command registry contract
```

---

# 2. Completed Foundation

## Product and governance

```text
README.md
.gitignore
docs/planning/project-brief.md
docs/security-and-secrets-policy.md
docs/local-environment-aries.md
docs/xi-io-template-alignment-v1.md
docs/xi-io-dependency-readiness-assessment-v1.md
```

## Word processor and UX planning

```text
docs/word-processor-requirements-v1.md
docs/ui-composition-contract-v1.md
docs/component-inventory-v1.md
docs/workspace-modes-v1.md
docs/editor-context-and-application-menu-v1.md
docs/active-outline-and-section-prompts-v1.md
docs/story-spine-and-storyboard-system-v1.md
```

## Backend and event planning

```text
docs/backend-engine-alignment-v1.md
docs/backend-research-integration-v1.md
docs/event-ledger-and-snapshots-v1.md
docs/events/event-model.yaml
docs/data/document-data-model.yaml
```

## Media, metadata, and rights

```text
docs/document-media-layout-and-generation-v1.md
docs/inserted-item-metadata-approval-v1.md
docs/license-and-rights-metadata-v1.md
```

## Provider planning

```text
docs/providers/ollama-provider-spec.md
```

## xi-io engine artifacts

```text
engines/ingress/ingress-config.yaml
engines/ingress/ingress-schema.json
engines/binning/binning-engine-spec.md
engines/binning/bin-map-42.yaml
engines/binning/binning-schema.json
engines/analysis/analysis-rules.yaml
engines/analysis/analysis-schema.json
engines/lexicon/lexicon.yaml
engines/lexicon/lexicon-schema.json
engines/egress/egress-config.yaml
engines/egress/egress-schema.json
engines/observer/observer-engine-spec.md
engines/observer/observer-rules.yaml
engines/observer/ibal-context-schema.json
```

---

# 3. Must Be Decided Before Implementation Scaffold Hardens

## 3.1 Editor engine shortlist

Do not pick casually.

Need a short evaluation doc comparing:

```text
ProseMirror / Tiptap
Lexical
Slate / Plate
other mature editor stack if justified
```

Evaluation criteria:

```text
custom nodes
inline chips
comments/suggestions
track-change-like review
stable anchors
headings/outline
image insertion/layout extensibility
Markdown/HTML/DOCX export path
large document behavior
accessibility
React integration
plugin ecosystem
long-term maintainability
```

Required artifact:

```text
docs/editor-engine-evaluation-v1.md
```

Gate status: required before editor implementation.

## 3.2 Command/action registry contract

The menu system, toolbar, slash commands, BBCode-like syntax, chat intents, context menus, and keyboard shortcuts must call the same registered actions.

Required artifact:

```text
docs/command-and-action-registry-v1.md
```

Gate status: required before frontend action implementation.

## 3.3 Backend service boundary contract

Need one document mapping services to xi-io engines.

Required artifact:

```text
docs/backend-service-boundaries-v1.md
```

Must define:

```text
document service
source library service
media service
metadata service
rights service
AI gateway
retrieval service
event ledger service
snapshot service
export service
observer service
```

Gate status: required before backend scaffold hardens.

---

# 4. Should Be Created During First Scaffold

These can be created with implementation scaffolding, not necessarily before it.

```text
app/backend/
app/frontend/
config/app.example.yaml
config/providers.example.yaml
scripts/dev.sh
scripts/check.sh
scripts/smoke.sh
```

Expected stack:

```text
FastAPI backend
React + Vite frontend
SQLite local database
local vault filesystem
Ollama provider adapter
```

---

# 5. First Implementation Slice

The first implementation slice should be deliberately small.

## Slice 1: runtime + provider health

```text
backend starts
frontend starts
health endpoint works
config loads example defaults
Ollama health check endpoint exists
Ollama model list endpoint exists
frontend displays provider status
ledger records app.started and ollama.health_checked
```

No editor yet.

This proves:

```text
repo scaffold
backend/frontend connection
AI provider adapter path
event ledger foundation
runtime config pattern
```

## Slice 2: document create/save skeleton

```text
create document
save document title/content stub
list documents
open document
emit document.created/document.saved
```

The editor can initially be a plain controlled field for scaffold testing only, but must be replaced by the chosen editor engine after evaluation.

## Slice 3: source import skeleton

```text
import local text/markdown into vault
store SourceArtifact metadata
emit source.imported
show source in library list
```

---

# 6. Hard Stop Rules

Do not proceed with implementation patterns that violate these rules:

```text
UI calls Ollama directly
private source/document text committed to Git
runtime folders committed to Git
model files committed to Git
AI changes document without preview/approval
metadata silently approved
rights/license silently changed
cloud provider used without explicit policy
editor selected without evaluation
features bypass event ledger
features bypass command/action registry
```

---

# 7. Repo Safety Checks Before First Code Commit

Run or manually verify:

```bash
git status --ignored
find . -maxdepth 4 -type f \( -name "*.env" -o -name "*.key" -o -name "*.pem" -o -name "*.secret" \)
```

Expected:

```text
no secrets
no runtime data
no vault contents
no model files
no generated private exports
```

---

# 8. Acceptance Criteria for Starting Code

Implementation may begin when:

```text
project brief exists
engine artifacts exist
event model exists
document data model exists
Ollama provider spec exists
security policy exists
local environment doc exists
editor engine evaluation is created or explicitly scoped as next immediate doc
command/action registry is created or explicitly scoped as next immediate doc
backend service boundary is created or explicitly scoped as next immediate doc
first implementation slice is limited to health/provider/runtime
```

---

# 9. Current Open Gaps

```text
editor-engine-evaluation-v1.md
command-and-action-registry-v1.md
backend-service-boundaries-v1.md
source-library-data-model.yaml
media-generation-job-data-model.yaml
export-job-data-model.yaml
first component contracts
first PRDs
implementation scaffold
```

---

# 10. Recommendation

Proceed in this order:

```text
1. Add editor-engine-evaluation-v1.md
2. Add command-and-action-registry-v1.md
3. Add backend-service-boundaries-v1.md
4. Scaffold backend/frontend runtime health slice
5. Add Ollama health/model endpoints
6. Add event ledger minimal SQLite table
7. Add frontend provider status panel
```

This keeps the app build moving while protecting the architecture from early drift.
