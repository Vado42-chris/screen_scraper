import { Node } from "@tiptap/core";

export const SectionPromptBlock = Node.create({
  name: "sectionPromptBlock",

  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      promptId: {
        default: "stub",
        parseHTML: (element) => element.getAttribute("data-prompt-id") ?? "stub",
        renderHTML: (attributes) => ({ "data-prompt-id": attributes.promptId }),
      },
      status: {
        default: "draft",
        parseHTML: (element) => element.getAttribute("data-status") ?? "draft",
        renderHTML: (attributes) => ({ "data-status": attributes.status }),
      },
      label: {
        default: "[[prompt:section]]",
        parseHTML: (element) => element.getAttribute("data-label") ?? "[[prompt:section]]",
        renderHTML: (attributes) => ({ "data-label": attributes.label }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "section[data-node-type='section-prompt-block']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "section",
      {
        ...HTMLAttributes,
        "data-node-type": "section-prompt-block",
        class: "sectionPromptBlock",
        contenteditable: "false",
      },
      ["strong", {}, HTMLAttributes["data-label"] ?? "[[prompt:section]]"],
      ["span", {}, `Status: ${HTMLAttributes["data-status"] ?? "draft"}`],
    ];
  },

  renderText({ node }) {
    return node.attrs.label ?? "[[prompt:section]]";
  },
});
