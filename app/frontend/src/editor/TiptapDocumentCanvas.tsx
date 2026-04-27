import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useMemo } from "react";
import type { HeadingAnchor } from "./types";

type TiptapDocumentCanvasProps = {
  documentId: string;
  content: string;
  onChange: (html: string, text: string, headings: HeadingAnchor[]) => void;
  onCursorContextChange?: (activeHeadingId: string | null, activeHeadingText: string | null) => void;
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

export function TiptapDocumentCanvas({
  documentId,
  content,
  onChange,
  onCursorContextChange,
}: TiptapDocumentCanvasProps) {
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
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
      const root = getEditorRoot(documentId);
      onChange(editor.getHTML(), editor.getText(), extractHeadingAnchors(root));
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
      const root = getEditorRoot(documentId);
      onChange(editor.getHTML(), editor.getText(), extractHeadingAnchors(root));
    }
  }, [content, documentId, editor, onChange]);

  if (!editor) {
    return <div className="editorLoading">Loading editor…</div>;
  }

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
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
