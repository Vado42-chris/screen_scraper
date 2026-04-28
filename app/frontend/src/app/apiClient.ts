export const API_BASE = "http://127.0.0.1:8000";

export async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const fallbackMessage = `Request failed: ${response.status}`;
    try {
      const body = await response.text();
      throw new Error(body || fallbackMessage);
    } catch (error) {
      if (error instanceof Error && error.message !== fallbackMessage) {
        throw error;
      }
      throw new Error(fallbackMessage);
    }
  }
  return response.json() as Promise<T>;
}

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
