# UI Composition Contract v1

This document prevents the app from hardening into a monolithic page structure.

The product should feel simple, but the UI architecture must remain composable, reusable, and resilient as features expand.

## Core correction

The default user surface is still:

```text
Document
Chat
Sources
Export
```

But those are not fixed pages. They are reusable workspace regions and feature modules that can be composed into different modes.

## Primary rule

No feature owns the whole screen.

Features render into a shared workspace shell using named slots.

## Workspace shell slots

```text
AppShell
  TopBar
  LeftRail
  PrimaryCanvas
  RightPanel
  BottomComposer
  StatusBar
  OverlayLayer
```

### TopBar

Persistent orientation and global actions.

Examples:

```text
ProjectSwitcher
DocumentTitle
AIStatus
VaultStatus
AutosaveStatus
CommandPaletteButton
```

### LeftRail

Navigation and library access.

Examples:

```text
ProjectNav
SourceList
DocumentList
TagLibrary
WorkspaceModeSwitcher
```

### PrimaryCanvas

The user's main work surface.

Examples:

```text
DocumentCanvas
SourceReader
AnalysisBoard
ExportPreview
SettingsView
```

### RightPanel

Contextual intelligence and supporting detail.

Examples:

```text
InsightPanel
CitationPanel
MetadataPanel
BinMapPanel
ModelStatusPanel
```

### BottomComposer

Input surface for chat, commands, and focused actions.

Examples:

```text
ChatComposer
CommandComposer
InlineActionPrompt
```

### StatusBar

Low-distraction system state.

Examples:

```text
JobQueueStatus
ProviderStatus
CurrentPrivacyMode
ActiveSourceCount
```

### OverlayLayer

Temporary interactions.

Examples:

```text
CommandPalette
Dialog
Drawer
Popover
Toast
```

## Feature module rule

Feature modules own behavior, not layout.

A feature may provide:

```text
routes
components
actions
commands
API client hooks
state adapters
empty/loading/error states
```

A feature must not hardcode the global shell.

## Composition pattern

Workspace modes compose shared components.

Example:

```text
Focus Writing Mode
  PrimaryCanvas: DocumentCanvas
  BottomComposer: ChatComposer
  LeftRail: collapsed SourceRail
  RightPanel: hidden unless insight opens
```

Example:

```text
Source Triage Mode
  PrimaryCanvas: SourceReader
  LeftRail: SourceList
  RightPanel: SourceMetadataPanel
  BottomComposer: SourceActionComposer
```

## State requirements

Every complex component must define these states:

```text
empty
loading
ready
error
offline
permission-blocked
partial-result
```

This prevents brittle UI and improves user trust.

## Accessibility requirements

Components must be:

```text
keyboard operable
screen-reader labelable
focus visible
predictable in layout
usable without color-only meaning
safe with reduced motion
```

## Safety boundary

The UI may be flexible, but these boundaries are not flexible:

```text
No secrets in Git
No runtime vaults in Git
No direct UI calls to AI providers
No direct UI filesystem access to raw vault paths
No cloud source sharing without explicit permission
No public webroot for sources, indexes, models, or vaults
```

## Implementation target

Suggested frontend structure:

```text
app/frontend/src/components/primitives/
app/frontend/src/components/product/
app/frontend/src/features/
app/frontend/src/layouts/
app/frontend/src/registries/
app/frontend/src/workspaces/
```
