import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { RefreshCw, Server, Sparkles } from "lucide-react";
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

const API_BASE = "http://127.0.0.1:8000";

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [ollama, setOllama] = useState<OllamaStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshStatus() {
    setLoading(true);
    setError(null);
    try {
      const [healthResponse, ollamaResponse] = await Promise.all([
        fetch(`${API_BASE}/api/health`),
        fetch(`${API_BASE}/api/providers/ollama`),
      ]);
      if (!healthResponse.ok) throw new Error("Backend health check failed.");
      if (!ollamaResponse.ok) throw new Error("Ollama provider check failed.");
      setHealth(await healthResponse.json());
      setOllama(await ollamaResponse.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown status error.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshStatus();
  }, []);

  return (
    <main className="shell">
      <section className="hero">
        <div className="eyebrow"><Sparkles size={18} /> xi-io compliant writing runtime</div>
        <h1>screen_scraper</h1>
        <p>
          A local-first cooperative writing workspace is taking shape. This first slice proves the
          backend, frontend, Ollama provider boundary, and event-ledger path before the editor lands.
        </p>
      </section>

      <section className="grid">
        <article className="card">
          <div className="cardHeader">
            <Server size={20} />
            <h2>Backend health</h2>
          </div>
          {health ? (
            <dl>
              <dt>App</dt>
              <dd>{health.app_name}</dd>
              <dt>Environment</dt>
              <dd>{health.environment}</dd>
              <dt>Status</dt>
              <dd>{health.ok === "true" ? "Online" : "Unknown"}</dd>
            </dl>
          ) : (
            <p className="muted">Waiting for backend status…</p>
          )}
        </article>

        <article className="card">
          <div className="cardHeader">
            <Sparkles size={20} />
            <h2>Ollama local AI</h2>
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
        </article>
      </section>

      {error && <p className="error">{error}</p>}

      <button className="button" type="button" onClick={() => void refreshStatus()} disabled={loading}>
        <RefreshCw size={18} />
        {loading ? "Checking…" : "Refresh status"}
      </button>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
