/**
 * innerPageApi.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralised WordPress REST API helpers for all inner pages.
 *
 * Every inner page fetches its data through fetchInnerPage(pageId, acfField).
 * The returned object is consumed by DynamicSectionRenderer.
 *
 * ACF field structure expected per page (set in WP admin):
 *
 *   <acfField> (Group)
 *     ├── banner_title          string
 *     ├── banner_discription    string   (WP typo — also tries banner_description)
 *     ├── banner_button_text    string
 *     ├── banner_button_link    string
 *     ├── badge_text            string
 *     └── sections              Repeater
 *           ├── section_type    select: heading_h2 | heading_h3 | heading_h4 |
 *           │                           paragraph | image | cta_block |
 *           │                           two_column | card_grid | icon_list
 *           ├── heading_text    string   (for heading_* types)
 *           ├── paragraph_text  wysiwyg  (for paragraph type)
 *           ├── image           image    (for image type)
 *           ├── image_alt       string
 *           ├── cta_text        string   (for cta_block)
 *           ├── cta_link        string
 *           ├── cta_style       select: primary | secondary | outline
 *           ├── left_content    wysiwyg  (for two_column)
 *           ├── right_content   wysiwyg
 *           ├── cards           Repeater (for card_grid)
 *           │     ├── card_icon   image
 *           │     ├── card_title  string
 *           │     └── card_text   string
 *           └── items           Repeater (for icon_list)
 *                 ├── item_icon   image
 *                 └── item_text   string
 */

const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

/* ─────────────────────────────────────────────────────────────────────────
   Resolve a WP media ID or ACF image object → URL string
───────────────────────────────────────────────────────────────────────── */
async function resolveMediaUrl(val) {
  if (!val) return "";

  // ACF Icon Picker / media_library object: { type: "media_library", value: "123" }
  if (typeof val === "object" && val.type === "media_library" && val.value) {
    val = val.value;
  }

  // ACF image object with url key
  if (typeof val === "object" && val.url) return val.url;

  // Numeric media ID
  if (typeof val === "number" || (typeof val === "string" && /^\d+$/.test(val))) {
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
   Normalise a single ACF repeater row into a typed section object
───────────────────────────────────────────────────────────────────────── */
async function normaliseSection(raw) {
  if (!raw || typeof raw !== "object") return null;

  const type = raw.section_type || "paragraph";

  switch (type) {
    case "heading_h2":
    case "heading_h3":
    case "heading_h4":
      return {
        type,
        text: raw.heading_text || "",
      };

    case "paragraph":
      return {
        type: "paragraph",
        html: raw.paragraph_text || raw.paragraph_html || "",
      };

    case "image": {
      const url = await resolveMediaUrl(raw.image);
      return {
        type: "image",
        url,
        alt: raw.image_alt || "",
        caption: raw.image_caption || "",
      };
    }

    case "cta_block":
      return {
        type: "cta_block",
        text:  raw.cta_text  || "",
        link:  raw.cta_link  || "#",
        style: raw.cta_style || "primary",
      };

    case "two_column":
      return {
        type:         "two_column",
        leftContent:  raw.left_content  || "",
        rightContent: raw.right_content || "",
      };

    case "card_grid": {
      const rawCards = Array.isArray(raw.cards) ? raw.cards : [];
      const cards = await Promise.all(
        rawCards.map(async (c) => ({
          icon:  await resolveMediaUrl(c.card_icon),
          title: c.card_title || "",
          text:  c.card_text  || "",
        }))
      );
      return { type: "card_grid", cards };
    }

    case "icon_list": {
      const rawItems = Array.isArray(raw.items) ? raw.items : [];
      const items = await Promise.all(
        rawItems.map(async (it) => ({
          icon: await resolveMediaUrl(it.item_icon),
          text: it.item_text || "",
        }))
      );
      return { type: "icon_list", items };
    }

    default:
      // Unknown type — pass through as paragraph if there's any text
      return raw.paragraph_text
        ? { type: "paragraph", html: raw.paragraph_text }
        : null;
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   Main fetch function — called by every inner page
───────────────────────────────────────────────────────────────────────── */
export async function fetchInnerPage(pageId, acfField) {
  const pageRes = await fetch(
    `${WP_BASE}/wp/v2/pages/${pageId}?_fields=id,title,acf,featured_media`
  );
  if (!pageRes.ok) throw new Error(`HTTP ${pageRes.status}`);
  const page = await pageRes.json();

  const acf = page?.acf?.[acfField] ?? {};

  /* ── Banner fields ── */
  const banner = {
    title:       acf.banner_title       || page?.title?.rendered || "",
    description: acf.banner_discription || acf.banner_description || "",
    ctaText:     acf.banner_button_text || "",
    ctaLink:     acf.banner_button_link || "",
    badgeText:   acf.badge_text         || "",
    featuredImage: null,
  };

  /* ── Featured image ── */
  if (page?.featured_media && page.featured_media > 0) {
    try {
      const mediaRes = await fetch(
        `${WP_BASE}/wp/v2/media/${page.featured_media}?_fields=source_url,alt_text`
      );
      if (mediaRes.ok) {
        const media = await mediaRes.json();
        banner.featuredImage = {
          url: media.source_url,
          alt: media.alt_text || banner.title,
        };
      }
    } catch { /* use fallback gradient */ }
  }

  /* ── Dynamic sections ── */
  const rawSections = Array.isArray(acf.sections) ? acf.sections : [];
  const sections = (
    await Promise.all(rawSections.map(normaliseSection))
  ).filter(Boolean);

  return { banner, sections, acf };
}

export { WP_BASE };
