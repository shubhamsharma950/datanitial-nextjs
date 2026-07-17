/**
 * wpBase.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for the WordPress REST API base URL.
 *
 * In development (localhost), returns "/wp-json" so all requests go through
 * the Vite dev proxy, avoiding CORS issues entirely.
 *
 * In production (or when VITE_WP_REST_URL is set), returns the full URL.
 */

// const PROD_URL = "https://darkred-worm-224502.hostingersite.com/wp-json";
const PROD_URL = "https://mediumvioletred-cod-278845.hostingersite.com/wp-json";

export const WP_BASE =
  import.meta.env?.VITE_WP_REST_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "/wp-json"
    : PROD_URL);

export default WP_BASE;
