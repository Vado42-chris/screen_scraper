from __future__ import annotations

import html
import json
import re
import uuid
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from typing import Any, Protocol

from app.services.document_service import DocumentRecord
from app.services.event_ledger import EventLedgerService


SUPPORTED_FORMATS = {"md", "json"}
DEFAULT_PRODUCT_ID = "screen_scraper"
DEFAULT_ADAPTER_VERSION = "v1"


@dataclass(frozen=True)
class ExportRequest:
    format: str
    profile: str = "Draft Review"
    document_type: str = "article"
    include_sources: bool = True
    include_lexicon: bool = False
    include_prompts: bool = True
    include_ai_provenance: bool = False
    include_media_metadata: bool = True


@dataclass(frozen=True)
class DocumentEgressPackage:
    export_id: str
    product_id: str
    project_id: str
    document_id: str
    artifact_title: str
    document_type: str
    html_body: str
    markdown_body: str
    plain_text_body: str
    created_at: str
    profile: str
    format: str
    adapter_version: str
    source_reference_count: int
    lexicon_term_count: int
    media_item_count: int
    warning_count: int
    warnings: list[str]


@dataclass(frozen=True)
class ExportArtifact:
    artifact_id: str
    export_id: str
    filename: str
    format: str
    content: str
    content_type: str
    content_chars: int


@dataclass(frozen=True)
class ExportResult:
    export_id: str
    artifact: ExportArtifact
    manifest: dict[str, Any]


class ExportAdapter(Protocol):
    format: str

    def export(self, package: DocumentEgressPackage) -> ExportArtifact:
        ...


def html_to_plain_text(content: str) -> str:
    text = re.sub(r"<br\s*/?>", "\n", content, flags=re.IGNORECASE)
    text = re.sub(r"</p>", "\n\n", text, flags=re.IGNORECASE)
    text = re.sub(r"</h[1-6]>", "\n\n", text, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", "", text)
    return html.unescape(text).strip()


def html_to_markdown(content: str) -> str:
    markdown = content
    for level in range(6, 0, -1):
        markdown = re.sub(
            rf"<h{level}[^>]*>(.*?)</h{level}>",
            lambda match, heading_level=level: f"{'#' * heading_level} {html_to_plain_text(match.group(1))}\n\n",
            markdown,
            flags=re.IGNORECASE | re.DOTALL,
        )
    markdown = re.sub(
        r"<blockquote[^>]*>(.*?)</blockquote>",
        lambda match: "> " + html_to_plain_text(match.group(1)).replace("\n", "\n> ") + "\n\n",
        markdown,
        flags=re.IGNORECASE | re.DOTALL,
    )
    markdown = re.sub(r"<strong[^>]*>(.*?)</strong>", r"**\1**", markdown, flags=re.IGNORECASE | re.DOTALL)
    markdown = re.sub(r"<b[^>]*>(.*?)</b>", r"**\1**", markdown, flags=re.IGNORECASE | re.DOTALL)
    markdown = re.sub(r"<em[^>]*>(.*?)</em>", r"*\1*", markdown, flags=re.IGNORECASE | re.DOTALL)
    markdown = re.sub(r"<i[^>]*>(.*?)</i>", r"*\1*", markdown, flags=re.IGNORECASE | re.DOTALL)
    markdown = re.sub(
        r"<p[^>]*>(.*?)</p>",
        lambda match: html_to_plain_text(match.group(1)) + "\n\n",
        markdown,
        flags=re.IGNORECASE | re.DOTALL,
    )
    markdown = html_to_plain_text(markdown)
    markdown = re.sub(r"\n{3,}", "\n\n", markdown)
    return markdown.strip() + "\n"


def safe_slug(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip().lower()).strip("-")
    return slug or "untitled-document"


class ExportPackageBuilder:
    def build(self, *, document: DocumentRecord, request: ExportRequest) -> DocumentEgressPackage:
        export_id = str(uuid.uuid4())
        markdown_body = html_to_markdown(document.content)
        plain_text_body = html_to_plain_text(document.content)
        warnings: list[str] = []
        return DocumentEgressPackage(
            export_id=export_id,
            product_id=DEFAULT_PRODUCT_ID,
            project_id=document.document_id,
            document_id=document.document_id,
            artifact_title=document.title,
            document_type=request.document_type,
            html_body=document.content,
            markdown_body=markdown_body,
            plain_text_body=plain_text_body,
            created_at=datetime.now(UTC).isoformat(),
            profile=request.profile,
            format=request.format,
            adapter_version=DEFAULT_ADAPTER_VERSION,
            source_reference_count=0,
            lexicon_term_count=0,
            media_item_count=0,
            warning_count=len(warnings),
            warnings=warnings,
        )


class MarkdownExportAdapter:
    format = "md"

    def export(self, package: DocumentEgressPackage) -> ExportArtifact:
        filename = f"{safe_slug(package.artifact_title)}.md"
        return ExportArtifact(
            artifact_id=str(uuid.uuid4()),
            export_id=package.export_id,
            filename=filename,
            format=self.format,
            content=package.markdown_body,
            content_type="text/markdown; charset=utf-8",
            content_chars=len(package.markdown_body),
        )


class JsonExportAdapter:
    format = "json"

    def export(self, package: DocumentEgressPackage) -> ExportArtifact:
        filename = f"{safe_slug(package.artifact_title)}.json"
        content = json.dumps(asdict(package), indent=2, sort_keys=True)
        return ExportArtifact(
            artifact_id=str(uuid.uuid4()),
            export_id=package.export_id,
            filename=filename,
            format=self.format,
            content=content,
            content_type="application/json; charset=utf-8",
            content_chars=len(content),
        )


class ExportService:
    def __init__(self, ledger: EventLedgerService) -> None:
        self.ledger = ledger
        self.builder = ExportPackageBuilder()
        self.adapters: dict[str, ExportAdapter] = {
            "md": MarkdownExportAdapter(),
            "json": JsonExportAdapter(),
        }

    def export_document(self, *, document: DocumentRecord, request: ExportRequest) -> ExportResult:
        requested_format = request.format.lower().strip()
        normalized_request = ExportRequest(
            format=requested_format,
            profile=request.profile,
            document_type=request.document_type,
            include_sources=request.include_sources,
            include_lexicon=request.include_lexicon,
            include_prompts=request.include_prompts,
            include_ai_provenance=request.include_ai_provenance,
            include_media_metadata=request.include_media_metadata,
        )
        if requested_format not in SUPPORTED_FORMATS:
            self.ledger.append(
                event_type="export.failed",
                actor_type="user",
                target_type="document",
                target_id=document.document_id,
                payload={
                    "product_id": DEFAULT_PRODUCT_ID,
                    "document_id": document.document_id,
                    "format": requested_format,
                    "profile": request.profile,
                    "adapter_version": DEFAULT_ADAPTER_VERSION,
                    "ok": False,
                    "message": "Unsupported export format.",
                    "blocked_reason": "unsupported_export_format",
                },
            )
            raise ValueError(f"Unsupported export format: {requested_format}")

        package = self.builder.build(document=document, request=normalized_request)
        self.ledger.append(
            event_type="export.requested",
            actor_type="user",
            target_type="document",
            target_id=document.document_id,
            payload={
                "export_id": package.export_id,
                "product_id": package.product_id,
                "project_id": package.project_id,
                "document_id": package.document_id,
                "document_type": package.document_type,
                "format": package.format,
                "profile": package.profile,
                "adapter_version": package.adapter_version,
                "warning_count": package.warning_count,
            },
        )

        try:
            artifact = self.adapters[requested_format].export(package)
            manifest = self._build_manifest(package=package, artifact=artifact)
        except Exception as exc:
            self.ledger.append(
                event_type="export.failed",
                actor_type="system",
                target_type="document",
                target_id=document.document_id,
                payload={
                    "export_id": package.export_id,
                    "product_id": package.product_id,
                    "project_id": package.project_id,
                    "document_id": package.document_id,
                    "document_type": package.document_type,
                    "format": package.format,
                    "profile": package.profile,
                    "adapter_version": package.adapter_version,
                    "ok": False,
                    "message": str(exc),
                },
            )
            raise

        self.ledger.append(
            event_type="export.completed",
            actor_type="system",
            target_type="document",
            target_id=document.document_id,
            payload={
                "export_id": package.export_id,
                "product_id": package.product_id,
                "project_id": package.project_id,
                "document_id": package.document_id,
                "artifact_id": artifact.artifact_id,
                "document_type": package.document_type,
                "format": artifact.format,
                "profile": package.profile,
                "adapter_version": package.adapter_version,
                "artifact_count": 1,
                "content_chars": artifact.content_chars,
                "source_reference_count": package.source_reference_count,
                "lexicon_term_count": package.lexicon_term_count,
                "media_item_count": package.media_item_count,
                "ok": True,
                "message": "Export completed.",
                "warning_count": package.warning_count,
            },
        )

        return ExportResult(export_id=package.export_id, artifact=artifact, manifest=manifest)

    def _build_manifest(self, *, package: DocumentEgressPackage, artifact: ExportArtifact) -> dict[str, Any]:
        return {
            "manifest_version": 1,
            "export_id": package.export_id,
            "product_id": package.product_id,
            "project_id": package.project_id,
            "source_product": DEFAULT_PRODUCT_ID,
            "created_at": package.created_at,
            "export_profile": package.profile,
            "format": artifact.format,
            "adapter_version": package.adapter_version,
            "artifact_count": 1,
            "document_type": package.document_type,
            "source_reference_count": package.source_reference_count,
            "lexicon_term_count": package.lexicon_term_count,
            "media_item_count": package.media_item_count,
            "warning_count": package.warning_count,
            "warnings": package.warnings,
        }
