/**
 * industriesDetailApi.js  —  components/industries-detail/
 *
 * Provides per-page-ID cached fetchers for the Industries Detail sections.
 * Each page ID gets its own cache entry so all section components on the
 * same page share a single WP request, while different industry pages
 * (Real Estate, Food Delivery, etc.) each fetch their own data.
 *
 * Usage:
 *   import { getIndustriesDetailFetcher, resolveImg } from "./industriesDetailApi";
 *   const fetchPage = getIndustriesDetailFetcher(pageId);
 *   const acf = await fetchPage();
 *
 * Legacy default export kept for backward compatibility:
 *   import { fetchIndustriesDetailPage } from "./industriesDetailApi";
 *   // → uses PAGE_ID 1191
 */

export const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

const DEFAULT_PAGE_ID = 1191;

/* ── Resolve any ACF image field → URL string ──
   Handles all ACF return formats:
   1. Full image object  { url: "...", ID, ... }  → use .url directly
   2. Numeric media ID   1197                     → fetch /wp/v2/media/:id
   3. String media ID    "1197"                   → fetch /wp/v2/media/:id
   4. media_library obj  { type:"media_library", value:"1197" }
   5. Plain URL string   "https://..."            → return as-is
── */
export async function resolveImg(val) {
  if (!val) return "";

  // Case 4: media_library wrapper
  if (typeof val === "object" && val.type === "media_library" && val.value)
    val = val.value;

  // Case 1: full ACF image object — has .url property
  if (typeof val === "object" && val.url) return val.url;

  // Case 2 & 3: numeric ID (number or numeric string)
  if (
    typeof val === "number" ||
    (typeof val === "string" && /^\d+$/.test(val))
  ) {
    try {
      const r = await fetch(
        `${WP_BASE}/wp/v2/media/${val}?_fields=source_url`
      );
      const d = await r.json();
      return d.source_url || "";
    } catch {
      return "";
    }
  }

  // Case 5: plain URL string
  return typeof val === "string" ? val : "";
}

/* ── Per-page-ID cache map ── */
const _caches   = new Map(); // pageId → acf data
const _promises = new Map(); // pageId → in-flight promise

/**
 * Returns a fetcher function bound to the given pageId.
 * Multiple calls with the same pageId return the same cached fetcher.
 */
export function getIndustriesDetailFetcher(pageId = DEFAULT_PAGE_ID) {
  return async function fetchPage() {
    if (_caches.has(pageId)) return _caches.get(pageId);
    if (_promises.has(pageId)) return _promises.get(pageId);

    const promise = fetch(
      `${WP_BASE}/wp/v2/pages/${pageId}?_fields=acf`
    )
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        const data = json?.acf ?? {};
        _caches.set(pageId, data);
        _promises.delete(pageId);
        return data;
      })
      .catch((err) => {
        _promises.delete(pageId);
        throw err;
      });

    _promises.set(pageId, promise);
    return promise;
  };
}

/* ── Legacy default fetcher (page 1191) — keeps existing imports working ── */
const _legacyFetch = getIndustriesDetailFetcher(DEFAULT_PAGE_ID);
export async function fetchIndustriesDetailPage() {
  return _legacyFetch();
}
