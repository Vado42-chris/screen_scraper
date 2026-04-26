# License and Rights Metadata v1

This document defines project-level and item-level rights metadata for inserted items, generated items, source references, media assets, documents, exports, and reusable blocks.

## Core correction

Metadata must include authorship, creation date, and license/rights status.

The app should let the user define project defaults once, then apply those defaults automatically to inserted and generated items while still allowing item-level overrides.

## Product principle

Rights metadata should be easy to apply, easy to review, and easy to migrate.

```text
Project default rights profile
→ inserted item inherits defaults
→ app proposes item-specific metadata
→ user approves/edits/rejects
→ ledger records the decision
```

## Important distinction

`copyrighted`, `patented`, `trademarked`, `restricted`, `open source`, and `public domain` are not all the same kind of thing.

The app should distinguish:

```text
license: the permission document or license identifier
rights_status: high-level rights condition
ip_status: copyright/patent/trademark/trade-secret related flags
usage_policy: what the app/user can safely do with the item
```

This avoids forcing legal concepts into one overloaded dropdown.

## Standards influence

Use existing metadata concepts where possible.

Useful mappings:

```text
Dublin Core creator → author/creator
Dublin Core created → date_created
Dublin Core license → license document or identifier
Dublin Core rights → rights statement
Dublin Core rightsHolder → rights holder
Dublin Core provenance → source/generation provenance
SPDX identifier → standardized software/open license IDs
Creative Commons URI → standardized creative work licenses
```

## ProjectRightsProfile

Each project should have a rights profile.

Suggested shape:

```json
{
  "id": "uuid",
  "project_id": "uuid",
  "profile_name": "Default Project Rights",
  "default_author": "Chris Hallberg",
  "default_rights_holder": "Xibalba Mixed Media Studio",
  "default_license_id": "ALL_RIGHTS_RESERVED",
  "default_license_label": "All rights reserved",
  "default_license_uri": null,
  "default_rights_status": "protected",
  "default_ip_status": ["copyright"],
  "default_usage_policy": "private_project_use",
  "default_credit_line": "© Chris Hallberg / Xibalba Mixed Media Studio",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

## ItemRightsMetadata

Each inserted/generated/imported item should be able to inherit or override project defaults.

Suggested shape:

```json
{
  "item_id": "uuid",
  "item_type": "image|document|source|block|prompt|table|figure|term|export",
  "date_created": "timestamp",
  "date_modified": "timestamp",
  "author": "Chris Hallberg",
  "creator_type": "human|ai_assisted|ai_generated|imported|unknown",
  "rights_holder": "Xibalba Mixed Media Studio",
  "license_id": "ALL_RIGHTS_RESERVED",
  "license_label": "All rights reserved",
  "license_uri": null,
  "rights_status": "protected|open|public_domain|restricted|unknown|mixed|needs_review",
  "ip_status": ["copyright"],
  "usage_policy": "private_project_use",
  "source_license_id": null,
  "source_license_label": null,
  "source_license_uri": null,
  "provenance": "Generated inside project from user prompt and project context.",
  "inherits_project_defaults": true,
  "manual_override": false,
  "review_status": "proposed|approved|edited|rejected|stale|needs_review"
}
```

## License registry categories

The app should provide a built-in rights/license registry with these categories.

### Private/protected

```text
ALL_RIGHTS_RESERVED
COPYRIGHT_PROTECTED
PROPRIETARY_LICENSE
CONFIDENTIAL
TRADE_SECRET_RESTRICTED
CONTRACT_RESTRICTED
```

### Public domain / open dedication

```text
PUBLIC_DOMAIN
CC0-1.0
PDM-1.0
```

### Creative Commons

```text
CC-BY-4.0
CC-BY-SA-4.0
CC-BY-NC-4.0
CC-BY-NC-SA-4.0
CC-BY-ND-4.0
CC-BY-NC-ND-4.0
```

### Open source / software-oriented

Use SPDX IDs where possible.

Examples:

```text
MIT
Apache-2.0
BSD-2-Clause
BSD-3-Clause
GPL-3.0-or-later
LGPL-3.0-or-later
MPL-2.0
AGPL-3.0-or-later
```

### Data/documentation licenses

```text
ODC-BY-1.0
ODbL-1.0
PDDL-1.0
GFDL-1.3-or-later
```

### Patent/trademark-related status flags

Patents and trademarks are usually not simple content licenses.

Represent them as `ip_status` or restrictions, not as ordinary content licenses.

```text
patent_related
patent_pending
patented
trademark_related
registered_trademark
trade_secret
```

### Unknown/review states

```text
UNKNOWN
NEEDS_REVIEW
MIXED_RIGHTS
SOURCE_RESTRICTED
FAIR_USE_REFERENCE_ONLY
```

## Default inheritance behavior

When a project has a default rights profile, new items inherit it automatically.

Examples:

```text
new document → inherits project author/license
inserted image → inherits project author/license, unless source metadata says otherwise
AI-generated image → inherits project profile but marks creator_type as ai_generated or ai_assisted
imported source → uses detected/source license where known, otherwise needs_review
export artifact → inherits document/project rights at export time
```

## Item-level override behavior

Users can override rights metadata per item.

Examples:

```text
one image is CC-BY-4.0
one source is copyright protected and reference-only
one generated illustration is project-owned but ai_assisted
one code snippet is MIT
one glossary entry is project-authored
```

Override must be visible in item details.

## Project license change behavior

If the project rights profile changes, the app must offer a migration workflow.

Do not silently rewrite all item licenses.

Migration dialog should offer:

```text
Apply new license to future items only
Apply new license to all inherited items
Apply new license to selected item types
Do not change manually overridden items
Mark affected items for review
Preview changes before applying
```

## License migration events

```text
rights.project_profile_created
rights.project_profile_updated
rights.item_inherited_project_profile
rights.item_override_created
rights.item_license_updated
rights.migration_previewed
rights.migration_applied
rights.migration_reverted
rights.review_requested
```

## UI surfaces

### Project setup wizard

Ask for:

```text
default author
default rights holder
default license/rights status
credit line
whether AI-generated items inherit the same rights profile
```

### Project Settings > Rights & License

Fields:

```text
author
rights holder
license/status dropdown
license URI
credit line
AI-generated item policy
source import rights policy
migration tools
```

### Item metadata panel

Fields:

```text
date created
date modified
author
creator type
rights holder
license/status
license URI
ip status flags
usage policy
provenance
review status
```

### Tools menu additions

```text
Review Rights Metadata
Find Items Missing License
Find Items With Unknown Rights
Apply Project Rights Profile...
Preview Rights Migration
Export Rights Report
```

### AI menu additions

```text
Suggest Rights Metadata
Explain Rights Status
Summarize Source License
Find License Conflicts
```

## Export behavior

Export should allow:

```text
include rights metadata
include credit lines
include image credits
include source list
include license appendix
hide internal metadata
export rights report separately
```

## AI-generated material note

The app should track whether something is:

```text
human authored
AI assisted
AI generated
imported
mixed
unknown
```

This is metadata, not a legal conclusion.

The app should avoid telling the user that a generated item is legally protected unless the user has confirmed the rights model.

## MVP scope

Build in this order:

```text
1. Project rights profile with author, rights holder, license/status, credit line.
2. Item rights metadata inherits project profile.
3. Inserted images get date_created, author, license/status, rights holder, provenance.
4. Metadata review panel includes rights fields.
5. Project Settings > Rights & License page.
6. Tools > Find Items With Unknown Rights.
7. License migration preview for inherited items.
8. Ledger events for rights metadata changes.
```

## Product truth

Rights metadata should be treated like document structure: invisible when not needed, explicit when trust, export, reuse, or publishing depends on it.
