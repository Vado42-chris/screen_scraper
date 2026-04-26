# screen_scraper

A local-first cooperative writing workspace powered by a private source library, local AI, and modular ingestion, analysis, lexicon, retrieval, and export engines.

The repository name is functional for now. The product is not a scraper UI. The product is a simple writing surface with source-aware AI assistance. Scraping, importing, parsing, model discovery, and routing are backend capabilities that support the writing experience.

## Product north star

> A cooperative word processor where the AI writes with you using a private source library you control.

From the user's perspective, the app should feel like a calm document editor with an AI co-writer and a source drawer. The user should not have to manage the underlying knowledge system unless they deliberately open advanced tools.

## Default user flow

1. Create or open a project.
2. Add sources.
3. Write in the document editor.
4. Ask the AI co-writer for help.
5. Let the app retrieve useful source context.
6. Export the finished artifact.

## Core principles

- **Local-first by default.** User documents, sources, indexes, and analysis caches should live in a user-controlled local vault.
- **Free-core friendly.** Ollama is the default local AI provider, with optional free/cloud/BYO provider adapters later.
- **Model-agnostic.** The app should route tasks by model capability, not by hardcoded model assumptions.
- **Source-aware, not source-owned.** The app reads, indexes, summarizes, and references user-selected sources. It should not require us to host private user libraries.
- **Simple front end, serious backend.** The visible UI should remain focused on documents, chat, sources, and export. Backend engines can be deep, modular, and automation-ready.
- **No accidental cloud sharing.** Cloud AI should be off by default and require explicit user configuration or permission.
- **No runtime data in Git.** Sources, models, embeddings, caches, exports, and vault contents must remain outside the repo.

## Planned architecture

```text
React/Vite front end
+ FastAPI backend
+ local file vault
+ SQLite metadata/index layer
+ Ollama provider adapter
+ AI gateway and task router
+ source ingestion pipeline
+ lexicon/tag/block system
+ export engine
```

The app should be usable as:

```text
Mode 1: local web app on localhost
Mode 2: desktop shell later, likely Tauri or Electron
Mode 3: LAN-accessible personal server, advanced and authenticated
Mode 4: optional hosted/SaaS-style services later
```

## Backend engines

```text
ingress/     source import, fetch, parse, clean, normalize
library/     artifact storage, metadata, search, source reader
analysis/    structure, tone, tags, bins, summaries, comparisons
lexicon/     #tags, @refs, [[blocks]], aliases, canonical mappings
retrieval/   chunking, embeddings, source-context assembly
writing/     document model, revisions, co-writer operations
egress/      markdown, docx, pdf, screenplay-style exports
ai_gateway/  providers, routing, model profiles, privacy rules
```

## AI provider strategy

The first supported provider should be local Ollama via:

```text
http://localhost:11434
```

The app should later support:

```text
Ollama local
Ollama-compatible endpoints
OpenAI-compatible endpoints
Gemini
Anthropic
Groq
OpenRouter
Hugging Face
custom user endpoints
```

Simple AI modes:

```text
Local Only
Local First
Free Cloud Assist
Bring Your Own API Key
Advanced
```

## Local development topology, aries

Canonical local paths for this project on `aries`:

```text
DEV ROOT:
/media/chrishallberg/Storage 22/999_Work/003_Projects/014_scripts

TEST ROOT:
/media/chrishallberg/Storage 11/01_Work/14_scripts
```

Recommended project paths:

```text
DEV REPO:
/media/chrishallberg/Storage 22/999_Work/003_Projects/014_scripts/screen_scraper

DEV RUNTIME:
/media/chrishallberg/Storage 22/999_Work/003_Projects/014_scripts/_screen_scraper_dev_runtime

TEST DEPLOY:
/media/chrishallberg/Storage 11/01_Work/14_scripts/screen_scraper_test

TEST RUNTIME:
/media/chrishallberg/Storage 11/01_Work/14_scripts/_screen_scraper_test_runtime

SHARED OLLAMA MODELS:
/media/chrishallberg/Storage 11/01_Work/14_scripts/_shared_ai/ollama-models
```

## Runtime data policy

Runtime folders are intentionally outside the repo. They may contain copyrighted/private sources, generated indexes, embeddings, logs, model files, exports, and local user documents.

Never commit:

```text
models
source libraries
vault contents
embeddings
analysis caches
exports
logs
API keys
```

## MVP slice

The first build should prove the golden path:

```text
1. Start backend locally.
2. Detect Ollama at localhost:11434.
3. List installed local models.
4. Create/select a local vault.
5. Import a local text or markdown source.
6. Normalize it into a readable artifact.
7. Search/read the source from the app.
8. Create a document.
9. Ask the co-writer a source-aware question.
10. Save/export the document.
```

Live web scraping comes later. First prove local import, normalization, retrieval, and writing.

## Status

Initial repo foundation. Documentation-first scaffold. No production code yet.
