#!/usr/bin/env bash
set -euo pipefail

echo "Checking for obvious unsafe files..."

if find . -maxdepth 5 -type f \( \
  -name "*.env" -o \
  -name "*.key" -o \
  -name "*.pem" -o \
  -name "*.secret" -o \
  -name "*.sqlite" -o \
  -name "*.sqlite3" -o \
  -name "*.db" \
\) | grep -q .; then
  echo "Unsafe or runtime-looking files found. Review before committing." >&2
  find . -maxdepth 5 -type f \( \
    -name "*.env" -o \
    -name "*.key" -o \
    -name "*.pem" -o \
    -name "*.secret" -o \
    -name "*.sqlite" -o \
    -name "*.sqlite3" -o \
    -name "*.db" \
  \)
  exit 1
fi

echo "Checking required planning and scaffold files..."

required_files=(
  "README.md"
  ".gitignore"
  "docs/remote-development-quality-gate-v1.md"
  "docs/development-readiness-gate-v1.md"
  "docs/editor-engine-evaluation-v1.md"
  "docs/command-and-action-registry-v1.md"
  "docs/backend-service-boundaries-v1.md"
  "docs/planning/information-architecture-map.md"
  "docs/planning/page-system-map.md"
  "docs/planning/wireframe-spec.md"
  "docs/events/event-model.yaml"
  "docs/data/document-data-model.yaml"
  "docs/providers/ollama-provider-spec.md"
  "app/backend/app/main.py"
  "app/frontend/src/main.tsx"
)

missing=0
for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "Missing required file: $file" >&2
    missing=1
  fi
done

if [ "$missing" -ne 0 ]; then
  exit 1
fi

echo "Static repo check completed. This does not replace local build/test execution."
