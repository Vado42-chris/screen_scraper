import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useMemo } from "react";
import { SectionPromptBlock } from "./extensions/SectionPromptBlock";
import { SourceReferenceChip } from "./extensions/SourceReferenceChip";
import type { HeadingAnchor } from "./types";

type ActiveSourceRef = {
  source_id: string;
  title: string;
};

type TiptapDocumentCanvasProps = {
  documentId: string;
  content: string;
  selectedSource?: ActiveSourceRef | null;
  pendingSuggestion?: string;
  onChange: (html: string, text: string, markdown: string, headings: HeadingAnchor[]) => void;
  onCursorContextChange?: (activeHeadingId: string | null, activeHeadingText: string | null) => void;
  onMarkdownExport?: (markdown: string) => void;
  onSourceReferenceInserted?: (sourceId: string, label: string) => void;
  onSectionPromptInserted?: (promptId: string, label: string, status: string) => void;
  onSuggestionInserted?: () => void;
};

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "untitled-heading";
}

function getEditorRoot(documentId: string): HTMLElement | null {
  return document.querySelector(`[data-document-id=\"${documentId}\"] .tiptapEditor`);
}

function extractHeadingAnchors(root: HTMLElement | null): HeadingAnchor[] {
  if (!root) return [];

  return Array.from(root.querySelectorAll("h1, h2, h3")).map((node, index) => {
    const element = node as HTMLHeadingElement;
    const level = Number(element.tagName.replace("H", "")) as 1 | 2 | 3;
    const text = element.textContent?.trim() || `Untitled heading ${index + 1}`;
    const id = `${level}-${index}-${slugifyHeading(text)}`;

    element.id = `heading-${id}`;
    element.dataset.headingId = id;

    return {
      id,
      level,
      text,
    };
  });
}

function findActiveHeading(root: HTMLElement | null): HeadingAnchor | null {
  if (!root) return null;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const anchorNode = selection.anchorNode;
  if (!anchorNode || !root.contains(anchorNode)) return null;

  let current: Node | null = anchorNode;
  while (current && current !== root) {
    if (current instanceof HTMLElement && /^H[1-3]$/.test(current.tagName)) {
      const headings = extractHeadingAnchors(root);
      return headings.find((heading) => heading.id === current.dataset.headingId) ?? null;
    }
    current = current.parentNode;
  }

  const range = selection.getRangeAt(0);
  const headingElements = Array.from(root.querySelectorAll("h1, h2, h3"));
  let active: HTMLHeadingElement | null = null;

  for (const heading of headingElements) {
    const headingRange = document.createRange();
    headingRange.selectNodeContents(heading);
    if (headingRange.compareBoundaryPoints(Range.START_TO_START, range) <= 0) {
      active = heading as HTMLHeadingElement;
    }
  }

  if (!active) return null;
  return extractHeadingAnchors(root).find((heading) => heading.id === active?.dataset.headingId) ?? null;
}

function htmlToMarkdown(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  function convertNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent ?? "";
    }

    if (!(node instanceof HTMLElement)) {
      return "";
    }

    if (node.dataset.nodeType === "source-reference-chip") {
      return node.dataset.label ?? "@source:stub";
    }

    if (node.dataset.nodeType === "section-prompt-block") {
      return `\n\n${node.dataset.label ?? "[[prompt:section]]"}\n\n`;
    }

    const childText = Array.from(node.childNodes).map(convertNode).join("");

    switch (node.tagName.toLowerCase()) {
      case "h1":
        return `# ${childText.trim()}\n\n`;
      case "h2":
        return `## ${childText.trim()}\n\n`;
      case "h3":
        return `### ${childText.trim()}\n\n`;
      case "p":
        return `${childText.trim()}\n\n`;
      case "strong":
      case "b":
        return `**${childText}**`;
      case "em":
      case "i":
        return `*${childText}*`;
      case "ul":
        return `${Array.from(node.children).map(convertNode).join("")}\n`;
      case "li":
        return `- ${childText.trim()}\n`;
      case "blockquote":
        return `${childText
          .trim()
          .split("\n")
          .map((line) => `> ${line}`)
          .join("\n")}\n\n`;
      default:
        return childText;
    }
  }

  return Array.from(doc.body.childNodes)
    .map(convertNode)
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function emitChange(
  documentId: string,
  html: string,
  text: string,
  onChange: TiptapDocumentCanvasProps["onChange"],
): void {
  const root = getEditorRoot(documentId);
  onChange(html, text, htmlToMarkdown(html), extractHeadingAnchors(root));
}

function suggestionToParagraphs(suggestion: string): Array<{ type: "paragraph"; content: Array<{ type: "text"; text: string }> }> {
  return suggestion
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      type: "paragraph" as const,
      content: [{ type: "text" as const, text: paragraph }],
    }));
}

export function TiptapDocumentCanvas({
  documentId,
  content,
  selectedSource,
  pendingSuggestion,
  onChange,
  onCursorContextChange,
  onMarkdownExport,
  onSourceReferenceInserted,
  onSectionPromptInserted,
  onSuggestionInserted,
}: TiptapDocumentCanvasProps) {
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      SourceReferenceChip,
      SectionPromptBlock,
      Placeholder.configure({
        placeholder: "Start writing here. Use headings to build the outline.",
      }),
    ],
    [],
  );

  const editor = useEditor({
    extensions,
    content: content || "",
    editorProps: {
      attributes: {
        class: "tiptapEditor",
        "aria-label": "Document editor",
      },
    },
    onUpdate: ({ editor }) => {
      emitChange(documentId, editor.getHTML(), editor.getText(), onChange);
    },
    onSelectionUpdate: () => {
      const root = getEditorRoot(documentId);
      const activeHeading = findActiveHeading(root);
      onCursorContextChange?.(activeHeading?.id ?? null, activeHeading?.text ?? null);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== content) {
      editor.commands.setContent(content || "", { emitUpdate: false });
      emitChange(documentId, editor.getHTML(), editor.getText(), onChange);
    }
  }, [content, documentId, editor, onChange]);

  if (!editor) {
    return <div className="editorLoading">Loading editor…</div>;
  }

  const insertSelectedSource = () => {
    const sourceId = selectedSource?.source_id ?? "stub";
    const label = selectedSource ? `@${selectedSource.title}` : "@source:stub";
    editor
      .chain()
      .focus()
      .insertContent({ type: "sourceReferenceChip", attrs: { sourceId, label } })
      .run();
    onSourceReferenceInserted?.(sourceId, label);
  };

  const insertSectionPrompt = () => {
    const promptId = `prompt-${Date.now()}`;
    const status = "draft";
    const label = "[[prompt:section]]";
    editor
      .chain()
      .focus()
      .insertContent({
        type: "sectionPromptBlock",
        attrs: { promptId, status, label },
      })
      .run();
    onSectionPromptInserted?.(promptId, label, status);
  };

  const insertPendingSuggestion = () => {
    if (!pendingSuggestion?.trim()) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", marks: [{ type: "bold" }], text: "AI suggestion, review before keeping:" }],
          },
          ...suggestionToParagraphs(pendingSuggestion),
        ],
      })
      .run();
    onSuggestionInserted?.();
  };

  return (
    <div className="editorSurface" data-document-id={documentId}>
      <div className="editorToolbar" aria-label="Document formatting">
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          H1
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          List
        </button>
        <button type="button" onClick={insertSelectedSource}>
          {selectedSource ? `@${selectedSource.title}` : "@Source"}
        </button>
        <button type="button" onClick={insertSectionPrompt}>
          [[Prompt]]
        </button>
        {pendingSuggestion?.trim() && (
          <button type="button" onClick={insertPendingSuggestion}>
            Insert AI Suggestion
          </button>
        )}
        <button type="button" onClick={() => onMarkdownExport?.(htmlToMarkdown(editor.getHTML()))}>
          Export MD
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
