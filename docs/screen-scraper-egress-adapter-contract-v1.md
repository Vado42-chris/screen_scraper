# screen_scraper Egress Adapter Contract v1

## Status

Product adapter contract for the xi-io framework egress standard.

This document maps `screen_scraper` to the reusable xi-io white-label egress system. It does not redefine the framework egress engine.

Framework source of truth:

```text
xi-io.net/docs/framework/egress-engine-standard-v1.md
```

Framework product adapter template:

```text
xi-io.net/docs/framework/templates/product-egress-adapter-template-v1.md
```

## Product identity

```text
product_id: screen_scraper
display_name: screen_scraper
repo: Vado42-chris/screen_scraper
adapter_version: v1
framework_standard: xi-io Framework Egress Engine Standard v1
framework_template: Product Egress Adapter Template v1
canonical_package_type: DocumentEgressPackage
```

## Purpose

`screen_scraper` provides a writer/document implementation of the framework egress system.

The xi-io framework owns the reusable egress classes, document type variables, export formats, export profiles, event rules, manifest rules, safety gates, and UI component expectations.

This product adapter owns only the mapping from local `screen_scraper` objects into the framework-compatible `DocumentEgressPackage`.

## Framework versus product boundary

```text
xi-io.net framework
  owns reusable white-label egress/export structure
  owns shared document type options
  owns shared format/profile vocabulary
  owns shared UI component contracts
  owns shared event and safety rules

screen_scraper adapter
  owns writer/document defaults
  owns local object mapping
  owns local ExportService implementation
  owns product-specific warnings
  owns product-specific UI placement
```

If this document conflicts with the framework standard, the framework standard wins.

## Supported egress classes

MVP target:

```text
document_export
snapshot_create
rollback_restore
```

Related runtime actions already present:

```text
source_library_update
provider_call
```

Later target:

```text
document_patch
document_generate
metadata_update
rights_update
media_asset_update
data_export
external_tool_call
```

## Supported document types

MVP target:

```text
article
chapter
guide
report
research_packet
source_package
archive_package
metadata_report
lexicon_report
```

Later target:

```text
book
manual
brief
technical_spec
story_bible
character_sheet
location_sheet
lore_entry
```

This is intentionally a subset of the xi-io framework document type list.

## Supported export formats

### Phase 1, deterministic local-first formats

```text
.md
.html
.txt
.json
.zip
```

### Phase 2, writer-facing formats

```text
.docx
.pdf
.epub
```

### Phase 3, extended workflow formats

```text
.odt
.rtf
.tex
.fountain
.csv
.yaml
```

## Supported export profiles

MVP target:

```text
Draft Review
Clean Artifact
Web Preview
Source Package
Archive Package
Metadata Report
Lexicon Report
```

Later target:

```text
Submission Artifact
Ebook Draft
Operations Package
```

## Local source object mapping

| Framework field | screen_scraper source | Notes |
|---|---|---|
| product_id | constant `screen_scraper` | adapter-owned |
| project_id | future project metadata | fallback to document scope for MVP |
| document_id | `DocumentRecord.document_id` | implemented |
| artifact_title | `DocumentRecord.title` | implemented |
| document_type | future document metadata | default `article` for MVP |
| canonical_body | Tiptap/ProseMirror document model | future canonical model |
| html_body | `DocumentRecord.content` | current persistence format |
| markdown_body | editor Markdown export path | currently preview-only |
| plain_text_body | future ExportPackageBuilder extraction | planned |
| author | project/document metadata | future |
| license_status | project/document metadata | future |
| rights_status | project/document metadata | future |
| source_references | source chip records/events | partial implementation |
| lexicon_terms | Lexicon engine | future |
| media_items | image/media metadata records | future |
| metadata | document/project/export metadata | future |
| warnings | ExportReadinessPanel checks | future |

## Rights and license policy

MVP defaults:

```text
license_status: unspecified
rights_status: unresolved
allow_export_without_license: true for local draft formats
allow_export_with_unresolved_rights: true for local draft formats with warning
require_rights_warning_acknowledgement: true for share/publish/bundle profiles
```

Blocked conditions:

```text
cloud/export target selected without provider policy
publish/deploy target selected without human approval
rights-protected media included without acknowledged warning
private source material requested in public/export profile without explicit inclusion
```

## Safe output targets

MVP target:

```text
local_download
local_project_exports_directory
product_runtime_storage
local_preview_only
```

Later target:

```text
user_selected_directory
local_network_share
GitHub release artifact
deployment_staging_directory
external_provider
```

Forbidden by default:

```text
silent_cloud_upload
silent_public_publish
unconfirmed_repo_write
unmanaged_absolute_path
```

Any publish/deploy/provider target requires a framework approval gate.

## Required approval gates

| Action | Gate required | Reason |
|---|---:|---|
| local draft document export, no warnings | no | local user-owned artifact |
| document export with unresolved warnings | yes | warning acknowledgement |
| archive package | yes | may include metadata/source context |
| rights update | yes | rights state change |
| rollback/restore | yes | destructive state change |
| external provider output | yes | privacy boundary |
| repo/deploy action | yes | Git/deploy boundary |

## Event mapping

| Product action | Framework event | Payload summary |
|---|---|---|
| request export | export.requested | export_id, document_id, format, profile |
| export succeeds | export.completed | export_id, document_id, format, artifact_count, content_chars |
| export fails | export.failed | export_id, document_id, format, ok, message |
| bundle created | export.bundle_created | export_id, artifact_count, manifest_version |
| download/open artifact | export.downloaded | export_id, artifact_id, format |
| generic egress request | egress.requested | egress_id, action_type, target_type |
| generic egress complete | egress.completed | egress_id, ok, message |

Additional already-implemented adjacent events:

```text
snapshot.created
snapshot.restore_previewed
snapshot.pre_restore_checkpoint_created
snapshot.restored
ai_suggestion.inserted
source_reference.inserted
section_prompt.created
```

## Allowed event payload fields

```text
egress_id
export_id
product_id
project_id
document_id
artifact_id
action_type
target_type
target_id
document_type
format
profile
adapter_version
artifact_count
content_chars
source_reference_count
lexicon_term_count
media_item_count
ok
message
warning_count
blocked_reason
```

## Forbidden event payload fields

```text
raw document content
raw source content
raw AI suggestion text
secret values
API keys
tokens
absolute local filesystem paths
private user directory names
raw generated media bytes
```

## Manifest mapping

Each `.zip` or archive package should include:

```text
manifest.json
document artifact
metadata summary
source reference summary, if included
lexicon summary, if included
media manifest, if included
rights/license summary
warnings
export event summary
```

## UI surface mapping

MVP surface:

```text
File > Export, once top menu exists
right panel export card may be used as interim surface
```

Reusable framework components expected:

```text
EgressActionCard
ExportProfileSelector
ExportFormatSelector
DocumentTypeSelector
ExportReadinessPanel
ExportWarningList
ArtifactManifestViewer
ArtifactDownloadCard
EgressHistoryPanel
RightsPostureBadge
SourceInclusionToggle
LexiconInclusionToggle
ProvenanceInclusionToggle
```

## Service boundary

`screen_scraper` should implement product-local services that conform to the framework contract:

```text
ExportService
ExportPackageBuilder
MarkdownExportAdapter
HtmlExportAdapter
PlainTextExportAdapter
JsonExportAdapter
ZipExportAdapter
DocxExportAdapter
PdfExportAdapter
EpubExportAdapter
```

The frontend should not build final export files directly except for temporary preview-only Markdown display.

## Relationship to local export plan

The local document:

```text
docs/export-egress-contract-v1.md
```

is the `screen_scraper` product-specific final artifact export plan. It must conform to this adapter contract and the xi-io framework standard.

Precedence order:

```text
1. xi-io.net framework egress standard
2. xi-io.net product egress adapter template
3. screen_scraper egress adapter contract
4. screen_scraper export-egress contract
5. implementation details
```

## Verification requirements

Minimum tests:

```text
supported export format succeeds
unsupported export format is blocked
export event payload excludes forbidden fields
bundle export includes manifest
manifest contains adapter_version
rights/license warnings surface to user
failed export returns visible failed state
```

## Adoption checklist

```text
[x] framework standard referenced
[x] framework adapter template referenced
[x] product adapter contract created
[ ] product egress config reconciled
[ ] product egress schema reconciled
[ ] ExportService implemented
[ ] export route implemented
[ ] export UI implemented
[ ] export safety tests implemented
```
