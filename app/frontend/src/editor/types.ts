export type HeadingAnchor = {
  id: string;
  level: 1 | 2 | 3;
  text: string;
};

export type CursorContext = {
  documentId: string;
  selectionEmpty: boolean;
  activeHeadingId: string | null;
  activeHeadingText: string | null;
};

export type EditorSnapshot = {
  html: string;
  text: string;
  markdown: string;
  headings: HeadingAnchor[];
};

export type EditorCommand = {
  insertHeading: (level: 1 | 2 | 3) => void;
  insertSourceReferenceStub: () => void;
  insertSectionPromptStub: () => void;
  exportMarkdown: () => string;
};

export type EditorAdapter = {
  getSnapshot: () => EditorSnapshot;
  getCursorContext: (documentId: string) => CursorContext;
  commands: EditorCommand;
};
