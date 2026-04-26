# Component Inventory v1

This inventory defines reusable UI components before implementation. The goal is to protect cognitive retention, reduce duplicate UI, and avoid hardcoding features into monolithic pages.

## Component layers

Components are grouped into four layers:

```text
primitives
product components
feature components
workspace compositions
```

Each layer depends downward only.

```text
workspace compositions
  use feature components
    use product components
      use primitives
```

## 1. Primitives

Primitives are generic. They must not know about scripts, AI, documents, Ollama, bins, or source libraries.

```text
Button
IconButton
Input
Textarea
Select
Checkbox
RadioGroup
Switch
Dialog
Drawer
Popover
Tooltip
Toast
Tabs
Accordion
Card
Badge
Chip
ProgressBar
Spinner
SplitPane
Toolbar
Menu
CommandInput
EmptyState
ErrorState
StatusIndicator
KeyboardShortcut
```

## 2. Product components

Product components understand app concepts but should stay reusable across features.

```text
AppShell
WorkspaceLayout
TopBar
LeftRail
RightPanel
StatusBar
CommandPalette
ProjectSwitcher
VaultStatus
AIStatus
ModelStatus
PrivacyModeBadge
JobQueue
ActivityLog
SourceDrawer
SourceCard
SourcePreview
SourceReader
CitationChip
EvidenceDrawer
DocumentCanvas
DocumentToolbar
DocumentOutline
ChatComposer
CoWriterPanel
InsightCard
TagPill
ReferenceChip
BlockEmbed
AnalysisDrawer
ExportMenu
ExportPreview
SettingsSection
```

## 3. Feature components

Feature components belong to feature modules. They may contain specific behavior, API calls through feature services, and feature-local state.

### Writing

```text
DocumentEditor
RevisionPanel
SelectionActionBar
InlineSuggestion
ApplyPatchDialog
AutosaveIndicator
```

### Sources

```text
SourceImportPanel
SourceList
SourceMetadataEditor
SourceHealthCard
SourceReaderToolbar
SourceSearchPanel
```

### Ingress

```text
ImportQueue
ImportJobCard
ParserResultPreview
NormalizationReview
SourceProvenancePanel
```

### Analysis

```text
AnalysisBoard
BinMapPanel
StructureReviewPanel
ConflictDensityCard
ToneDriftCard
SourceComparisonPanel
```

### Lexicon

```text
TagLibraryPanel
ReferenceLibraryPanel
BlockLibraryPanel
AliasEditor
CanonicalMappingEditor
```

### AI Settings

```text
ProviderList
ProviderCard
ModelDiscoveryPanel
ModelRoleMapper
ContextBudgetPanel
PrivacyRoutingPanel
QuotaStatusPanel
```

### Export

```text
ExportFormatSelector
ExportOptionsPanel
ExportJobCard
ExportHistory
```

## 4. Workspace compositions

Workspace compositions assemble components into user-facing modes.

```text
FocusWritingWorkspace
ResearchWritingWorkspace
SourceTriageWorkspace
AnalysisWorkspace
ExportWorkspace
SettingsWorkspace
```

Workspaces should be thin. They should compose components, not own core business logic.

## Shared component states

Every product and feature component must support these states where applicable:

```text
empty
loading
ready
error
offline
permission-blocked
partial-result
stale
queued
```

## Cognitive retention anchors

The following anchors should be visible or one click away in every workspace:

```text
current project
current document or selected source
AI mode
vault status
active source count
autosave or job status
last action or current job
```

## Design-token requirement

Before visual styling expands, define tokens for:

```text
spacing
typography
radius
elevation
surface color
text color
border color
semantic status color
focus ring
motion duration
```

Components should use tokens rather than one-off values.

## Anti-duplication rule

If a feature needs a new card, chip, drawer, status badge, command input, or list item, first check this inventory and extend an existing component before creating a new pattern.

## Future review rule

Any new feature proposal must include:

```text
which workspace slots it uses
which existing components it reuses
which new components are required
which actions it registers
which backend services it calls
which privacy boundaries it touches
```
