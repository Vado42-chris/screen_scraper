import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Activity, Bookmark, FileText, RefreshCw, Save, Search, Server, Sparkles } from "lucide-react";
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

type SourceSummary = {
  source_id: string;
  title: string;
  source_type: string;
  snippet: string;
  created_at: string;
  updated_at: string;
};

type SourceRecord = SourceSummary & {
  content: string;
};

type SnapshotSummary = {
  snapshot_id: string;
  document_id: string;
  title: string;
  note: string;
  created_at: string;
  content_chars: number;
};

type SnapshotRecord = Omit<SnapshotSummary, "content_chars"> & {
  content: string;
};

type LedgerPayload = Record<string, string | number | boolean | null | undefined>;

type LedgerEvent = {
  event_id: string;
  event_type: string;
  captured_at: string;
  actor_type: string;
  target_type: string;
  target_id?: string | null;
  payload: LedgerPayload;
};

type AISuggestion = {
  model: string;
  message: string;
  suggestion: string;
};

const API_BASE = "http://127.0.0.1:8000";

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function eventTitle(event: LedgerEvent): string {
  switch (event.event_type) {
    case "document.created":
      return `Document created: ${event.payload.title ?? "Untitled"}`;
    case "document.saved":
      return `Document saved: ${event.payload.title ?? "Untitled"}`;
    case "snapshot.created":
      return `Checkpoint created: ${event.payload.note ?? event.payload.title ?? "snapshot"}`;
    case "snapshot.restore_previewed":
      return `Checkpoint previewed: ${event.payload.note ?? event.payload.title ?? "snapshot"}`;
    case "source.imported":
      return `Source imported: ${event.payload.title ?? "Untitled Source"}`;
    case "source_reference.inserted":
      return `Source reference inserted: ${event.payload.label ?? event.payload.source_title ?? "source"}`;
    case "section_prompt.created":
      return `Section prompt created: ${event.payload.label ?? "section prompt"}`;
    case "ai.requested":
      return `AI requested: ${event.payload.action ?? "writing assist"}`;
    case "ai.completed":
      return `AI suggestion ready: ${event.payload.suggestion_chars ?? 0} chars`;
    case "ai.failed":
      return `AI failed: ${event.payload.message ?? "provider error"}`;
    case "ai_suggestion.inserted":
      return `AI suggestion inserted: ${event.payload.suggestion_chars ?? 0} chars`;
    case "ollama.health_checked":
      return `Ollama checked: ${event.payload.model_count ?? 0} model(s)`;
    case "ollama.models_listed":
      return `Ollama models listed: ${event.payload.model_count ?? 0}`;
    case "provider.unavailable":
      return `Provider unavailable: ${event.payload.message ?? "check settings"}`;
    case "app.started":
      return "App backend started";
    default:
      return event.event_type.replaceAll("_", " ").replaceAll(".", " · ");
  }
}

function eventMeta(event: LedgerEvent): string {
  const time = new Date(event.captured_at).toLocaleString();
  return `${time} · ${event.actor_type} → ${event.target_type}`;
}

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [ollama, setOllama] = useState<OllamaStatus | null>(null);
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [sources, setSources] = useState<SourceSummary[]>([]);
  const [snapshots, setSnapshots] = useState<SnapshotSummary[]>([]);
  const [events, setEvents] = useState<LedgerEvent[]>([]);
  const [activeDocument, setActiveDocument] = useState<DocumentRecord | null>(null);
  const [activeSource, setActiveSource] = useState<SourceRecord | null>(null);
  const [activeSnapshot, setActiveSnapshot] = useState<SnapshotRecord | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [sourceSearch, setSourceSearch] = useState("");
  const [sourceTitle, setSourceTitle] = useState("Untitled Source");
  const [sourceContent, setSourceContent] = useState("");
  const [snapshotNote, setSnapshotNote] = useState("Manual checkpoint");
  const [aiInstruction, setAiInstruction] = useState("Continue from the current section.");
  const [aiModel, setAiModel] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [headings, setHeadings] = useState<HeadingAnchor[]>([]);
  const [activeHeadingText, setActiveHeadingText] = useState<string | null>(null);
  const [markdownPreview, setMarkdownPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snapshotting, setSnapshotting] = useState(false);
  const [loadingSnapshot, setLoadingSnapshot] = useState(false);
  const [importingSource, setImportingSource] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function fetchSnapshots(documentId: string) {
    const data = await fetch(`${API_BASE}/api/documents/${documentId}/snapshots`).then((response) =>
      readJson<{ snapshots: SnapshotSummary[] }>(response),
    );
    setSnapshots(data.snapshots);
  }

  async function refreshStatus(query = sourceSearch) {
    setLoading(true);
    setError(null);
    try {
      const sourceUrl = query.trim()
        ? `${API_BASE}/api/sources?q=${encodeURIComponent(query.trim())}`
        : `${API_BASE}/api/sources`;
      const [healthData, ollamaData, documentData, sourceData, eventData] = await Promise.all([
        fetch(`${API_BASE}/api/health`).then((response) => readJson<HealthStatus>(response)),
        fetch(`${API_BASE}/api/providers/ollama`).then((response) => readJson<OllamaStatus>(response)),
        fetch(`${API_BASE}/api/documents`).then((response) =>
          readJson<{ documents: DocumentSummary[] }>(response),
        ),
        fetch(sourceUrl).then((response) => readJson<{ sources: SourceSummary[] }>(response)),
        fetch(`${API_BASE}/api/events/recent?limit=12`).then((response) =>
          readJson<{ events: LedgerEvent[] }>(response),
        ),
      ]);
      setHealth(healthData);
      setOllama(ollamaData);
      setDocuments(documentData.documents);
      setSources(sourceData.sources);
      setEvents(eventData.events);
      if (activeDocument) {
        await fetchSnapshots(activeDocument.document_id);
      }
      if (!aiModel && ollamaData.models.length > 0) {
        setAiModel(ollamaData.models[0].name);
      }
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
      setSnapshots([]);
      setActiveSnapshot(null);
      setHeadings([]);
      setActiveHeadingText(null);
      setMarkdownPreview("");
      setAiSuggestion(null);
      setNotice("Document created.");
      await refreshStatus();
      await fetchSnapshots(data.document.document_id);
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
      setActiveSnapshot(null);
      setHeadings([]);
      setActiveHeadingText(null);
      setMarkdownPreview("");
      setAiSuggestion(null);
      await fetchSnapshots(data.document.document_id);
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

  async function createCheckpoint() {
    if (!activeDocument) {
      setError("Open a document before creating a checkpoint.");
      return;
    }
    setSnapshotting(true);
    setError(null);
    setNotice(null);
    try {
      await fetch(`${API_BASE}/api/documents/${activeDocument.document_id}/snapshots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: draftTitle, content: draftContent, note: snapshotNote }),
      }).then((response) => readJson<{ snapshot: SnapshotSummary }>(response));
      setNotice("Checkpoint created.");
      setSnapshotNote("Manual checkpoint");
      setActiveSnapshot(null);
      await fetchSnapshots(activeDocument.document_id);
      await refreshStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create checkpoint.");
    } finally {
      setSnapshotting(false);
    }
  }

  async function previewCheckpoint(snapshotId: string) {
    setLoadingSnapshot(true);
    setError(null);
    setNotice(null);
    try {
      const data = await fetch(`${API_BASE}/api/snapshots/${snapshotId}/restore-preview`, {
        method: "POST",
      }).then((response) => readJson<{ snapshot: SnapshotRecord; event_id: string }>(response));
      setActiveSnapshot(data.snapshot);
      setNotice("Checkpoint preview loaded and recorded. Document was not changed.");
      await refreshStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load checkpoint preview.");
    } finally {
      setLoadingSnapshot(false);
    }
  }

  async function importSource() {
    setImportingSource(true);
    setError(null);
    setNotice(null);
    try {
      const data = await fetch(`${API_BASE}/api/sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: sourceTitle, source_type: "paste", content: sourceContent }),
      }).then((response) => readJson<{ source: SourceRecord }>(response));
      setActiveSource(data.source);
      setSourceTitle("Untitled Source");
      setSourceContent("");
      setNotice("Source imported.");
      await refreshStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not import source.");
    } finally {
      setImportingSource(false);
    }
  }

  async function openSource(sourceId: string) {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const data = await fetch(`${API_BASE}/api/sources/${sourceId}`).then((response) =>
        readJson<{ source: SourceRecord }>(response),
      );
      setActiveSource(data.source);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open source.");
    } finally {
      setLoading(false);
    }
  }

  async function recordSourceReferenceInserted(sourceId: string, label: string) {
    if (!activeDocument) return;
    try {
      await fetch(`${API_BASE}/api/source-references`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_id: activeDocument.document_id,
          source_id: sourceId,
          label,
        }),
      }).then((response) => readJson<{ ok: boolean; event_id: string }>(response));
      setNotice(`${label} inserted and recorded.`);
      await refreshStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Source reference was inserted, but not recorded.");
    }
  }

  async function recordSectionPromptInserted(promptId: string, label: string, status: string) {
    if (!activeDocument) return;
    try {
      await fetch(`${API_BASE}/api/section-prompts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_id: activeDocument.document_id,
          prompt_id: promptId,
          label,
          status,
          active_heading: activeHeadingText,
        }),
      }).then((response) => readJson<{ ok: boolean; event_id: string }>(response));
      setNotice(`${label} inserted and recorded.`);
      await refreshStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Section prompt was inserted, but not recorded.");
    }
  }

  async function requestAIContinue() {
    if (!activeDocument) {
      setError("Open a document before asking AI to continue.");
      return;
    }
    if (!aiModel) {
      setError("Select an Ollama model before asking AI to continue.");
      return;
    }
    setAiLoading(true);
    setError(null);
    setNotice(null);
    try {
      const data = await fetch(`${API_BASE}/api/ai/continue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_id: activeDocument.document_id,
          model: aiModel,
          instruction: aiInstruction,
          active_heading: activeHeadingText,
          context_markdown: markdownPreview,
        }),
      }).then((response) =>
        readJson<{ ok: boolean; message: string; model: string; suggestion: string }>(response),
      );
      setAiSuggestion({ model: data.model, message: data.message, suggestion: data.suggestion });
      setNotice(data.ok ? "AI suggestion ready for review." : data.message);
      await refreshStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI suggestion request failed.");
    } finally {
      setAiLoading(false);
    }
  }

  async function recordAISuggestionInserted() {
    if (!activeDocument || !aiSuggestion) return;
    try {
      await fetch(`${API_BASE}/api/ai/suggestion-inserted`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_id: activeDocument.document_id,
          model: aiSuggestion.model,
          suggestion_chars: aiSuggestion.suggestion.length,
          active_heading: activeHeadingText,
        }),
      }).then((response) => readJson<{ ok: boolean; event_id: string }>(response));
      setNotice("AI suggestion inserted and recorded.");
      setAiSuggestion(null);
      await refreshStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI suggestion was inserted, but not recorded.");
    }
  }

  async function searchSources() {
    await refreshStatus(sourceSearch);
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
                selectedSource={activeSource}
                pendingSuggestion={aiSuggestion?.suggestion ?? ""}
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
                onSourceReferenceInserted={(sourceId, label) => {
                  void recordSourceReferenceInserted(sourceId, label);
                }}
                onSectionPromptInserted={(promptId, label, status) => {
                  void recordSectionPromptInserted(promptId, label, status);
                }}
                onSuggestionInserted={() => {
                  void recordAISuggestionInserted();
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

        <aside className="panel" aria-label="Sources, checkpoints, runtime, activity, and export status">
          <div className="panelHeader">
            <Sparkles size={20} />
            <h2>AI Suggestion</h2>
          </div>
          <div className="aiAssistPanel">
            <select
              className="compactInput"
              aria-label="AI model"
              value={aiModel}
              onChange={(event) => setAiModel(event.target.value)}
            >
              <option value="">Select model</option>
              {ollama?.models.map((model) => (
                <option key={model.name} value={model.name}>
                  {model.name}
                </option>
              ))}
            </select>
            <textarea
              className="sourceImportText"
              aria-label="AI instruction"
              value={aiInstruction}
              onChange={(event) => setAiInstruction(event.target.value)}
            />
            <button
              className="button fullWidth"
              type="button"
              disabled={aiLoading || !activeDocument || !aiModel}
              onClick={() => void requestAIContinue()}
            >
              {aiLoading ? "Thinking…" : "Ask AI to Continue"}
            </button>
            {aiSuggestion && (
              <section className="aiSuggestionPreview" aria-label="AI suggestion preview">
                <strong>Suggestion from {aiSuggestion.model}</strong>
                <p className="muted smallText">Review only. Use the editor toolbar button to insert this text.</p>
                <textarea readOnly value={aiSuggestion.suggestion} aria-label="AI suggestion text" />
              </section>
            )}
          </div>

          <div className="divider" />

          <div className="panelHeader compact">
            <Bookmark size={20} />
            <h2>Checkpoints</h2>
          </div>
          <div className="checkpointPanel">
            <input
              aria-label="Checkpoint note"
              className="compactInput"
              value={snapshotNote}
              onChange={(event) => setSnapshotNote(event.target.value)}
              placeholder="Checkpoint note"
            />
            <button
              className="button fullWidth"
              type="button"
              disabled={snapshotting || !activeDocument}
              onClick={() => void createCheckpoint()}
            >
              {snapshotting ? "Creating…" : "Create Checkpoint"}
            </button>
            {snapshots.length === 0 ? (
              <p className="muted smallText">No checkpoints yet for this document.</p>
            ) : (
              <ol className="snapshotList">
                {snapshots.map((snapshot) => (
                  <li key={snapshot.snapshot_id}>
                    <button
                      className={
                        activeSnapshot?.snapshot_id === snapshot.snapshot_id
                          ? "snapshotButton active"
                          : "snapshotButton"
                      }
                      type="button"
                      disabled={loadingSnapshot}
                      onClick={() => void previewCheckpoint(snapshot.snapshot_id)}
                    >
                      <strong>{snapshot.note}</strong>
                      <span>{new Date(snapshot.created_at).toLocaleString()}</span>
                      <small>{snapshot.content_chars} chars captured</small>
                    </button>
                  </li>
                ))}
              </ol>
            )}

            {activeSnapshot && (
              <section className="snapshotPreview" aria-label="Checkpoint preview">
                <strong>{activeSnapshot.note}</strong>
                <span>{new Date(activeSnapshot.created_at).toLocaleString()}</span>
                <p className="muted smallText">Preview only. The current document has not been changed.</p>
                <textarea readOnly value={activeSnapshot.content} aria-label="Checkpoint content preview" />
              </section>
            )}
          </div>

          <div className="divider" />

          <div className="panelHeader compact">
            <Search size={20} />
            <h2>Sources</h2>
          </div>
          <div className="sourceImportForm">
            <input
              aria-label="Source title"
              className="compactInput"
              value={sourceTitle}
              onChange={(event) => setSourceTitle(event.target.value)}
              placeholder="Source title"
            />
            <textarea
              aria-label="Source content"
              className="sourceImportText"
              value={sourceContent}
              onChange={(event) => setSourceContent(event.target.value)}
              placeholder="Paste source text or notes here."
            />
            <button
              className="button fullWidth"
              type="button"
              disabled={importingSource || sourceContent.trim().length === 0}
              onClick={() => void importSource()}
            >
              {importingSource ? "Importing…" : "Import Source"}
            </button>
          </div>

          <div className="sourceSearchRow">
            <input
              aria-label="Search sources"
              className="compactInput"
              value={sourceSearch}
              onChange={(event) => setSourceSearch(event.target.value)}
              placeholder="Search sources"
            />
            <button className="button iconButton" type="button" onClick={() => void searchSources()}>
              <Search size={16} />
            </button>
          </div>

          {sources.length === 0 ? (
            <p className="muted smallText">No sources yet. Import a source to support evidence-aware writing.</p>
          ) : (
            <ul className="sourceList">
              {sources.map((source) => (
                <li key={source.source_id}>
                  <button
                    className={
                      activeSource?.source_id === source.source_id
                        ? "sourceButton active"
                        : "sourceButton"
                    }
                    type="button"
                    onClick={() => void openSource(source.source_id)}
                  >
                    <span>{source.title}</span>
                    <small>{source.source_type}</small>
                    <p>{source.snippet}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {activeSource && (
            <section className="sourcePreview" aria-label="Selected source preview">
              <h3>{activeSource.title}</h3>
              <p className="muted smallText">{activeSource.source_type}</p>
              <p className="muted smallText">Use the editor toolbar button @{activeSource.title} to insert this source.</p>
              <textarea readOnly value={activeSource.content} aria-label="Selected source text" />
            </section>
          )}

          <div className="divider" />

          <div className="panelHeader compact">
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
            <Activity size={20} />
            <h2>Recent Activity</h2>
          </div>
          {events.length === 0 ? (
            <p className="muted smallText">No activity recorded yet.</p>
          ) : (
            <ol className="eventList">
              {events.map((event) => (
                <li key={event.event_id} className="eventItem">
                  <strong>{eventTitle(event)}</strong>
                  <span>{eventMeta(event)}</span>
                </li>
              ))}
            </ol>
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
