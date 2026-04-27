import { useMemo, useState } from "react";
import "./exportPanel.css";

const API_BASE = "http://127.0.0.1:8000";

type ExportFormat = "md" | "html" | "txt" | "json" | "zip";

type ExportProfile =
  | "Draft Review"
  | "Clean Artifact"
  | "Web Preview"
  | "Source Package"
  | "Archive Package"
  | "Metadata Report"
  | "Lexicon Report";

type DocumentType =
  | "article"
  | "chapter"
  | "guide"
  | "report"
  | "research_packet"
  | "source_package"
  | "archive_package"
  | "metadata_report"
  | "lexicon_report";

type ExportArtifact = {
  artifact_id: string;
  filename: string;
  format: ExportFormat;
  content_type: string;
  content: string;
  content_chars: number;
  content_encoding?: "utf-8" | "base64";
};

type ExportResponse = {
  export_id: string;
  artifact: ExportArtifact;
  manifest: {
    manifest_version: number;
    artifact_count: number;
    warning_count: number;
    warnings: string[];
    format: string;
    export_profile: string;
    adapter_version: string;
  };
};

type ExportPanelProps = {
  documentId: string | null;
  onExportComplete?: () => void | Promise<void>;
};

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function downloadTextArtifact(artifact: ExportArtifact) {
  const blob = new Blob([artifact.content], { type: artifact.content_type });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, artifact.filename);
  URL.revokeObjectURL(url);
}

function downloadBase64Artifact(artifact: ExportArtifact) {
  const binary = atob(artifact.content);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  const blob = new Blob([bytes], { type: artifact.content_type });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, artifact.filename);
  URL.revokeObjectURL(url);
}

function triggerDownload(url: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export function ExportPanel({ documentId, onExportComplete }: ExportPanelProps) {
  const [format, setFormat] = useState<ExportFormat>("md");
  const [profile, setProfile] = useState<ExportProfile>("Draft Review");
  const [documentType, setDocumentType] = useState<DocumentType>("article");
  const [includeSources, setIncludeSources] = useState(true);
  const [includeLexicon, setIncludeLexicon] = useState(false);
  const [includePrompts, setIncludePrompts] = useState(true);
  const [includeAiProvenance, setIncludeAiProvenance] = useState(false);
  const [includeMediaMetadata, setIncludeMediaMetadata] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState<ExportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canPreview = result?.artifact.content_encoding !== "base64";
  const previewValue = useMemo(() => {
    if (!result || !canPreview) return "";
    return result.artifact.content;
  }, [canPreview, result]);

  async function requestExport() {
    if (!documentId) {
      setError("Open a document before exporting.");
      return;
    }
    setExporting(true);
    setError(null);
    try {
      const data = await fetch(`${API_BASE}/api/documents/${documentId}/exports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          profile,
          document_type: documentType,
          include_sources: includeSources,
          include_lexicon: includeLexicon,
          include_prompts: includePrompts,
          include_ai_provenance: includeAiProvenance,
          include_media_metadata: includeMediaMetadata,
        }),
      }).then((response) => readJson<ExportResponse>(response));
      setResult(data);
      await onExportComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  }

  function downloadArtifact() {
    if (!result) return;
    if (result.artifact.content_encoding === "base64") {
      downloadBase64Artifact(result.artifact);
      return;
    }
    downloadTextArtifact(result.artifact);
  }

  return (
    <section className="exportPanel" aria-label="Document export">
      <div className="exportPanelHeader">
        <strong>Export</strong>
        <span>Framework egress</span>
      </div>

      <label className="exportField">
        <span>Format</span>
        <select value={format} onChange={(event) => setFormat(event.target.value as ExportFormat)}>
          <option value="md">Markdown .md</option>
          <option value="html">HTML .html</option>
          <option value="txt">Plain text .txt</option>
          <option value="json">Package .json</option>
          <option value="zip">Bundle .zip</option>
        </select>
      </label>

      <label className="exportField">
        <span>Profile</span>
        <select value={profile} onChange={(event) => setProfile(event.target.value as ExportProfile)}>
          <option value="Draft Review">Draft Review</option>
          <option value="Clean Artifact">Clean Artifact</option>
          <option value="Web Preview">Web Preview</option>
          <option value="Source Package">Source Package</option>
          <option value="Archive Package">Archive Package</option>
          <option value="Metadata Report">Metadata Report</option>
          <option value="Lexicon Report">Lexicon Report</option>
        </select>
      </label>

      <label className="exportField">
        <span>Document type</span>
        <select value={documentType} onChange={(event) => setDocumentType(event.target.value as DocumentType)}>
          <option value="article">Article</option>
          <option value="chapter">Chapter</option>
          <option value="guide">Guide</option>
          <option value="report">Report</option>
          <option value="research_packet">Research packet</option>
          <option value="source_package">Source package</option>
          <option value="archive_package">Archive package</option>
          <option value="metadata_report">Metadata report</option>
          <option value="lexicon_report">Lexicon report</option>
        </select>
      </label>

      <div className="exportToggles" aria-label="Export inclusions">
        <label><input type="checkbox" checked={includeSources} onChange={(event) => setIncludeSources(event.target.checked)} /> Sources</label>
        <label><input type="checkbox" checked={includeLexicon} onChange={(event) => setIncludeLexicon(event.target.checked)} /> Lexicon</label>
        <label><input type="checkbox" checked={includePrompts} onChange={(event) => setIncludePrompts(event.target.checked)} /> Prompts</label>
        <label><input type="checkbox" checked={includeAiProvenance} onChange={(event) => setIncludeAiProvenance(event.target.checked)} /> AI provenance</label>
        <label><input type="checkbox" checked={includeMediaMetadata} onChange={(event) => setIncludeMediaMetadata(event.target.checked)} /> Media metadata</label>
      </div>

      <button className="button fullWidth" type="button" disabled={exporting || !documentId} onClick={() => void requestExport()}>
        {exporting ? "Exporting…" : "Export Document"}
      </button>

      {error && <p className="exportError">{error}</p>}

      {result && (
        <section className="exportResult" aria-label="Export result">
          <strong>{result.artifact.filename}</strong>
          <span>{result.artifact.content_chars} chars · {result.manifest.artifact_count} artifact(s)</span>
          <button className="button secondary fullWidth" type="button" onClick={downloadArtifact}>
            Download Artifact
          </button>
          {canPreview ? (
            <textarea readOnly value={previewValue} aria-label="Export artifact preview" />
          ) : (
            <p className="exportMuted">ZIP bundle ready. Use Download Artifact to save it locally.</p>
          )}
        </section>
      )}
    </section>
  );
}
