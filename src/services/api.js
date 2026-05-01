/**
 * api.js
 * All WordPress REST API calls.
 *
 * Menu endpoints use the "WP REST API Menus" plugin:
 *   /menus/v1/menus          – list all menus
 *   /menus/v1/menus/{slug}   – items for a specific menu  → res.data.items[]
 *   /menus/v1/locations      – all locations
 *   /menus/v1/locations/{slug} – menu assigned to a location
 * These are all PUBLIC (no auth needed).
 * Settings / media still need JWT for write, but read is opened via functions.php.
 */

import axios from "axios";

// ── Read from environment variables ──
// Vite exposes only VITE_* prefixed vars via import.meta.env.
// In dev, requests go through the Vite proxy (/wp-json → WordPress)
// so BASE_URL can be relative. In production, use the full URL.
const BASE_URL =
  import.meta.env?.VITE_WP_REST_URL ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

const api = axios.create({ baseURL: BASE_URL });

/* ── No JWT interceptor — all our custom endpoints are PUBLIC ──
   JWT was causing 403 errors on Hostinger. Remove it entirely.
   If you need auth for specific endpoints, add it per-call.    ── */

/* ═══════════════════════════════════════════════════════════
   HEADER
═══════════════════════════════════════════════════════════ */

/**
 * Fetch all header data in one call from our custom endpoint.
 * GET /theme/v1/site-info  (public, no auth needed)
 * Returns: { site_name, tagline, home_url, logo_url, logo_alt, get_quote: { label, url } }
 */
export async function getSiteInfo() {
  try {
    const res = await axios.get(`${BASE_URL}/theme/v1/site-info`);
    return res.data;
  } catch {
    return {
      site_name: "Datanitial",
      tagline:   "",
      home_url:  "/",
      logo_url:  "",
      logo_alt:  "Datanitial",
      get_quote: { label: "Get Quote", url: "/get-quote" },
    };
  }
}

// Keep these as named aliases so existing imports don't break
export async function getSiteLogo() {
  const info = await getSiteInfo();
  return info.logo_url ? { url: info.logo_url, alt: info.logo_alt } : null;
}

export async function getSiteName() {
  const info = await getSiteInfo();
  return info.site_name || "Datanitial";
}

/**
 * Fetch header menu items via the WP REST API Menus plugin.
 * Tries the "primary" location first, falls back to slug "header-menu".
 * Returns normalised array: { id, title, url, target }
 */
export async function getHeaderMenuItems() {
  // Try location "primary" first
  try {
    const locRes = await api.get("/menus/v1/locations/primary");
    const slug   = locRes.data?.slug;
    if (slug) {
      const menuRes = await api.get(`/menus/v1/menus/${slug}`);
      return normaliseMenuItems(menuRes.data?.items ?? []);
    }
  } catch { /* fall through */ }

  // Fallback: fetch by known slug
  const menuRes = await api.get("/menus/v1/menus/header-menu");
  return normaliseMenuItems(menuRes.data?.items ?? []);
}

/* ═══════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════ */

/**
 * Fetch site identity (name, description) for the footer.
 * Uses the same /theme/v1/site-info endpoint — no duplicate needed.
 */
export const getFooterSiteInfo = () =>
  axios.get(`${BASE_URL}/theme/v1/site-info`).catch(() => null);

/**
 * Custom footer options endpoint (register in your WP theme).
 * Falls back gracefully if not available.
 */
export const getFooterOptions = () =>
  api.get("/theme/v1/footer").catch(() => null);

/**
 * Fetch footer menu items by menu slug via the WP REST API Menus plugin.
 * @param {string} slug  e.g. "footer-industries" | "footer-solutions"
 * Returns normalised array: { ID, title, url }
 */
export async function getFooterMenuItems(slug) {
  try {
    const res = await api.get(`/menus/v1/menus/${slug}`);
    return (res.data?.items ?? []).map((item) => ({
      ID:    item.ID,
      title: item.title,
      url:   item.url ?? "#",
    }));
  } catch {
    return []; // menu doesn't exist yet — return empty silently
  }
}

/* ═══════════════════════════════════════════════════════════
   HOMEPAGE
═══════════════════════════════════════════════════════════ */

/** Custom homepage data endpoint (register in your WP theme). */
export const getHomePage = () =>
  api.get("/theme/v1/homepage").catch(() => null);

/** Fetch a WP page by slug. */
export const getPageBySlug = (slug) =>
  api.get("/wp/v2/pages", {
    params: { slug, _fields: "id,title,content,acf,featured_media" },
  });

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */

/**
 * Normalise WP REST Menus plugin items to a consistent shape.
 * Plugin returns: { ID, title, url, target, ... }
 */
function normaliseMenuItems(items) {
  return items
    .sort((a, b) => (a.menu_order ?? 0) - (b.menu_order ?? 0))
    .map((item) => ({
      id:     item.ID,
      title:  item.title  ?? "",
      url:    item.url    ?? "#",
      target: item.target === "_blank" ? "_blank" : "_self",
    }));
}
