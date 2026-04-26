# Development Readiness Gate v1

## Status

This document defines the gate between planning and implementation for `screen_scraper`.

The goal is to build without drifting away from the xi-io backend engine model, without losing the word processor requirements, and without accidentally committing runtime/private data.

---

# 1. Current Verdict

`screen_scraper` has moved from documentation-only planning into the first runtime scaffold.

Current verdict:

```text
Planning foundation: sufficient for MVP scaffold
Engine compliance foundation: sufficient for MVP scaffold
Implementation code: started
Runtime/provider slice: scaffolded, not locally verified
Word processor/editor: not implemented yet
Ready for user local pull/demo: no
```

The repo should not be treated as demo-ready until the first usable word-processor loop exists.

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
docs/remote-development-quality-gate-v1.md
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
docs/planning/information-architecture-map.md
docs/planning/page-system-map.md
docs/planning/wireframe-spec.md
docs/editor-engine-evaluation-v1.md
```

## Component contracts

```text
docs/components/document-canvas.md
docs/components/chat-composer.md
docs/components/active-outline.md
docs/components/right-context-panel.md
docs/components/source-drawer.md
docs/components/metadata-review-panel.md
```

## Backend and event planning

```text
docs/backend-engine-alignment-v1.md
docs/backend-research-integration-v1.md
docs/event-ledger-and-snapshots-v1.md
docs/events/event-model.yaml
docs/data/document-data-model.yaml
docs/command-and-action-registry-v1.md
docs/backend-service-boundaries-v1.md
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

## Runtime scaffold

```text
app/backend/pyproject.toml
app/backend/app/config.py
app/backend/app/main.py
app/backend/app/services/event_ledger.py
app/backend/app/services/ollama_provider.py
app/frontend/package.json
app/frontend/index.html
app/frontend/tsconfig.json
app/frontend/src/main.tsx
app/frontend/src/styles.css
scripts/dev-backend.sh
scripts/dev-frontend.sh
scripts/smoke.sh
```

---

# 3. Completed Gate Items

These required gates are now satisfied as documentation artifacts:

```text
editor engine evaluation
command/action registry contract
backend service boundaries
formal IA/page/wireframe docs
first component contracts
first runtime/provider scaffold
```

---

# 4. Current Hard Gaps Before Local Demo

```text
config/app.example.yaml
config/providers.example.yaml
scripts/check.sh
Tiptap/ProseMirror editor spike
EditorAdapter implementation
document create/open/save skeleton
ActiveOutline integration
cursor-aware ChatComposer integration
AI request path beyond provider status
source import/read/search skeleton
metadata proposal/review implementation
image insertion placeholder or first insertion path
Markdown export
basic snapshot/event history UI
```

---

# 5. First Local Demo Threshold

Do not ask the user to pull for demo until this minimum loop exists:

```text
backend and frontend start
document create/open/save works
Tiptap/ProseMirror editor runs behind EditorAdapter
headings create ActiveOutline entries
cursor context updates ChatComposer
Ollama request can generate a reviewable suggestion
suggestion can be accepted/rejected
source import/read/search skeleton works
source-aware AI request skeleton works
metadata review panel can approve/edit/reject a proposal
image placeholder or first image insertion path exists
Markdown export works
basic event/snapshot history is visible enough for confidence
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
frontend writes vault/database directly
```

---

# 7. Repo Safety Checks

Run or manually verify before asking for a user pull:

```bash
bash scripts/check.sh
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
no transient chat citation markers in repo docs
```

---

# 8. Immediate Recommendation

Proceed in this order:

```text
1. Add config/app.example.yaml.
2. Add config/providers.example.yaml.
3. Add scripts/check.sh.
4. Add frontend environment/config boundary instead of hardcoded API URL.
5. Begin document create/open/save skeleton.
6. Begin Tiptap/ProseMirror editor spike behind EditorAdapter.
```

This keeps development moving while preserving the remote-development quality gate.
