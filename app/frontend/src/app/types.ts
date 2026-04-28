export type OllamaModel = {
  name: string;
  size?: number | null;
  modified_at?: string | null;
};

export type OllamaStatus = {
  ok: boolean;
  base_url: string;
  message: string;
  models: OllamaModel[];
};

export type HealthStatus = {
  ok: string;
  app_name: string;
  environment: string;
};

export type DocumentSummary = {
  document_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type DocumentRecord = DocumentSummary & {
  content: string;
};

export type SourceSummary = {
  source_id: string;
  title: string;
  source_type: string;
  snippet: string;
  created_at: string;
  updated_at: string;
};

export type SourceRecord = SourceSummary & {
  content: string;
};

export type SnapshotSummary = {
  snapshot_id: string;
  document_id: string;
  title: string;
  note: string;
  created_at: string;
  content_chars: number;
};

export type SnapshotRecord = Omit<SnapshotSummary, "content_chars"> & {
  content: string;
};

export type LedgerPayload = Record<string, string | number | boolean | null | undefined>;

export type LedgerEvent = {
  event_id: string;
  event_type: string;
  captured_at: string;
  actor_type: string;
  target_type: string;
  target_id?: string | null;
  payload: LedgerPayload;
};

export type AISuggestion = {
  model: string;
  message: string;
  suggestion: string;
};
