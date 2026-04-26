# Document Media Layout and Generation v1

This document defines image insertion, image generation, page layout, headers/footers, generated document elements, and media-aware export requirements.

## Core thesis

A serious word processor must support more than text.

The app should allow writers to insert, generate, place, wrap, caption, reference, and export images while preserving document structure, accessibility, source provenance, and local-first privacy.

## Product principle

Image and layout features should feel like normal word processor tools, but they should connect to the AI/source/ledger backend.

```text
Cursor location
→ insert or generate media
→ place media in document
→ configure wrapping/layout
→ store asset in vault
→ emit ledger event
→ export correctly
```

## Required media entities

```text
MediaAsset
ImageGenerationJob
ImagePlacement
Caption
AltText
MediaSourceReference
MediaVersion
```

## MediaAsset

A MediaAsset is the stored file and metadata.

Suggested shape:

```json
{
  "id": "uuid",
  "project_id": "uuid",
  "asset_type": "image",
  "file_path": "vault/media/images/...",
  "mime_type": "image/png",
  "width": 1024,
  "height": 768,
  "created_at": "timestamp",
  "source": "uploaded|generated|imported|derived",
  "alt_text": "short accessible description",
  "caption": "optional caption",
  "rights_status": "unknown|user_owned|generated|licensed|public_domain|restricted",
  "generation_job_id": "uuid_or_null"
}
```

## ImagePlacement

A MediaAsset may be placed in multiple documents or multiple positions.

Suggested shape:

```json
{
  "id": "uuid",
  "document_id": "uuid",
  "asset_id": "uuid",
  "anchor": {
    "block_id": "stable_block_id",
    "offset": 0
  },
  "layout_mode": "inline|block|fixed|floating|background|header|footer",
  "wrap_mode": "none|square|tight|top_bottom|behind_text|in_front_of_text",
  "alignment": "left|center|right|custom",
  "size": {
    "width": 640,
    "height": 480,
    "lock_aspect_ratio": true
  },
  "padding": {
    "top": 8,
    "right": 8,
    "bottom": 8,
    "left": 8
  },
  "z_index": 0
}
```

## Insertion behavior

Image insertion should support:

```text
Insert image from file
Paste image from clipboard
Drag/drop image into document
Insert generated image at cursor
Replace selected image
Insert image into header/footer
Set image as page/document background
```

Default insertion should be safe and predictable:

```text
insert at cursor as block image
center aligned
aspect ratio locked
caption optional
alt text prompt shown
```

## Cursor-aware insertion

The current CursorContext determines where an image is inserted.

If the cursor is collapsed:

```text
insert image at cursor anchor
```

If text is selected:

```text
offer: replace selection, insert before, insert after, or create illustrated block
```

## Layout controls

Image layout panel should expose:

```text
size
alignment
padding/margins
text wrapping
caption
alt text
link/source reference
crop later
replace image
open image details
```

## Drag behavior

Users should be able to drag images to reposition them, but the app must translate movement into stable document anchors.

Allowed drag behaviors:

```text
move image before/after paragraph
change inline/block placement
adjust floating position within page layout mode
resize from handles
```

Avoid layout chaos in MVP by limiting advanced floating behavior until page layout/export is stable.

## Layout modes

### Inline

Image behaves like a character in text flow.

### Block

Image sits between paragraphs or blocks. Recommended default.

### Fixed

Image anchored to a document block/section and remains associated with it.

### Floating

Image can be positioned relative to page/paragraph with wrapping. Advanced.

### Background

Image appears behind page or section content. Advanced.

### Header/Footer

Image appears in repeated page regions. Advanced but required long-term.

## Text wrapping modes

Support over time:

```text
none
square
tight
top and bottom
behind text
in front of text
```

MVP:

```text
none
square
centered block
```

## Image generation

Image generation should be a first-class AI provider category.

Provider types:

```text
local_image_provider
cloud_image_provider
custom_image_provider
```

Potential local providers later:

```text
ComfyUI
Automatic1111 / Stable Diffusion WebUI
InvokeAI
custom local endpoint
```

The app should not hardcode one image generator. Use the same provider/model registry concept as text AI.

## Image generation workflow

```text
1. User places cursor.
2. User chooses Insert > Generate Image or AI > Generate Image For This Section.
3. App builds image prompt from user request, section context, style profile, and optional sources.
4. App previews prompt before generation.
5. Provider generates image.
6. Image is saved to vault as MediaAsset.
7. User chooses Insert, Regenerate, Edit Prompt, or Save to Library.
8. Placement is inserted at cursor.
9. Ledger records image.generated and image.inserted.
```

## Context-aware image generation

The backend can help generate prompts from:

```text
current heading
current section prompt
selected text
storyboard card
characters
locations
style guide
source library examples
existing image references
```

Example actions:

```text
image.generate_from_selection
image.generate_from_section_prompt
image.generate_character_reference
image.generate_location_reference
image.generate_chapter_illustration
image.generate_background_image
image.regenerate_selected
image.create_prompt_only
```

## Image prompt blocks

Support targeted block syntax:

```text
[[image:prompt]]
[[image:chapter_illustration]]
[[image:character_reference @character:ibal]]
[[image:location_reference @location:shadowcove]]
```

Default rendering:

```text
clean writing view: collapsed marker or hidden
semantic view: visible image prompt card
outline/right panel: generate image button
export clean manuscript: hide prompt block unless image is inserted
```

## Image generation settings

AI settings should include an Image Models section.

Fields:

```text
provider
model/checkpoint
style preset
default size
aspect ratio
negative prompt
seed behavior
steps/quality preset
privacy mode
output folder
```

## Image library

Generated and inserted images should be available in a project media library.

Media library views:

```text
all images
used in document
unused drafts
generated
uploaded
character references
location references
backgrounds
headers/footers
```

## Accessibility

Every inserted image should support alt text.

The app can generate alt text suggestions, but the user should be able to edit them.

Export should warn if important images lack alt text.

## Page layout features

Required long-term:

```text
headers
footers
page numbers
total page count
first page different
odd/even headers
section-specific headers/footers
background images
page breaks
section breaks
margins
print preview
```

MVP should preserve architecture for page layout even if only a subset is implemented.

## Generated document elements

The app should support generated/managed elements:

```text
table of contents
glossary
terms/lexicon list
character index
location index
source list
figure list
caption list
references / bibliography later
```

These should be insertable document blocks tied to backend data.

## Lexicon and glossary integration

Glossary and terms should connect to the lexicon engine.

Useful actions:

```text
lexicon.insert_glossary
lexicon.update_glossary_from_project
lexicon.find_undefined_terms
lexicon.define_selected_term
lexicon.insert_term_reference
```

## Table of contents integration

TOC should be generated from heading structure.

Useful actions:

```text
document.insert_toc
document.update_toc
document.validate_heading_structure
document.show_sections_missing_prompts
```

## Menu additions

### Insert

```text
Image From File...
Generated Image...
Image Prompt Block
Figure Caption
Table of Contents
Glossary / Terms
Page Number
Header
Footer
Background Image
```

### Format

```text
Image Layout
Image Wrap
Image Padding
Image Alignment
Crop Image, later
Replace Image
Alt Text
Caption
```

### AI

```text
Generate Image At Cursor
Generate Image For Current Section
Generate Image From Selected Text
Generate Character Reference Image
Generate Location Reference Image
Regenerate Selected Image
Create Image Prompt From Section
Open Image Model Settings
```

### View

```text
Show Image Prompt Blocks
Show Media Anchors
Show Page Layout
Show Print Boundaries
```

### Tools

```text
Media Library
Check Missing Alt Text
Update Table of Contents
Update Glossary
Update Figure List
```

## Ledger events

```text
image.uploaded
image.pasted
image.generated
image.generation_failed
image.inserted
image.moved
image.resized
image.wrapped
image.alt_text_updated
image.caption_updated
image.removed_from_document
media.asset_deleted
page.header_updated
page.footer_updated
document.toc_inserted
document.toc_updated
document.glossary_inserted
document.glossary_updated
```

## Export requirements

Exports must handle images and generated elements.

```text
Markdown: image links, captions, alt text
DOCX: embedded images, captions where possible, headers/footers/page numbers where possible
PDF: rendered layout
HTML: image assets and semantic alt/caption markup
Clean manuscript: optional image exclusion
Review copy: include prompt blocks/comments if selected
```

## MVP scope

Build in this order:

```text
1. Insert image from file at cursor as block image.
2. Store image as MediaAsset in vault.
3. ImagePlacement with stable anchor.
4. Resize image with locked aspect ratio.
5. Alignment: left/center/right.
6. Caption and alt text fields.
7. Export Markdown with image path and alt text.
8. Media Library basic.
9. Image prompt block syntax.
10. Generate image via configurable provider stub.
11. Insert generated image at cursor.
12. Ledger events for upload/generate/insert/update.
```

## Not MVP

Defer:

```text
full floating layout parity with Word
advanced crop/masking
multi-image galleries
complex background layering
professional desktop publishing
image generation training/fine-tuning
custom model management beyond provider registry
```

## Product truth

Text is the manuscript's spine, but images are part of the finished artifact.

An AI word processor should help the user create, place, describe, reference, and export images as naturally as it helps with prose.
