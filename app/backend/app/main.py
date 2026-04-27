from __future__ import annotations

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.config import Settings, get_settings
from app.services.document_service import DocumentService
from app.services.event_ledger import EventLedgerService
from app.services.ollama_provider import OllamaProviderService, OllamaStatus

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


def get_ledger(settings: Settings = Depends(get_settings)) -> EventLedgerService:
    return EventLedgerService(settings.sqlite_path)


def get_documents(settings: Settings = Depends(get_settings)) -> DocumentService:
    return DocumentService(settings.sqlite_path)


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
