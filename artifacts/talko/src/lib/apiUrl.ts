/**
 * Returns the absolute URL for an API endpoint.
 *
 * - On Render (or any env where VITE_API_URL is set at build time):
 *   prefixes with the API server's full origin, e.g.
 *   "https://talko-api.onrender.com/api/upload-image"
 *
 * - On Replit / local dev (VITE_API_URL not set):
 *   uses a relative URL so the shared proxy routes /api/* correctly,
 *   e.g. "/api/upload-image"
 */
export function apiUrl(path: string): string {
  const apiBase: string = import.meta.env.VITE_API_URL ?? "";
  const normalPath = path.startsWith("/") ? path : `/${path}`;

  if (apiBase) {
    return `${apiBase.replace(/\/$/, "")}${normalPath}`;
  }

  // Relative — works through Replit's shared proxy or a local reverse-proxy
  return `${import.meta.env.BASE_URL}${normalPath.replace(/^\//, "")}`;
}
