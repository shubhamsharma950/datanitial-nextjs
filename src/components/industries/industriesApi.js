/**
 * industriesApi.js  —  components/industries/
 * Single cached fetch for the entire Industries page ACF data.
 * All three section components share this one call — WP is hit only once.
 *
 * WordPress Page ID: 15  (Industries page — slug: "industries")
 * ACF fields live directly under acf{} — no wrapper group.
 *
 * Verified ACF structure (from REST API):
 *
 *   ACF{}
 *   banner (Group)
 *     ├── title                     → Text
 *     └── discerption               → Text Area
 *     └── cta                       → link
 *     
 *     ├── section_one (Group)
 *     │     ├── badge_text          Text
 *     │     ├── title               Text
 *     │     ├── description         Text Area
 *     │     ├── image_one           Image  → full ACF image object { url, alt, … }
 *     │     ├── image_two           Image  → full ACF image object { url, alt, … }
 *     │     ├── stat_number         Text Area   e.g. "10M+"
 *     │     └── stat_description    Text Area
 *     │
 *     ├── section_two (Group)
 *     │     ├── badge_text          Text
 *     │     ├── title               Text
 *     │     ├── description         Text Area
 *     │     ├── side_image          Image  → full ACF image object
 *     │     └── items (Group)
 *     │           ├── custom      (Group) → { title, description, hover_image }
 *     │           ├── flexible    (Group) → { title, description, hover_image }
 *     │           └── integration (Group) → { title, description, hover_image }
 *     │
 *     └── section_three (Group)
 *           ├── badge_text, title, description
 *           ├── card1 (Group) → { title, description, image }
 *           ├── card2 (Group) → { title, description, image }
 *           ├── card3 (Group) → { title, description, image }
 *           └── card4 (Group) → { title, description, image }
 */

export const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

const PAGE_ID = 15;

/* ── Resolve any ACF image field → URL string ── */
export async function resolveImg(val) {
  if (!val) return "";
  if (typeof val === "object" && val.type === "media_library" && val.value)
    val = val.value;
  if (typeof val === "object" && val.url) return val.url;
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
  return typeof val === "string" ? val : "";
}

/* ── Module-level cache ── */
let _cache   = null;
let _promise = null;

export async function fetchIndustriesPage() {
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
      // ACF fields are flat under acf{} — no industries_page wrapper
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
