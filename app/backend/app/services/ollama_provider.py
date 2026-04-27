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


class OllamaGenerationResult(BaseModel):
    ok: bool
    base_url: str
    model: str
    message: str
    response: str = ""


class OllamaProviderService:
    """Local Ollama provider adapter.

    The frontend must never call Ollama directly. This service is the backend
    boundary for provider health, model discovery, and local text generation.
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

    async def generate(self, *, model: str, prompt: str) -> OllamaGenerationResult:
        """Generate text with Ollama through the backend boundary.

        This returns text only. Document mutation is intentionally handled by the
        frontend/editor review path later, not by this provider service.
        """

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json={"model": model, "prompt": prompt, "stream": False},
                )
                response.raise_for_status()
        except httpx.HTTPError as exc:
            return OllamaGenerationResult(
                ok=False,
                base_url=self.base_url,
                model=model,
                message=f"Ollama generation failed: {exc.__class__.__name__}",
                response="",
            )

        data = response.json()
        return OllamaGenerationResult(
            ok=True,
            base_url=self.base_url,
            model=model,
            message="Ollama generation completed.",
            response=data.get("response", ""),
        )
