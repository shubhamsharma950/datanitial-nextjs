/**
 * industriesDetailApi.js  —  components/industries-detail/
 * Single cached fetch for the entire Industries Detail page ACF data.
 * All section components share this one call — WP is hit only once.
 *
 * WordPress Page ID: 1191  (Industries Detail page)
 * ACF fields live directly under acf{} — no wrapper group.
 *
 * Verified ACF structure (from WordPress ACF editor):
 *
 *   acf{}
 *   └── section_one (Group)
 *         ├── title           Text
 *         ├── description     Text Area
 *         ├── image           Image  → full ACF image object { url, alt, … }
 *         └── image_box (Group)
 *               ├── card1 (Group) → { img, title, description }
 *               ├── card2 (Group) → { img, title, description }
 *               ├── card3 (Group) → { img, title, description }
 *               └── card4 (Group) → { img, title, description }
 */

export const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

const PAGE_ID = 1191;

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

/* ── Module-level cache ── */
let _cache   = null;
let _promise = null;

export async function fetchIndustriesDetailPage() {
  if (_cache)   return _cache;
  if (_promise) return _promise;

  _promise = fetch(
    `${WP_BASE}/wp/v2/pages/${PAGE_ID}?_fields=acf`
  )
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((json) => {
      // ACF fields are flat under acf{} — no wrapper group
      _cache   = json?.acf ?? {};
      _promise = null;
      return _cache;
    })
    .catch((err) => {
      _promise = null;
      throw err;
    });

  return _promise;
}
