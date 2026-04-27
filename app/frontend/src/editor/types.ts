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
  headings: HeadingAnchor[];
};

export type EditorAdapter = {
  getSnapshot: () => EditorSnapshot;
  getCursorContext: (documentId: string) => CursorContext;
  insertHeading: (level: 1 | 2 | 3) => void;
  exportMarkdown: () => string;
};
