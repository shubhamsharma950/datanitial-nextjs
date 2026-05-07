/**
 * solutionsDetailApi.js  —  components/solution-detail/
 * ─────────────────────────────────────────────────────────────────────────────
 * Single cached fetch for the Solution Detail page ACF data (Page ID: 919).
 * All section components share this one HTTP call — WP is hit only once.
 *
 * ACF structure (Page ID: 919):
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
 *   ├── section_problems  (Group)
 *   │     ├── title                  Text
 *   │     ├── description            Text Area
 *   │     ├── badge                  Text        ← field is "badge" not "badge_text"
 *   │     └── list_with_animation    Group
 *   │           ├── left_list        Text Area   (newline-separated — left bullets)
 *   │           ├── fav_logo         Image       (center logo)
 *   │           └── right_list       Text Area   (newline-separated — right checkmarks)
 *   │
 *   ├── card1                ← top-level ACF group
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
 *   └── section_data_in_action
 *         ├── title          Text
 *         ├── description    Text Area
 *         └── image          Image object { url } OR numeric media ID
 */

export const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

/* ─────────────────────────────────────────────────────────────────────────
   resolveImg — converts any ACF image value → plain URL string
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
   parseLines — converts a newline/comma-separated string → string[]
───────────────────────────────────────────────────────────────────────── */
export function parseLines(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((t) => (typeof t === "object" ? t.tag_text || t.point_text || "" : String(t)))
      .filter(Boolean);
  }
  return String(raw)
    .split(/[\r\n]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/* ─────────────────────────────────────────────────────────────────────────
   Module-level cache — one fetch shared across all section components
───────────────────────────────────────────────────────────────────────── */
let _cache   = null;
let _promise = null;

/**
 * fetchSolutionDetailPage()
 * Returns the full ACF object for page 919.
 * Subsequent calls return the cached value immediately.
 */
export async function fetchSolutionDetailPage() {
  if (_cache)   return _cache;
  if (_promise) return _promise;

  _promise = fetch(`${WP_BASE}/wp/v2/pages/919?_fields=acf`)
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
   getSdSectionOne()
   Returns: { badge_text, title, description }
───────────────────────────────────────────────────────────────────────── */
export async function getSdSectionOne() {
  const acf = await fetchSolutionDetailPage();
  const sec = acf?.section_one ?? null;
  if (!sec) return null;

  return {
    badge_text:  sec.badge_text  || "",
    title:       sec.title       || "",
    description: sec.description || "",
    image:       await resolveImg(sec.image),
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   getSdSectionProblems()

   ACF path: acf.section_problems (Group)
     ├── title                Text
     ├── description          Text Area
     ├── badge                Text
     └── list_with_animation  Group
           ├── left_list      Text Area  (newline-separated → left bullet list)
           ├── fav_logo       Image      (center logo)
           └── right_list     Text Area  (newline-separated → right checkmark list)

   Returns: {
     badge_text,            ← mapped from raw.badge
     title,
     description,
     problems_list[],       ← from list_with_animation.left_list
     solutions_list[],      ← from list_with_animation.right_list
     center_image           ← URL string from list_with_animation.fav_logo
   }
───────────────────────────────────────────────────────────────────────── */
export async function getSdSectionProblems() {
  const acf = await fetchSolutionDetailPage();
  const raw = acf?.section_problems ?? null;
  if (!raw) return null;

  // Nested group: list_with_animation
  const lwa = raw.list_with_animation ?? {};

  return {
    badge_text:     raw.badge          || "",   // field name is "badge"
    title:          raw.title          || "",
    description:    raw.description    || "",
    problems_list:  parseLines(lwa.left_list),  // left_list inside list_with_animation
    solutions_list: parseLines(lwa.right_list), // right_list inside list_with_animation
    center_image:   await resolveImg(lwa.fav_logo), // fav_logo inside list_with_animation
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   getSdCards()

   card1 / card3  →  card_tags is a Text Area (newline-separated bullet list)
   card2          →  card_tags is a Group with sub-fields:
                       number   Text       — stat 1 value  (e.g. "10M+")
                       des      Text Area  — stat 1 label  (e.g. "Records Processed Daily")
                       percent  Text       — stat 2 value  (e.g. "99%")
                       des_1    Text Area  — stat 2 label  (e.g. "Accuracy Rate")
                       (ACF may name the second "des" field as "des_1" or "des" depending on version)

   Returns: {
     card1: { card_title, card_description, card_image, card_tags[] },
     card2: { card_title, card_description, card_image,
              stat1_value, stat1_label, stat2_value, stat2_label },
     card3: { card_title, card_description, card_image, card_tags[] },
   }
   card2 is stored as "card" in WP.
───────────────────────────────────────────────────────────────────────── */
export async function getSdCards() {
  const acf = await fetchSolutionDetailPage();

  async function parseCard(raw) {
    if (!raw) return null;
    return {
      card_title:       raw.card_title       || "",
      card_description: raw.card_description || "",
      card_image:       await resolveImg(raw.card_image),
      card_tags:        parseLines(raw.card_tags),
    };
  }

  async function parseCard2(raw) {
    if (!raw) return null;
    const tags = raw.card_tags ?? {};
    return {
      card_title:       raw.card_title       || "",
      card_description: raw.card_description || "",
      card_image:       await resolveImg(raw.card_image),
      // stat group sub-fields: number, des1, percent, des2
      stat1_value: tags.number  || "",
      stat1_label: tags.des1    || "",
      stat2_value: tags.percent || "",
      stat2_label: tags.des2    || "",
    };
  }

  const [card1, card2, card3] = await Promise.all([
    parseCard(acf?.card1 ?? null),
    parseCard2(acf?.card  ?? null),  // card2 stored as "card" in WP
    parseCard(acf?.card3 ?? null),
  ]);

  return { card1, card2, card3 };
}

/* ─────────────────────────────────────────────────────────────────────────
   getSdSectionDataInAction()
   Returns: { title, description, image }
───────────────────────────────────────────────────────────────────────── */
export async function getSdSectionDataInAction() {
  const acf = await fetchSolutionDetailPage();
  const raw = acf?.section_data_in_action ?? null;
  if (!raw) return null;

  return {
    title:       raw.title       || "",
    description: raw.description || "",
    image:       await resolveImg(raw.image),
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   getSdExtractionProcess()

   ACF path: acf.extraction_prcess (Group)   ← note: "prcess" typo in ACF
     ├── badge          Text        → pill badge label
     ├── title          Text        → section heading
     ├── description    Text Area   → section sub-heading
     └── numbering      Group
           ├── one      Group  → { title, des }
           ├── two      Group  → { title, des }
           ├── three    Group  → { title, des }
           └── fourth   Group  → { title, des }

   Returns: {
     badge,
     title,
     description,
     steps: [{ title, des }, ...]   — in order: one, two, three, fourth
   }
───────────────────────────────────────────────────────────────────────── */
export async function getSdExtractionProcess() {
  const acf = await fetchSolutionDetailPage();

  // ACF field name has a typo: "extraction_prcess" (missing 'o')
  const raw = acf?.extraction_prcess ?? null;
  if (!raw) return null;

  const numbering = raw.numbering ?? {};

  // Each step is a named group: one, two, three, fourth, five, six
  const stepKeys = ["one", "two", "three", "fourth", "five", "six"];
  const steps = stepKeys
    .map((key) => {
      const row = numbering[key];
      if (!row) return null;
      return {
        title: row.title || "",
        des:   row.des   || "",
      };
    })
    .filter((s) => s && (s.title || s.des));

  return {
    badge:       raw.badge       || "",
    title:       raw.title       || "",
    description: raw.description || "",
    steps,
  };
}
