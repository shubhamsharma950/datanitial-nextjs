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
      // Cache an empty object so repeated calls don't keep hammering a broken endpoint
      _cache = {};
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
   Returns: { title, description, image, use_cases[] }
   Never throws — falls back to static data on any API error.
───────────────────────────────────────────────────────────────────────── */
const DATA_IN_ACTION_FALLBACK = {
  title: "Unlocking Value Across Use Cases",
  description:
    "See how businesses leverage web data to drive insights, optimize strategies, and stay ahead in competitive markets.",
  image: "https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/05/l2.png",
  use_cases: [
    { image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=160&h=160&fit=crop", alt: "E-commerce analytics" },
    { image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=160&h=160&fit=crop", alt: "Market data dashboard" },
    { image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=160&h=160&fit=crop", alt: "Financial insights" },
    { image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=160&h=160&fit=crop", alt: "Business intelligence" },
    { image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=160&h=160&fit=crop", alt: "Tech team collaboration" },
    { image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=160&h=160&fit=crop", alt: "Data science" },
    { image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=160&h=160&fit=crop", alt: "Retail strategy" },
    { image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=160&h=160&fit=crop", alt: "Competitive intelligence" },
    { image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=160&h=160&fit=crop", alt: "Executive decisions" },
    { image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=160&h=160&fit=crop", alt: "Growth analytics" },
  ],
};

export async function getSdSectionDataInAction() {
  try {
    const acf = await fetchSolutionDetailPage();
    const raw = acf?.section_data_in_action ?? null;
    if (!raw) return DATA_IN_ACTION_FALLBACK;

    // Resolve use_cases if present in ACF (repeater field)
    let use_cases = DATA_IN_ACTION_FALLBACK.use_cases;
    if (Array.isArray(raw.use_cases) && raw.use_cases.length) {
      use_cases = await Promise.all(
        raw.use_cases.map(async (uc) => ({
          image: await resolveImg(uc.image || uc.use_case_image),
          alt:   uc.alt || uc.use_case_title || "",
        }))
      );
    }

    return {
      badge:       raw.badge       || "",
      title:       raw.title       || DATA_IN_ACTION_FALLBACK.title,
      description: raw.description || DATA_IN_ACTION_FALLBACK.description,
      image:       (await resolveImg(raw.image)) || DATA_IN_ACTION_FALLBACK.image,
      use_cases,
    };
  } catch {
    return DATA_IN_ACTION_FALLBACK;
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   getSdWhatWeDo()

   ACF path: acf.what_we_do (Group)
     ├── badge          Text
     ├── title          Text
     ├── description    Text Area
     └── blocks         Group
           ├── one      Group  → { title, des, image }
           ├── two      Group  → { title, des, image }
           ├── three    Group  → { title, des, image }
           ├── four     Group  → { title, des, image }
           ├── five     Group  → { title, des, image }
           └── six      Group  → { title, des, image }

   Returns: {
     badge,
     title,
     description,
     cards: [{ title, des, image }, ...]
   }
───────────────────────────────────────────────────────────────────────── */
export async function getSdWhatWeDo() {
  const acf = await fetchSolutionDetailPage();
  const raw = acf?.what_we_do ?? null;
  if (!raw) return null;

  const blocks = raw.blocks ?? {};
  const blockKeys = ["one", "two", "three", "four", "five", "six", "seven"];

  const cards = await Promise.all(
    blockKeys.map(async (key) => {
      const block = blocks[key];
      if (!block) return null;
      return {
        title: block.title || "",
        des:   block.des   || "",
        image: await resolveImg(block.image),
      };
    })
  );

  return {
    badge:       raw.badge       || "",
    title:       raw.title       || "",
    description: raw.description || "",
    cards:       cards.filter(Boolean),
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
