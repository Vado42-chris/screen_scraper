# Ollama Provider Spec

## Template Metadata

- template_id: api-provider-spec-template
- template_version: 1.0.0
- template_status: screen_scraper_initial
- artifact_type: api_provider_spec
- required_for: every_external_api_provider_mcp_tool_repo_bridge_or_local_service_connection

---

# 1. Artifact Metadata

- artifact_id: screen-scraper-ollama-provider-spec-v1
- tenant_id: local_default
- project_id: screen_scraper
- parent_id:
- provider_name: Ollama Local
- provider_type: local service | AI model provider
- product_area: ai_gateway
- owner: Chris Hallberg
- author_actor: ChatGPT
- reviewer: Chris Hallberg
- created_at: 2026-04-26
- updated_at: 2026-04-26
- freshness_state: fresh
- validation_state: not_checked
- visibility: public
- repo_sync_state: synced

---

# 2. Purpose

Define the local Ollama provider connection for the screen_scraper AI gateway.

Ollama is the default free/local provider for text generation, local model discovery, and future embeddings where supported by installed models.

---

# 3. Source Evidence

## Tier 0 Local Evidence

- local config files: user reports Ollama is installed locally on `aries`
- local service notes: default development endpoint expected at `http://localhost:11434`
- storage plan: model storage should move to `/media/chrishallberg/Storage 11/01_Work/14_scripts/_shared_ai/ollama-models`

## Tier 1 Repo Evidence

- repo files:
  - README.md
  - docs/local-environment-aries.md
  - docs/security-and-secrets-policy.md
  - docs/xi-io-dependency-readiness-assessment-v1.md
  - engines/ingress/ingress-config.yaml
  - engines/egress/egress-config.yaml
- environment examples: planned
- adapter files: planned

## Tier 2 Management Evidence

- Workbench docs:
  - xi-io.net docs/templates/universal/api-provider-spec-template.md
  - xi-io.net docs/backend-engine-architecture-v1.md
- decisions:
  - Use local Ollama as guaranteed free engine.
  - Treat Ollama as a provider, not as app-owned infrastructure.
  - Keep model files outside repo and outside public webroot.

## Missing Evidence

- exact installed models on `aries`
- final embedding model selection
- final context budget defaults
- final model role mapping

---

# 4. Provider Identity

- provider name: Ollama Local
- provider type: local service / AI model provider
- owner/vendor: Ollama
- docs URL or local docs path: external docs, not stored in repo
- connection mode: HTTP local API
- environments: local, test
- required accounts: none

Default endpoint:

```text
http://localhost:11434
```

Expected model storage hint:

```text
/media/chrishallberg/Storage 11/01_Work/14_scripts/_shared_ai/ollama-models
```

The app does not set model storage directly. Ollama uses service configuration such as `OLLAMA_MODELS`.

---

# 5. Capabilities

## Capability: health check

- purpose: confirm Ollama is reachable
- endpoint/tool/action: GET `/api/tags` or minimal generation probe
- input shape: none
- output shape: provider status, installed model list
- rate limits: local machine dependent
- failure modes: service offline, wrong port, permission issue, model path issue
- retry policy: manual retry from settings panel
- audit required: no, ledger event useful

## Capability: list local models

- purpose: discover available local models
- endpoint/tool/action: GET `/api/tags`
- input shape: none
- output shape: model name, size, family/metadata where available
- rate limits: local machine dependent
- failure modes: service offline, empty model list
- retry policy: manual refresh
- audit required: no

## Capability: text generation

- purpose: local AI co-writer, summarizer, prompt generator, source assistant
- endpoint/tool/action: Ollama generation/chat endpoint through backend adapter
- input shape: prompt/context packet/model options
- output shape: generated text or structured action result
- rate limits: local hardware dependent
- failure modes: timeout, model not found, out of memory, context too large
- retry policy: allow retry with smaller context or different model
- audit required: yes for document-affecting actions

## Capability: embeddings, optional

- purpose: local retrieval/search if installed model supports embeddings
- endpoint/tool/action: Ollama embeddings endpoint through backend adapter
- input shape: text chunk
- output shape: embedding vector
- rate limits: local hardware dependent
- failure modes: unsupported model, service offline, context too large
- retry policy: select another embedding provider/model
- audit required: no, but source indexing event required

---

# 6. Auth + Secrets

- auth method: none for localhost default
- required scopes: none
- secret names: none
- secret storage location: not applicable
- local-only requirements: localhost by default
- vault-only requirements: no raw private prompts in logs
- rotation requirements: not applicable
- prohibited repo content: model files, private prompts, source text, generated private outputs

If Ollama is exposed beyond localhost later, security must be re-reviewed.

---

# 7. Data Boundaries

## Data sent to provider

In local-only mode, the provider may receive:

```text
selected text
nearby document context
section prompt
retrieved source snippets
metadata generation input
style/profile context
```

Because provider is local, this remains on the machine unless the user has exposed Ollama over the network.

## Data received from provider

```text
chat answer
rewrite suggestion
section prompt
metadata suggestion
summary
analysis draft
embedding vector, if supported
```

## Sensitive fields

```text
private document text
private source text
project notes
metadata fields
rights metadata
```

## Redaction rules

```text
Do not log full private prompts by default.
Do not store raw provider responses in repo-safe logs.
Store private outputs in local database/vault only.
```

## User consent requirements

Local Ollama does not require cloud consent, but user should still understand when private source/document context is sent to the local model.

---

# 8. Events / Ledger / Audit

Events emitted:

```text
ollama.health_checked
ollama.models_listed
ai.requested
ai.completed
ai.failed
provider.unavailable
provider.context_too_large
provider.model_missing
```

Ledger entries:

```text
provider health event
AI request event
AI result event
AI failure event
```

Audit-required actions:

```text
AI suggestion applied to document
AI-generated metadata approved
AI-generated source summary accepted
```

Logs generated:

```text
provider status
latency
model name
failure code
context budget warning
```

Calendar projection: true for meaningful failures and applied outputs.

---

# 9. RBAC / Visibility

- roles allowed: owner initially
- permission domains: provider_config, ai_request, model_role_mapping
- disabled states: Ollama offline, model unavailable, privacy mode blocked, context too large
- visibility rules: model names are project-visible, local paths are local-only
- agent/tool limits: agents may request local model calls through AI gateway only

---

# 10. UX Surfaces

Setup screen:

```text
Settings > AI > Ollama Local
```

Status screen:

```text
AI Status panel
Model Manager
Provider Health panel
```

Failure states:

```text
Ollama is not reachable.
No models installed.
Selected model is missing.
Context is too large for this model.
Model storage path may be on low-space drive.
```

Reconnect flow:

```text
Check status
Refresh models
Open setup instructions
Retry test prompt
```

Settings location:

```text
AI > Open AI Settings
AI > Open Model Manager
AI > Check Ollama Status
```

Notifications:

```text
quiet status badge by default
blocking message only when user requests AI action and provider is unavailable
```

---

# 11. AI / Automation

Automation candidates:

```text
model discovery
model role suggestion
context budget warning
local health check
metadata proposal
section prompt generation
source summary generation
```

Suggest-only actions:

```text
model role mapping
metadata approval
document rewrite
source-backed edit
```

Blocked automation:

```text
silent document overwrite
silent cloud fallback
silent model download, unless explicitly configured later
silent provider exposure to LAN
```

Confidence/explainability requirements:

```text
AI-generated labels must be marked derived.
AI document changes must be previewed.
AI source-backed claims must show source context where possible.
```

Override/audit rules:

```text
user can choose model manually
expert mode can override recommended roles
applied document changes emit ledger events
```

---

# 12. Testing + Validation

Connection test:

```text
GET /api/tags through backend adapter
```

Auth test:

```text
not applicable for localhost default
```

Permission test:

```text
provider cannot be called directly from UI; backend AI gateway required
```

Data redaction test:

```text
private prompt text not written to repo-safe logs
```

Failure simulation:

```text
Ollama offline
model missing
timeout
context too large
```

Smoke test:

```text
list models
run tiny generation
return structured provider health
```

Rollback/disconnect test:

```text
AI unavailable does not block manual writing
```

---

# 13. Freshness Rules

Mark stale when:

```text
Ollama API behavior changes
local endpoint changes
model storage path changes
provider adapter changes
privacy routing policy changes
model role mapping changes
```

---

# 14. Acceptance Criteria

A provider spec is valid when:

```text
capabilities are explicit
auth/secrets are defined without exposing secret values
data boundaries are clear
RBAC and safety gates are mapped
validation and failure handling are testable
implementation can proceed without guessing
```

---

# 15. Open Gaps

```text
exact first model list
embedding model choice
context budget defaults
model role taxonomy
provider adapter implementation
health endpoint design
```
