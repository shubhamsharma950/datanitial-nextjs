/**
 * auth.js
 * Handles JWT authentication with WordPress.
 * Credentials: username "react-frontend", password "react-frontend"
 *
 * Token is cached in sessionStorage so we only authenticate once per session.
 */

const BASE_URL  = "http://localhost/wordpress/wp-json";
const TOKEN_KEY = "wp_jwt_token";

/**
 * Returns a valid JWT token.
 * Fetches a new one if none is cached.
 */
export async function getToken() {
  const cached = sessionStorage.getItem(TOKEN_KEY);
  if (cached) return cached;

  const res = await fetch(`${BASE_URL}/jwt-auth/v1/token`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      username: "react-frontend",
      password: "react-frontend",
    }),
  });

  if (!res.ok) throw new Error("JWT auth failed");

  const data = await res.json();
  sessionStorage.setItem(TOKEN_KEY, data.token);
  return data.token;
}

/**
 * Returns an Authorization header object with a fresh/cached token.
 */
export async function authHeaders() {
  const token = await getToken();
  return { Authorization: `Bearer ${token}` };
}
