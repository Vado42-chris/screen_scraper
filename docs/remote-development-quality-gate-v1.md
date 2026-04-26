# Remote Development Quality Gate v1

## Status

This document records the development operating rule while the user has not pulled the repository locally.

The repository is being advanced through GitHub-first implementation until the first usable word-processor version is complete enough to justify local pull/demo.

---

# 1. User Requirement

The user is not planning to pull the repository locally until the first version of the word processor is finished with the advanced features already planned.

Therefore, every remote change must be made as if it may sit in GitHub for several passes before the user tests it locally.

---

# 2. Core Rule

Do not rely on the user pulling locally to catch avoidable architectural, UX, privacy, or implementation drift.

Every implementation pass must include:

```text
planning-contract alignment
UI best-practice check
privacy/repo-safety check
service-boundary check
event/ledger check
self peer review
honest limitation note when code was not locally executed
```

---

# 3. Source Evidence

## Tier 0 Local / Uploaded Evidence

- `/mnt/data/scripts_plan.md`
- The source material defines the product as a simple writing/chat/document interface where the deeper system stays hidden unless summoned. The user should feel like they are writing with assistance, while tags, blocks, bins, source analysis, and export structures operate underneath. fileciteturn107file0

## Tier 1 Repo Evidence

- `README.md`
- `docs/development-readiness-gate-v1.md`
- `docs/planning/information-architecture-map.md`
- `docs/planning/page-system-map.md`
- `docs/planning/wireframe-spec.md`
- `docs/command-and-action-registry-v1.md`
- `docs/backend-service-boundaries-v1.md`
- `docs/editor-engine-evaluation-v1.md`

---

# 4. Quality Bar Before User Pull

The first version worth asking the user to pull locally should include, at minimum:

```text
backend/frontend dev startup
provider health/status panel
event ledger visible enough for confidence
document create/open/save
Tiptap/ProseMirror editor spike integrated behind EditorAdapter
heading extraction and ActiveOutline
cursor-aware ChatComposer
Ollama-backed AI request path
reviewable AI suggestion preview, not silent overwrite
source import/read/search skeleton
source-aware AI request skeleton
metadata proposal/review panel
image insertion placeholder or first image insert path
Markdown export
basic snapshot/event history
repo safety maintained
```

This is not the final product, but it is the first meaningful local demo threshold.

---

# 5. UI Best-Practice Requirements

Every UI implementation must follow the formal UI docs:

```text
docs/planning/information-architecture-map.md
docs/planning/page-system-map.md
docs/planning/wireframe-spec.md
docs/components/*.md
```

Default UI requirements:

```text
writing-first
low clutter
plain-language labels
progressive disclosure
keyboard accessible
visible recovery paths
manual writing works when AI fails
advanced engine details hidden by default
no dashboard-first design
```

Do not expose these by default:

```text
raw bin IDs
raw event payloads
engine internals
schema diagnostics
provider adapter internals
```

---

# 6. Implementation Safety Requirements

Every implementation pass must preserve:

```text
frontend does not call Ollama directly
frontend does not write vault files directly
frontend does not write SQLite directly
meaningful actions route through command/action registry concept
meaningful state changes emit ledger events
private document/source text does not enter repo-safe logs
runtime/vault/model/cache/export data remains ignored
AI text changes are reviewable before apply
metadata is proposed, not silently approved
rights/license changes are explicit and audited
```

---

# 7. Self Peer Review Checklist

Before concluding each implementation pass, check:

```text
Does this match the project brief?
Does this match the IA/page/wireframe/component contracts?
Does this respect backend service boundaries?
Does this respect command/action registry intent?
Does this emit or prepare required events?
Does this keep secrets and runtime data out of Git?
Does this preserve the writing-first UX?
Does this avoid premature monoliths?
Does this leave a clear next slice?
```

If issues are found, fix them immediately where practical or record them as explicit follow-up gaps.

---

# 8. Honest Execution Rule

Until code is run locally or in CI, responses must not claim it was executed.

Allowed wording:

```text
Committed
Scaffolded
Prepared
Expected to run
Needs local/CI verification
```

Not allowed unless actually verified:

```text
Tested successfully
Build passes
Smoke test passes
Runs locally
```

---

# 9. Current Self Peer Review of Runtime Slice

## What is aligned

The first implementation slice matches the readiness gate: backend starts, frontend starts, provider health endpoint exists, Ollama model list endpoint exists, frontend displays provider status, and the event ledger records provider events by design.

The backend uses `/api/providers/ollama`, so the frontend does not call Ollama directly.

The current frontend is a status shell only, which is appropriate because the full editor should wait for the Tiptap/ProseMirror spike.

## Issues / Corrections Needed

```text
1. README still says no production code yet and should be updated to reflect first runtime scaffold.
2. development-readiness-gate-v1.md still lists implementation scaffold as open and should be updated.
3. config/app.example.yaml and config/providers.example.yaml are still missing.
4. scripts/check.sh is still missing.
5. frontend API base URL is hardcoded for localhost and should later move to config/env.
6. FastAPI startup uses @app.on_event, which is acceptable for now but should later migrate to lifespan.
7. Shell scripts are added as files, but executable bits may not be preserved by GitHub create calls. They can be run with `bash scripts/...`.
8. No local/CI execution has been performed yet.
```

## Immediate Follow-up

```text
update README status
update development readiness gate status
add example config files
add scripts/check.sh
add first scaffold peer-review report or keep this doc current
```

---

# 10. Acceptance Criteria

This quality gate is satisfied when every future implementation pass:

```text
states what changed
states what was reviewed
states what was not verified locally
records or fixes identified gaps
keeps implementation aligned with xi-io and UI contracts
```
