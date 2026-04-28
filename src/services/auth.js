/**
 * auth.js
 * Handles JWT authentication with WordPress.
 * Credentials are read from environment variables.
 *
 * Token is cached in sessionStorage so we only authenticate once per session.
 */

// Read from env — works in both Vite (import.meta.env) and Next.js (process.env)
const JWT_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.NEXT_PUBLIC_WP_JWT_URL) ||
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_WP_JWT_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json/jwt-auth/v1/token";

// Credentials: use env vars, fall back to dev defaults
const WP_USERNAME =
  (typeof process !== "undefined" && process.env?.WP_API_USERNAME) ||
  "react-frontend";

const WP_PASSWORD =
  (typeof process !== "undefined" && process.env?.WP_API_PASSWORD) ||
  "react-frontend";

const TOKEN_KEY = "wp_jwt_token";

/**
 * Returns a valid JWT token.
 * Fetches a new one if none is cached.
 */
export async function getToken() {
  // sessionStorage is browser-only — skip on server (Next.js SSR)
  if (typeof sessionStorage !== "undefined") {
    const cached = sessionStorage.getItem(TOKEN_KEY);
    if (cached) return cached;
  }

  const res = await fetch(JWT_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      username: WP_USERNAME,
      password: WP_PASSWORD,
    }),
  });

  if (!res.ok) throw new Error("JWT auth failed");

  const data = await res.json();

  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(TOKEN_KEY, data.token);
  }

  return data.token;
}

/**
 * Returns an Authorization header object with a fresh/cached token.
 */
export async function authHeaders() {
  const token = await getToken();
  return { Authorization: `Bearer ${token}` };
}
