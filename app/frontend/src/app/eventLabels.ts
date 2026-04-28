import type { LedgerEvent } from "./types";

export function eventTitle(event: LedgerEvent): string {
  switch (event.event_type) {
    case "document.created":
      return `Document created: ${event.payload.title ?? "Untitled"}`;
    case "document.saved":
      return `Document saved: ${event.payload.title ?? "Untitled"}`;
    case "snapshot.created":
      return `Checkpoint created: ${event.payload.note ?? event.payload.title ?? "snapshot"}`;
    case "snapshot.restore_previewed":
      return `Checkpoint previewed: ${event.payload.note ?? event.payload.title ?? "snapshot"}`;
    case "snapshot.pre_restore_checkpoint_created":
      return `Pre-restore checkpoint created: ${event.payload.note ?? event.payload.title ?? "snapshot"}`;
    case "snapshot.restored":
      return `Checkpoint restored: ${event.payload.note ?? event.payload.title ?? "snapshot"}`;
    case "export.requested":
      return `Export requested: ${event.payload.format ?? "artifact"}`;
    case "export.bundle_created":
      return `Export bundle created: ${event.payload.format ?? "bundle"}`;
    case "export.completed":
      return `Export completed: ${event.payload.format ?? "artifact"}`;
    case "export.failed":
      return `Export failed: ${event.payload.message ?? event.payload.format ?? "artifact"}`;
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

export function eventMeta(event: LedgerEvent): string {
  const time = new Date(event.captured_at).toLocaleString();
  return `${time} · ${event.actor_type} → ${event.target_type}`;
}
