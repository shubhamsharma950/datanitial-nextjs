/**
 * aboutApi.js  —  components/about/
 * Single cached fetch for the entire About Us page ACF data.
 * All section components share this one call — WP is hit only once.
 *
 * Returns the full acf object from page ID 10.
 * Real top-level ACF keys:
 *   about_page        → { banner_title, banner_discerption }
 *   about_section     → Section 1
 *   counter_section   → Section 2  { content_: { left_heading, left_description,
 *                                      center_image, right_description, quote_text, button },
 *                                    counter_sec: { years_of_experience, projects_delivered,
 *                                      satisfied_clients, team_members } }
 *   about_three_section → Section 3
 *   about_four_section  → Section 4
 *   about_five_section  → Section 5
 */

export const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

/* ── Resolve any ACF image field → URL string ── */
export async function resolveImg(val) {
  if (!val) return "";
  if (typeof val === "object" && val.type === "media_library" && val.value)
    val = val.value;
  if (typeof val === "object" && val.url) return val.url;
  if (typeof val === "number" || (typeof val === "string" && /^\d+$/.test(val))) {
    try {
      const r = await fetch(`${WP_BASE}/wp/v2/media/${val}?_fields=source_url`);
      const d = await r.json();
      return d.source_url || "";
    } catch { return ""; }
  }
  return typeof val === "string" ? val : "";
}

/* ── Module-level cache ── */
let _cache   = null;
let _promise = null;

export async function fetchAboutPage() {
  if (_cache)   return _cache;
  if (_promise) return _promise;

  _promise = fetch(`${WP_BASE}/wp/v2/pages/10?_fields=acf`)
    .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then((json) => { _cache = json?.acf ?? {}; _promise = null; return _cache; })
    .catch((err) => { _promise = null; throw err; });

  return _promise;
}
