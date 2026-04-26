# Local Environment: aries

This document records the local development and test topology for `screen_scraper` on `aries`.

## Purpose

`aries` currently acts as the local development machine and temporary test host. The project uses two separate drives to keep messy development work separate from test deployments.

## Canonical roots

```text
DEV ROOT
/media/chrishallberg/Storage 22/999_Work/003_Projects/014_scripts

TEST ROOT
/media/chrishallberg/Storage 11/01_Work/14_scripts
```

The visual convention is intentional:

```text
014_scripts = messy development root
14_scripts  = cleaner test deployment root
```

## Recommended project paths

```text
DEV REPO
/media/chrishallberg/Storage 22/999_Work/003_Projects/014_scripts/screen_scraper

DEV RUNTIME
/media/chrishallberg/Storage 22/999_Work/003_Projects/014_scripts/_screen_scraper_dev_runtime

TEST DEPLOY
/media/chrishallberg/Storage 11/01_Work/14_scripts/screen_scraper_test

TEST RUNTIME
/media/chrishallberg/Storage 11/01_Work/14_scripts/_screen_scraper_test_runtime

SHARED AI ROOT
/media/chrishallberg/Storage 11/01_Work/14_scripts/_shared_ai

SHARED OLLAMA MODELS
/media/chrishallberg/Storage 11/01_Work/14_scripts/_shared_ai/ollama-models
```

## Runtime folders

Create runtime folders outside the Git repository:

```bash
mkdir -p "/media/chrishallberg/Storage 22/999_Work/003_Projects/014_scripts/_screen_scraper_dev_runtime"/{vault,sources,documents,exports,indexes,embeddings,analysis-cache,logs,backups}

mkdir -p "/media/chrishallberg/Storage 11/01_Work/14_scripts/_screen_scraper_test_runtime"/{vault,sources,documents,exports,indexes,embeddings,analysis-cache,logs,backups}

mkdir -p "/media/chrishallberg/Storage 11/01_Work/14_scripts/_shared_ai/ollama-models"
```

## Ollama model storage

Use one shared Ollama model folder on the larger test drive, not duplicate model folders per environment.

Recommended Ollama model path:

```text
/media/chrishallberg/Storage 11/01_Work/14_scripts/_shared_ai/ollama-models
```

Systemd override:

```bash
sudo systemctl edit ollama.service
```

Add:

```ini
[Service]
Environment="OLLAMA_MODELS=/media/chrishallberg/Storage 11/01_Work/14_scripts/_shared_ai/ollama-models"
Environment="OLLAMA_HOST=127.0.0.1:11434"
```

Then reload and restart:

```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
ollama list
```

If the service user cannot write to the model folder, grant ownership:

```bash
sudo chown -R ollama:ollama "/media/chrishallberg/Storage 11/01_Work/14_scripts/_shared_ai/ollama-models"
sudo chmod -R 775 "/media/chrishallberg/Storage 11/01_Work/14_scripts/_shared_ai/ollama-models"
```

If permissions still fail, check that every parent folder in the path is traversable by the `ollama` service user.

## Environment profiles

Development profile should point to the dev repo and dev runtime:

```yaml
environment: development

paths:
  project_root: "/media/chrishallberg/Storage 22/999_Work/003_Projects/014_scripts/screen_scraper"
  runtime_root: "/media/chrishallberg/Storage 22/999_Work/003_Projects/014_scripts/_screen_scraper_dev_runtime"

ai:
  ollama:
    base_url: "http://localhost:11434"
    model_storage_hint: "/media/chrishallberg/Storage 11/01_Work/14_scripts/_shared_ai/ollama-models"
```

Test profile should point to the test deployment and test runtime:

```yaml
environment: test

paths:
  project_root: "/media/chrishallberg/Storage 11/01_Work/14_scripts/screen_scraper_test"
  runtime_root: "/media/chrishallberg/Storage 11/01_Work/14_scripts/_screen_scraper_test_runtime"

ai:
  ollama:
    base_url: "http://localhost:11434"
    model_storage_hint: "/media/chrishallberg/Storage 11/01_Work/14_scripts/_shared_ai/ollama-models"
```

## Dev-to-test promotion

Early MVP can use `rsync` to copy active code to test while excluding dev-only artifacts.

```bash
#!/usr/bin/env bash
set -euo pipefail

DEV="/media/chrishallberg/Storage 22/999_Work/003_Projects/014_scripts/screen_scraper/"
TEST="/media/chrishallberg/Storage 11/01_Work/14_scripts/screen_scraper_test/"

rsync -av --delete \
  --exclude ".git/" \
  --exclude "node_modules/" \
  --exclude ".venv/" \
  --exclude "__pycache__/" \
  --exclude ".pytest_cache/" \
  --exclude "dist/" \
  --exclude "build/" \
  --exclude "*_runtime/" \
  "$DEV" "$TEST"
```

Once the repo stabilizes, prefer a `git worktree` or staging branch workflow for cleaner GitHub validation.

## Security note

The test deployment may run locally, but it should still treat vaults, source libraries, model files, embeddings, provider keys, and local config as private runtime data. Do not place these inside a public webroot and do not commit them.
