/**
 * solutionsApi.js  —  components/solutions/
 * ─────────────────────────────────────────────────────────────────────────────
 * Single cached fetch for the entire Solutions page ACF data (Page ID: 13).
 * All section components share this one HTTP call — WP is hit only once.
 *
 * REAL ACF structure (verified from REST API response):
 *
 *  acf
 *   ├── banner
 *   │     ├── title          Text
 *   │     ├── discerption    Text Area
 *   │     └── cta            Link  { title, url, target }
 *   │
 *   ├── section_one
 *   │     ├── badge_text     Text
 *   │     ├── title          Text
 *   │     └── description    Text Area
 *   │
 *   ├── card1                ← top-level ACF group (NOT nested under section_one)
 *   │     ├── card_title        Text
 *   │     ├── card_description  Text Area
 *   │     ├── card_image        Image object { url } OR numeric media ID
 *   │     └── card_tags         Text Area  (newline-separated tags)
 *   │
 *   ├── card                 ← card2 is named "card" in WP
 *   │     └── (same fields as card1)
 *   │
 *   ├── card3
 *   │     └── (same fields as card1)
 *   │
 *   ├── section_two          (to be added in WP — optional)
 *   │     ├── title
 *   │     ├── description
 *   │     ├── image
 *   │     └── bullet_points  Repeater → { point_text }
 *   │
 *   └── section_three        (to be added in WP — optional)
 *         ├── badge_text
 *         ├── title
 *         ├── description
 *         └── workflow_cards Repeater → { card_icon, card_title, card_description }
 */

export const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

/* ─────────────────────────────────────────────────────────────────────────
   resolveImg — converts any ACF image value → plain URL string
   Handles:
     • ACF image object  { url: "https://..." }
     • Numeric media ID  716  or  "716"
     • ACF icon-picker   { type: "media_library", value: "123" }
     • Raw URL string    "https://..."
───────────────────────────────────────────────────────────────────────── */
export async function resolveImg(val) {
  if (!val) return "";

  // ACF icon-picker: { type: "media_library", value: "123" }
  if (typeof val === "object" && val.type === "media_library" && val.value)
    val = val.value;

  // ACF image object with url key
  if (typeof val === "object" && val.url) return val.url;

  // Numeric media ID — look up source_url via REST
  if (
    typeof val === "number" ||
    (typeof val === "string" && /^\d+$/.test(String(val)))
  ) {
    try {
      const r = await fetch(`${WP_BASE}/wp/v2/media/${val}?_fields=source_url`);
      const d = await r.json();
      return d.source_url || "";
    } catch {
      return "";
    }
  }

  return typeof val === "string" ? val : "";
}

/* ─────────────────────────────────────────────────────────────────────────
   parseTags — converts a newline/comma-separated tag string → string[]
───────────────────────────────────────────────────────────────────────── */
function parseTags(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((t) => (typeof t === "object" ? t.tag_text || "" : String(t))).filter(Boolean);
  }
  // newline or comma separated string
  return String(raw)
    .split(/[\r\n,]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/* ─────────────────────────────────────────────────────────────────────────
   Module-level cache — one fetch shared across all section components
───────────────────────────────────────────────────────────────────────── */
let _cache   = null;
let _promise = null;

/**
 * fetchSolutionsPage()
 * Returns the full ACF object for page 13.
 * Subsequent calls return the cached value immediately.
 */
export async function fetchSolutionsPage() {
  if (_cache)   return _cache;
  if (_promise) return _promise;

  _promise = fetch(`${WP_BASE}/wp/v2/pages/13?_fields=acf`)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((json) => {
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

/* ─────────────────────────────────────────────────────────────────────────
   getSectionOne()
   Returns: {
     badge_text, title, description,
     cards: [{ card_title, card_description, card_image, card_tags[] }]
   }

   Cards live at acf.card1, acf.card (= card2), acf.card3 — top-level.
───────────────────────────────────────────────────────────────────────── */
export async function getSectionOne() {
  const acf = await fetchSolutionsPage();

  // Section header
  const sec = acf?.section_one ?? {};

  // The three card groups — card2 is stored as "card" in WP
  const rawCards = [
    acf?.card1 ?? null,
    acf?.card   ?? null,   // card2
    acf?.card3  ?? null,
  ].filter(Boolean);

  if (!sec.title && rawCards.length === 0) return null;

  const cards = await Promise.all(
    rawCards.map(async (c) => ({
      card_title:       c.card_title       || "",
      card_description: c.card_description || "",
      card_image:       await resolveImg(c.card_image),
      card_tags:        parseTags(c.card_tags),
    }))
  );

  return {
    badge_text:  sec.badge_text  || "",
    title:       sec.title       || "",
    description: sec.description || "",
    cards,
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   getSectionTwo()
   ACF path: acf.section_two (Group)
     ├── title              Text
     ├── description        Text Area
     ├── bullet_point_list  Text Area  (newline-separated lines → string[])
     └── image              Image object { url } OR numeric media ID

   Returns: { title, description, bullet_points[], image }
   Returns null gracefully if section_two not yet set in WP.
───────────────────────────────────────────────────────────────────────── */
export async function getSectionTwo() {
  const acf = await fetchSolutionsPage();
  const raw = acf?.section_two ?? null;
  if (!raw) return null;

  // bullet_point_list is a Text Area — split on newlines, drop empty lines
  const bullet_points = String(raw.bullet_point_list || "")
    .split(/[\r\n]+/)
    .map((l) => l.trim())
    .filter(Boolean);

  return {
    title:         raw.title       || "",
    description:   raw.description || "",
    bullet_points,
    image:         await resolveImg(raw.image),
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   getSectionThree()
   ACF path: acf.section_three (Group)
     ├── badge        Text   ← field is named "badge", not "badge_text"
     ├── title        Text
     ├── description  Text Area
     ├── card1 (Group)
     │     ├── card_title        Text
     │     ├── card_description  Text Area
     │     └── card_image        Image object { url } OR numeric media ID
     ├── card2  — same fields as card1
     └── card3  — same fields as card1

   Returns: { badge_text, title, description, cards[] }
   cards[]: { card_title, card_description, card_image (url string) }
───────────────────────────────────────────────────────────────────────── */
export async function getSectionThree() {
  const acf = await fetchSolutionsPage();
  const raw = acf?.section_three ?? null;
  if (!raw) return null;

  // Cards are nested inside section_three as card1, card2, card3
  const rawCards = [
    raw.card1 ?? null,
    raw.card2 ?? null,
    raw.card3 ?? null,
  ].filter(Boolean);

  const cards = await Promise.all(
    rawCards.map(async (c) => ({
      card_title:       c.card_title       || "",
      card_description: c.card_description || "",
      card_image:       await resolveImg(c.card_image),
    }))
  );

  return {
    badge_text:  raw.badge       || "",   // WP field is "badge", exposed as badge_text
    title:       raw.title       || "",
    description: raw.description || "",
    cards,
  };
}
