import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { FileText, RefreshCw, Save, Server, Sparkles } from "lucide-react";
import { TiptapDocumentCanvas } from "./editor/TiptapDocumentCanvas";
import type { HeadingAnchor } from "./editor/types";
import "./styles.css";

type OllamaModel = {
  name: string;
  size?: number | null;
  modified_at?: string | null;
};

type OllamaStatus = {
  ok: boolean;
  base_url: string;
  message: string;
  models: OllamaModel[];
};

type HealthStatus = {
  ok: string;
  app_name: string;
  environment: string;
};

type DocumentSummary = {
  document_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

type DocumentRecord = DocumentSummary & {
  content: string;
};

const API_BASE = "http://127.0.0.1:8000";

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [ollama, setOllama] = useState<OllamaStatus | null>(null);
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [activeDocument, setActiveDocument] = useState<DocumentRecord | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [headings, setHeadings] = useState<HeadingAnchor[]>([]);
  const [activeHeadingText, setActiveHeadingText] = useState<string | null>(null);
  const [markdownPreview, setMarkdownPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function refreshStatus() {
    setLoading(true);
    setError(null);
    try {
      const [healthData, ollamaData, documentData] = await Promise.all([
        fetch(`${API_BASE}/api/health`).then((response) => readJson<HealthStatus>(response)),
        fetch(`${API_BASE}/api/providers/ollama`).then((response) => readJson<OllamaStatus>(response)),
        fetch(`${API_BASE}/api/documents`).then((response) =>
          readJson<{ documents: DocumentSummary[] }>(response),
        ),
      ]);
      setHealth(healthData);
      setOllama(ollamaData);
      setDocuments(documentData.documents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown status error.");
    } finally {
      setLoading(false);
    }
  }

  async function createDocument() {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const data = await fetch(`${API_BASE}/api/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled Document", content: "" }),
      }).then((response) => readJson<{ document: DocumentRecord }>(response));
      setActiveDocument(data.document);
      setDraftTitle(data.document.title);
      setDraftContent(data.document.content);
      setHeadings([]);
      setActiveHeadingText(null);
      setMarkdownPreview("");
      setNotice("Document created.");
      await refreshStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create document.");
    } finally {
      setLoading(false);
    }
  }

  async function openDocument(documentId: string) {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const data = await fetch(`${API_BASE}/api/documents/${documentId}`).then((response) =>
        readJson<{ document: DocumentRecord }>(response),
      );
      setActiveDocument(data.document);
      setDraftTitle(data.document.title);
      setDraftContent(data.document.content);
      setHeadings([]);
      setActiveHeadingText(null);
      setMarkdownPreview("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open document.");
    } finally {
      setLoading(false);
    }
  }

  async function saveDocument() {
    if (!activeDocument) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const data = await fetch(`${API_BASE}/api/documents/${activeDocument.document_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: draftTitle, content: draftContent }),
      }).then((response) => readJson<{ document: DocumentRecord }>(response));
      setActiveDocument(data.document);
      setDraftTitle(data.document.title);
      setDraftContent(data.document.content);
      setNotice("Document saved.");
      await refreshStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save document.");
    } finally {
      setSaving(false);
    }
  }

  function jumpToHeading(headingId: string) {
    const target = document.getElementById(`heading-${headingId}`);
    if (!target) {
      setError("That heading is not available yet. Try saving or editing the heading again.");
      return;
    }
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    target.focus?.();
  }

  useEffect(() => {
    void refreshStatus();
  }, []);

  return (
    <main className="shell appShell">
      <section className="topBar" aria-label="Workspace status">
        <div>
          <div className="eyebrow"><Sparkles size={18} /> xi-io compliant writing runtime</div>
          <h1>screen_scraper</h1>
        </div>
        <button className="button secondary" type="button" onClick={() => void refreshStatus()} disabled={loading}>
          <RefreshCw size={18} />
          {loading ? "Checking…" : "Refresh"}
        </button>
      </section>

      <section className="workspaceGrid">
        <aside className="panel" aria-label="Documents and active outline">
          <div className="panelHeader">
            <FileText size={20} />
            <h2>Documents</h2>
          </div>
          <button className="button fullWidth" type="button" onClick={() => void createDocument()} disabled={loading}>
            New Document
          </button>
          {documents.length === 0 ? (
            <p className="muted smallText">No documents yet. Create one to start the writing loop.</p>
          ) : (
            <ul className="documentList">
              {documents.map((document) => (
                <li key={document.document_id}>
                  <button
                    className={
                      activeDocument?.document_id === document.document_id
                        ? "documentButton active"
                        : "documentButton"
                    }
                    type="button"
                    onClick={() => void openDocument(document.document_id)}
                  >
                    <span>{document.title}</span>
                    <small>{new Date(document.updated_at).toLocaleString()}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="divider" />
          <div className="panelHeader compact">
            <h2>Active Outline</h2>
          </div>
          {headings.length === 0 ? (
            <p className="muted smallText">Add H1, H2, or H3 headings in the editor to build the outline.</p>
          ) : (
            <ol className="outlineList">
              {headings.map((heading) => (
                <li key={heading.id}>
                  <button
                    className={`outlineButton level${heading.level}`}
                    type="button"
                    onClick={() => jumpToHeading(heading.id)}
                  >
                    <span>{heading.text}</span>
                    <small>H{heading.level}</small>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </aside>

        <section className="editorPanel" aria-label="Document editor">
          {activeDocument ? (
            <>
              <div className="editorHeader">
                <input
                  className="titleInput"
                  aria-label="Document title"
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                />
                <button className="button" type="button" onClick={() => void saveDocument()} disabled={saving}>
                  <Save size={18} />
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
              <TiptapDocumentCanvas
                documentId={activeDocument.document_id}
                content={draftContent}
                onChange={(html, _text, markdown, nextHeadings) => {
                  setDraftContent(html);
                  setMarkdownPreview(markdown);
                  setHeadings(nextHeadings);
                }}
                onCursorContextChange={(_activeHeadingId, nextActiveHeadingText) => {
                  setActiveHeadingText(nextActiveHeadingText);
                }}
                onMarkdownExport={(markdown) => {
                  setMarkdownPreview(markdown);
                  setNotice("Markdown preview refreshed.");
                }}
              />
              <p className="muted smallText">
                Tiptap/ProseMirror spike active. Current heading context: {activeHeadingText ?? "none"}.
              </p>
            </>
          ) : (
            <div className="emptyState">
              <h2>Start with a document</h2>
              <p>Create or open a document. Manual writing works first, AI and source-aware drafting layer in after the editor adapter.</p>
            </div>
          )}
        </section>

        <aside className="panel" aria-label="Runtime and export status">
          <div className="panelHeader">
            <Server size={20} />
            <h2>Runtime</h2>
          </div>
          {health ? (
            <dl>
              <dt>Backend</dt>
              <dd>{health.ok === "true" ? "Online" : "Unknown"}</dd>
              <dt>Environment</dt>
              <dd>{health.environment}</dd>
            </dl>
          ) : (
            <p className="muted">Waiting for backend status…</p>
          )}

          <div className="divider" />

          <div className="panelHeader compact">
            <Sparkles size={20} />
            <h2>Ollama</h2>
          </div>
          {ollama ? (
            <>
              <p className={ollama.ok ? "good" : "warning"}>{ollama.message}</p>
              <dl>
                <dt>Endpoint</dt>
                <dd>{ollama.base_url}</dd>
                <dt>Models</dt>
                <dd>{ollama.models.length}</dd>
              </dl>
              {ollama.models.length > 0 && (
                <ul className="modelList">
                  {ollama.models.map((model) => (
                    <li key={model.name}>{model.name}</li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="muted">Checking Ollama through the backend gateway…</p>
          )}

          <div className="divider" />

          <div className="panelHeader compact">
            <h2>Markdown Preview</h2>
          </div>
          {markdownPreview ? (
            <textarea
              className="markdownPreview"
              aria-label="Markdown export preview"
              readOnly
              value={markdownPreview}
            />
          ) : (
            <p className="muted smallText">Use Export MD in the editor toolbar to preview Markdown here.</p>
          )}
        </aside>
      </section>

      {(error || notice) && (
        <section className="statusToast" aria-live="polite">
          {error && <p className="error">{error}</p>}
          {notice && <p className="good">{notice}</p>}
        </section>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
