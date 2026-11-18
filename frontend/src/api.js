// Backend address. Set VITE_API_URL in Vercel (production) or frontend/.env (local).
export const API_URL = (import.meta.env.VITE_API_URL || export const API_URL = (import.meta.env.VITE_API_URL || "https://pawscan-ai-bltr.onrender.com").replace(/\/+$/, "");

export async function checkHealth() {
  const res = await fetch(`${API_URL}/health`);
  if (!res.ok) throw new Error(`Health check failed (${res.status})`);
  return res.json();
}
export async function predictImage(file) {
  const form = new FormData();
  form.append("file", file);

  // Render's free plan can take ~1 minute to wake up, so allow a long timeout.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120000);
  try {
    const res = await fetch(`${API_URL}/predict`, { method: "POST", body: form, signal: controller.signal });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || `Server error (${res.status})`);
    return data;
  } catch (err) {
    if (err.name === "AbortError") throw new Error("The server took too long to respond. Please try again.");
    if (err instanceof TypeError) throw new Error("Cannot reach the backend. Check that it is running and the API URL is correct.");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
