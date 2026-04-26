from __future__ import annotations

import httpx
from pydantic import BaseModel


class OllamaModel(BaseModel):
    name: str
    size: int | None = None
    modified_at: str | None = None


class OllamaStatus(BaseModel):
    ok: bool
    base_url: str
    message: str
    models: list[OllamaModel] = []


class OllamaProviderService:
    """Local Ollama provider adapter.

    The frontend must never call Ollama directly. This service is the backend
    boundary for provider health and model discovery.
    """

    def __init__(self, base_url: str) -> None:
        self.base_url = base_url.rstrip("/")

    async def list_models(self) -> OllamaStatus:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                response.raise_for_status()
        except httpx.HTTPError as exc:
            return OllamaStatus(
                ok=False,
                base_url=self.base_url,
                message=f"Ollama is not reachable: {exc.__class__.__name__}",
                models=[],
            )

        data = response.json()
        models = [
            OllamaModel(
                name=item.get("name", "unknown"),
                size=item.get("size"),
                modified_at=item.get("modified_at"),
            )
            for item in data.get("models", [])
        ]
        return OllamaStatus(
            ok=True,
            base_url=self.base_url,
            message="Ollama is reachable.",
            models=models,
        )
