from __future__ import annotations

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.config import Settings, get_settings
from app.services.document_service import DocumentService
from app.services.event_ledger import EventLedgerService
from app.services.export_service import ExportRequest, ExportService
from app.services.ollama_provider import OllamaProviderService, OllamaStatus
from app.services.snapshot_service import SnapshotService
from app.services.source_library_service import SourceLibraryService

app = FastAPI(title="screen_scraper backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DocumentCreateRequest(BaseModel):
    title: str = Field(default="Untitled Document", max_length=240)
    content: str = ""


class DocumentUpdateRequest(BaseModel):
    title: str = Field(default="Untitled Document", max_length=240)
    content: str = ""


class DocumentExportRequest(BaseModel):
    format: str = Field(default="md", min_length=1, max_length=20)
    profile: str = Field(default="Draft Review", max_length=80)
    document_type: str = Field(default="article", max_length=80)
    include_sources: bool = True
    include_lexicon: bool = False
    include_prompts: bool = True
    include_ai_provenance: bool = False
    include_media_metadata: bool = True


class DocumentSnapshotCreateRequest(BaseModel):
    title: str = Field(default="Untitled Document", max_length=240)
    content: str = ""
    note: str = Field(default="Manual checkpoint", max_length=500)


class SnapshotRestoreRequest(BaseModel):
    document_id: str = Field(min_length=1)
    pre_restore_title: str = Field(default="Untitled Document", max_length=240)
    pre_restore_content: str = ""
    confirmation: str = Field(min_length=1, max_length=40)


class SourceCreateRequest(BaseModel):
    title: str = Field(default="Untitled Source", max_length=240)
    source_type: str = Field(default="paste", max_length=80)
    content: str = Field(default="", min_length=1)


class SourceReferenceInsertedRequest(BaseModel):
    document_id: str = Field(min_length=1)
    source_id: str = Field(min_length=1)
    label: str = Field(min_length=1, max_length=240)


class SectionPromptCreatedRequest(BaseModel):
    document_id: str = Field(min_length=1)
    prompt_id: str = Field(min_length=1, max_length=120)
    label: str = Field(default="Section Prompt", min_length=1, max_length=240)
    status: str = Field(default="draft", min_length=1, max_length=80)
    active_heading: str | None = Field(default=None, max_length=240)


class AIContinueRequest(BaseModel):
    document_id: str = Field(min_length=1)
    model: str = Field(min_length=1, max_length=160)
    instruction: str = Field(default="Continue from the current writing context.", max_length=2000)
    active_heading: str | None = Field(default=None, max_length=240)
    context_markdown: str = Field(default="", max_length=12000)


class AISuggestionInsertedRequest(BaseModel):
    document_id: str = Field(min_length=1)
    model: str = Field(min_length=1, max_length=160)
    suggestion_chars: int = Field(ge=0)
    active_heading: str | None = Field(default=None, max_length=240)


def get_ledger(settings: Settings = Depends(get_settings)) -> EventLedgerService:
    return EventLedgerService(settings.sqlite_path)


def get_documents(settings: Settings = Depends(get_settings)) -> DocumentService:
    return DocumentService(settings.sqlite_path)


def get_sources(settings: Settings = Depends(get_settings)) -> SourceLibraryService:
    return SourceLibraryService(settings.sqlite_path)


def get_snapshots(settings: Settings = Depends(get_settings)) -> SnapshotService:
    return SnapshotService(settings.sqlite_path)


def get_exports(ledger: EventLedgerService = Depends(get_ledger)) -> ExportService:
    return ExportService(ledger)


def build_continue_prompt(request: AIContinueRequest, document_title: str) -> str:
    heading = request.active_heading or "No active heading detected"
    context = request.context_markdown.strip() or "No document context was supplied."
    return f"""You are helping a writer continue a draft.

Rules:
- Return suggestion text only.
- Do not explain the system.
- Do not overwrite the document.
- Keep the style consistent with the supplied context.
- Prefer a useful continuation of the active section.

Document title: {document_title}
Active heading: {heading}
User instruction: {request.instruction}

Current draft context:
{context}
"""


@app.on_event("startup")
def record_startup() -> None:
    settings = get_settings()
    ledger = EventLedgerService(settings.sqlite_path)
    ledger.append(
        event_type="app.started",
        actor_type="system",
        target_type="system",
        payload={"environment": settings.environment, "app_name": settings.app_name},
    )


@app.get("/api/health")
def health(settings: Settings = Depends(get_settings)) -> dict[str, str]:
    return {
        "ok": "true",
        "app_name": settings.app_name,
        "environment": settings.environment,
    }


@app.get("/api/providers/ollama", response_model=OllamaStatus)
async def ollama_status(
    settings: Settings = Depends(get_settings),
    ledger: EventLedgerService = Depends(get_ledger),
) -> OllamaStatus:
    provider = OllamaProviderService(settings.ollama_base_url)
    status = await provider.list_models()
    ledger.append(
        event_type="ollama.health_checked" if status.ok else "provider.unavailable",
        actor_type="system",
        target_type="provider",
        target_id="ollama_local",
        payload={
            "ok": status.ok,
            "base_url": status.base_url,
            "model_count": len(status.models),
            "message": status.message,
        },
    )
    if status.ok:
        ledger.append(
            event_type="ollama.models_listed",
            actor_type="system",
            target_type="provider",
            target_id="ollama_local",
            payload={"model_count": len(status.models)},
        )
    return status


@app.get("/api/events/recent")
def recent_events(
    limit: int = 25,
    ledger: EventLedgerService = Depends(get_ledger),
) -> dict[str, object]:
    return {"events": ledger.recent(limit=limit)}


@app.get("/api/documents")
def list_documents(documents: DocumentService = Depends(get_documents)) -> dict[str, object]:
    return {"documents": documents.list()}


@app.post("/api/documents")
def create_document(
    request: DocumentCreateRequest,
    documents: DocumentService = Depends(get_documents),
    ledger: EventLedgerService = Depends(get_ledger),
) -> dict[str, object]:
    document = documents.create(title=request.title, content=request.content)
    ledger.append(
        event_type="document.created",
        actor_type="user",
        target_type="document",
        target_id=document.document_id,
        payload={"title": document.title},
    )
    return {"document": documents.to_dict(document)}


@app.get("/api/documents/{document_id}")
def get_document(
    document_id: str,
    documents: DocumentService = Depends(get_documents),
) -> dict[str, object]:
    document = documents.get(document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found.")
    return {"document": documents.to_dict(document)}


@app.put("/api/documents/{document_id}")
def update_document(
    document_id: str,
    request: DocumentUpdateRequest,
    documents: DocumentService = Depends(get_documents),
    ledger: EventLedgerService = Depends(get_ledger),
) -> dict[str, object]:
    document = documents.update(
        document_id=document_id,
        title=request.title,
        content=request.content,
    )
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found.")
    ledger.append(
        event_type="document.saved",
        actor_type="user",
        target_type="document",
        target_id=document.document_id,
        payload={"title": document.title},
    )
    return {"document": documents.to_dict(document)}


@app.post("/api/documents/{document_id}/exports")
def export_document(
    document_id: str,
    request: DocumentExportRequest,
    documents: DocumentService = Depends(get_documents),
    exports: ExportService = Depends(get_exports),
) -> dict[str, object]:
    document = documents.get(document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found.")
    try:
        result = exports.export_document(
            document=document,
            request=ExportRequest(
                format=request.format,
                profile=request.profile,
                document_type=request.document_type,
                include_sources=request.include_sources,
                include_lexicon=request.include_lexicon,
                include_prompts=request.include_prompts,
                include_ai_provenance=request.include_ai_provenance,
                include_media_metadata=request.include_media_metadata,
            ),
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {
        "export_id": result.export_id,
        "artifact": {
            "artifact_id": result.artifact.artifact_id,
            "filename": result.artifact.filename,
            "format": result.artifact.format,
            "content_type": result.artifact.content_type,
            "content": result.artifact.content,
            "content_chars": result.artifact.content_chars,
        },
        "manifest": result.manifest,
    }


@app.get("/api/documents/{document_id}/snapshots")
def list_document_snapshots(
    document_id: str,
    documents: DocumentService = Depends(get_documents),
    snapshots: SnapshotService = Depends(get_snapshots),
) -> dict[str, object]:
    document = documents.get(document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found.")
    return {"snapshots": snapshots.list_for_document(document_id)}


@app.post("/api/documents/{document_id}/snapshots")
def create_document_snapshot(
    document_id: str,
    request: DocumentSnapshotCreateRequest,
    documents: DocumentService = Depends(get_documents),
    snapshots: SnapshotService = Depends(get_snapshots),
    ledger: EventLedgerService = Depends(get_ledger),
) -> dict[str, object]:
    document = documents.get(document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found.")

    snapshot = snapshots.create(
        document_id=document_id,
        title=request.title,
        content=request.content,
        note=request.note,
    )
    ledger.append(
        event_type="snapshot.created",
        actor_type="user",
        target_type="document",
        target_id=document_id,
        payload={
            "snapshot_id": snapshot.snapshot_id,
            "title": snapshot.title,
            "note": snapshot.note,
            "content_chars": len(snapshot.content),
        },
    )
    return {"snapshot": snapshots.to_summary(snapshot)}


@app.get("/api/snapshots/{snapshot_id}")
def get_snapshot(
    snapshot_id: str,
    snapshots: SnapshotService = Depends(get_snapshots),
) -> dict[str, object]:
    snapshot = snapshots.get(snapshot_id)
    if snapshot is None:
        raise HTTPException(status_code=404, detail="Snapshot not found.")
    return {"snapshot": snapshots.to_dict(snapshot)}


@app.post("/api/snapshots/{snapshot_id}/restore-preview")
def preview_snapshot_restore(
    snapshot_id: str,
    snapshots: SnapshotService = Depends(get_snapshots),
    ledger: EventLedgerService = Depends(get_ledger),
) -> dict[str, object]:
    snapshot = snapshots.get(snapshot_id)
    if snapshot is None:
        raise HTTPException(status_code=404, detail="Snapshot not found.")

    event = ledger.append(
        event_type="snapshot.restore_previewed",
        actor_type="user",
        target_type="document",
        target_id=snapshot.document_id,
        payload={
            "snapshot_id": snapshot.snapshot_id,
            "title": snapshot.title,
            "note": snapshot.note,
            "content_chars": len(snapshot.content),
        },
    )
    return {"snapshot": snapshots.to_dict(snapshot), "event_id": event.event_id}


@app.post("/api/snapshots/{snapshot_id}/restore")
def restore_snapshot(
    snapshot_id: str,
    request: SnapshotRestoreRequest,
    documents: DocumentService = Depends(get_documents),
    snapshots: SnapshotService = Depends(get_snapshots),
    ledger: EventLedgerService = Depends(get_ledger),
) -> dict[str, object]:
    if request.confirmation != "RESTORE":
        raise HTTPException(status_code=400, detail="Restore confirmation must be RESTORE.")

    snapshot = snapshots.get(snapshot_id)
    if snapshot is None:
        raise HTTPException(status_code=404, detail="Snapshot not found.")

    document = documents.get(request.document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found.")

    if snapshot.document_id != request.document_id:
        raise HTTPException(status_code=400, detail="Snapshot does not belong to this document.")

    pre_restore_snapshot = snapshots.create(
        document_id=request.document_id,
        title=request.pre_restore_title,
        content=request.pre_restore_content,
        note=f"Pre-restore checkpoint before restoring {snapshot.note}",
    )
    ledger.append(
        event_type="snapshot.pre_restore_checkpoint_created",
        actor_type="system",
        target_type="document",
        target_id=request.document_id,
        payload={
            "snapshot_id": pre_restore_snapshot.snapshot_id,
            "document_id": request.document_id,
            "title": pre_restore_snapshot.title,
            "note": pre_restore_snapshot.note,
            "content_chars": len(pre_restore_snapshot.content),
        },
    )

    restored_document = documents.update(
        document_id=request.document_id,
        title=snapshot.title,
        content=snapshot.content,
    )
    if restored_document is None:
        raise HTTPException(status_code=500, detail="Document restore failed.")

    event = ledger.append(
        event_type="snapshot.restored",
        actor_type="user",
        target_type="document",
        target_id=request.document_id,
        payload={
            "snapshot_id": snapshot.snapshot_id,
            "pre_restore_snapshot_id": pre_restore_snapshot.snapshot_id,
            "document_id": request.document_id,
            "title": snapshot.title,
            "note": snapshot.note,
            "restored_content_chars": len(snapshot.content),
        },
    )

    return {
        "document": documents.to_dict(restored_document),
        "pre_restore_snapshot": snapshots.to_summary(pre_restore_snapshot),
        "event_id": event.event_id,
    }


@app.get("/api/sources")
def list_sources(
    q: str = "",
    sources: SourceLibraryService = Depends(get_sources),
) -> dict[str, object]:
    return {"sources": sources.search(q) if q else sources.list()}


@app.post("/api/sources")
def create_source(
    request: SourceCreateRequest,
    sources: SourceLibraryService = Depends(get_sources),
    ledger: EventLedgerService = Depends(get_ledger),
) -> dict[str, object]:
    source = sources.create(
        title=request.title,
        source_type=request.source_type,
        content=request.content,
    )
    ledger.append(
        event_type="source.imported",
        actor_type="user",
        target_type="source",
        target_id=source.source_id,
        payload={
            "title": source.title,
            "source_type": source.source_type,
            "word_count": len(source.content.split()),
        },
    )
    return {"source": sources.to_dict(source)}


@app.get("/api/sources/{source_id}")
def get_source(
    source_id: str,
    sources: SourceLibraryService = Depends(get_sources),
) -> dict[str, object]:
    source = sources.get(source_id)
    if source is None:
        raise HTTPException(status_code=404, detail="Source not found.")
    return {"source": sources.to_dict(source)}


@app.post("/api/source-references")
def record_source_reference_inserted(
    request: SourceReferenceInsertedRequest,
    documents: DocumentService = Depends(get_documents),
    sources: SourceLibraryService = Depends(get_sources),
    ledger: EventLedgerService = Depends(get_ledger),
) -> dict[str, object]:
    document = documents.get(request.document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found.")
    source = sources.get(request.source_id)
    if source is None:
        raise HTTPException(status_code=404, detail="Source not found.")

    event = ledger.append(
        event_type="source_reference.inserted",
        actor_type="user",
        target_type="document",
        target_id=request.document_id,
        payload={
            "source_id": request.source_id,
            "source_title": source.title,
            "label": request.label,
        },
    )
    return {"ok": True, "event_id": event.event_id}


@app.post("/api/section-prompts")
def record_section_prompt_created(
    request: SectionPromptCreatedRequest,
    documents: DocumentService = Depends(get_documents),
    ledger: EventLedgerService = Depends(get_ledger),
) -> dict[str, object]:
    document = documents.get(request.document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found.")

    event = ledger.append(
        event_type="section_prompt.created",
        actor_type="user",
        target_type="document",
        target_id=request.document_id,
        payload={
            "prompt_id": request.prompt_id,
            "label": request.label,
            "status": request.status,
            "active_heading": request.active_heading,
        },
    )
    return {"ok": True, "event_id": event.event_id}


@app.post("/api/ai/continue")
async def continue_with_ai(
    request: AIContinueRequest,
    settings: Settings = Depends(get_settings),
    documents: DocumentService = Depends(get_documents),
    ledger: EventLedgerService = Depends(get_ledger),
) -> dict[str, object]:
    document = documents.get(request.document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found.")

    ledger.append(
        event_type="ai.requested",
        actor_type="user",
        target_type="document",
        target_id=request.document_id,
        payload={
            "model": request.model,
            "action": "continue",
            "active_heading": request.active_heading,
            "context_chars": len(request.context_markdown),
        },
    )

    provider = OllamaProviderService(settings.ollama_base_url)
    result = await provider.generate(
        model=request.model,
        prompt=build_continue_prompt(request, document.title),
    )

    ledger.append(
        event_type="ai.completed" if result.ok else "ai.failed",
        actor_type="system",
        target_type="document",
        target_id=request.document_id,
        payload={
            "model": request.model,
            "action": "continue",
            "ok": result.ok,
            "message": result.message,
            "suggestion_chars": len(result.response),
        },
    )

    return {
        "ok": result.ok,
        "message": result.message,
        "model": result.model,
        "suggestion": result.response,
    }


@app.post("/api/ai/suggestion-inserted")
def record_ai_suggestion_inserted(
    request: AISuggestionInsertedRequest,
    documents: DocumentService = Depends(get_documents),
    ledger: EventLedgerService = Depends(get_ledger),
) -> dict[str, object]:
    document = documents.get(request.document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found.")

    event = ledger.append(
        event_type="ai_suggestion.inserted",
        actor_type="user",
        target_type="document",
        target_id=request.document_id,
        payload={
            "model": request.model,
            "suggestion_chars": request.suggestion_chars,
            "active_heading": request.active_heading,
        },
    )
    return {"ok": True, "event_id": event.event_id}
