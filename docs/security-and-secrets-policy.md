# Security and Secrets Policy

This project is local-first and source-library heavy. That means the repository must be treated as code and documentation only. Private data belongs in runtime folders outside Git.

## Never commit

Do not commit any of the following:

```text
API keys
provider secrets
.env files
local provider configs
user source libraries
vault contents
copyrighted/private imported sources
embeddings
vector indexes
analysis caches
model files
exports
logs
personal machine paths, except documented examples
```

## Allowed in Git

The repository may contain:

```text
source code
docs
schema definitions
example configs
safe fixtures created specifically for tests
scripts that create folders or validate config
```

Example config files must use placeholders only.

## Secrets handling

Use local `.env` or local YAML files for secrets during development. These files are ignored by `.gitignore`.

Allowed pattern:

```text
.env.example        committed
.env                ignored
config/app.example.yaml committed
config/local.yaml   ignored
```

## Runtime data handling

All runtime data should live outside the repository. On `aries`, use these roots:

```text
DEV RUNTIME
/media/chrishallberg/Storage 22/999_Work/003_Projects/014_scripts/_screen_scraper_dev_runtime

TEST RUNTIME
/media/chrishallberg/Storage 11/01_Work/14_scripts/_screen_scraper_test_runtime

SHARED OLLAMA MODELS
/media/chrishallberg/Storage 11/01_Work/14_scripts/_shared_ai/ollama-models
```

## Cloud AI policy

Cloud AI must be opt-in. The default product behavior is local-only:

```text
Ollama local
no source sharing
no cloud fallback
no provider keys required
```

If cloud providers are added later, the app must make the sharing boundary explicit before sending source text or document text outside the local machine.

## Git safety checks

Before committing, run checks for ignored files and accidental secrets.

Useful commands:

```bash
git status --ignored
find . -maxdepth 3 -type f \( -name "*.env" -o -name "*.key" -o -name "*.pem" -o -name "*.secret" \)
```

If a secret is ever committed, do not only delete it in a later commit. Treat it as compromised, rotate the secret, and clean repository history if required.

## Public repository warning

This repository is public. Assume anything committed can be read by anyone.
