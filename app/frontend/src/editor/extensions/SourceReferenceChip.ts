import { Node } from "@tiptap/core";

export const SourceReferenceChip = Node.create({
  name: "sourceReferenceChip",

  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      sourceId: {
        default: "stub",
        parseHTML: (element) => element.getAttribute("data-source-id") ?? "stub",
        renderHTML: (attributes) => ({ "data-source-id": attributes.sourceId }),
      },
      label: {
        default: "@source:stub",
        parseHTML: (element) => element.getAttribute("data-label") ?? "@source:stub",
        renderHTML: (attributes) => ({ "data-label": attributes.label }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-node-type='source-reference-chip']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      {
        ...HTMLAttributes,
        "data-node-type": "source-reference-chip",
        class: "sourceReferenceChip",
        contenteditable: "false",
      },
      HTMLAttributes["data-label"] ?? "@source:stub",
    ];
  },

  renderText({ node }) {
    return node.attrs.label ?? "@source:stub";
  },
});
