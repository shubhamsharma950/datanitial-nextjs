import { useEffect, useState } from "react";
import "./Testimonials.css";

const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.NEXT_PUBLIC_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

const PRIMARY_URL  = `${WP_BASE}/theme/v1/testimonialssection`;
const FALLBACK_URL = `${WP_BASE}/wp/v2/pages/63?_fields=acf`;

/* ─────────────────────────────────────────────
   Resolve ACF image field → URL string
   Handles:
   - media ID (number or numeric string)
   - ACF Icon Picker / media_library object: { type, value }
   - ACF array with url: { url }
   - plain URL string
───────────────────────────────────────────── */
async function resolveImg(val) {
  if (!val) return "";

  // ACF Icon Picker / media_library: { type: "media_library", value: "339" }
  if (typeof val === "object" && val.type === "media_library" && val.value) {
    val = val.value; // fall through to numeric resolution below
  }

  // ACF image object with url
  if (typeof val === "object" && val.url) return val.url;

  // Numeric media ID (number or numeric string)
  if (typeof val === "number" || (typeof val === "string" && /^\d+$/.test(val))) {
    try {
      const r = await fetch(`${WP_BASE}/wp/v2/media/${val}?_fields=source_url`);
      const d = await r.json();
      return d.source_url || "";
    } catch { return ""; }
  }

  return typeof val === "string" ? val : "";
}

/* ─────────────────────────────────────────────
   Normalise rating_stars:
   - ACF Icon Picker / media_library object → resolve image URL
   - number 1-5  → repeat ★
   - string      → pass through (★★★★★ or image URL)
───────────────────────────────────────────── */
function normaliseStars(val) {
  if (!val) return "";
  // ACF media_library object — will be resolved as image in resolveImg
  // Return the object itself; TestimonialCard will call resolveImg on it
  if (typeof val === "object" && val.type === "media_library") return val;
  if (typeof val === "number") return "★".repeat(Math.min(5, val));
  return String(val);
}

/* ─────────────────────────────────────────────
   Build one normalised item from a raw ACF object
   Handles ACF field name typos from WP:
     author__position  (double underscore)
     author_imge       (missing 'a')
     discerption       (typo)
───────────────────────────────────────────── */
async function buildItem(raw) {
  if (!raw || typeof raw !== "object") return null;

  // rating_stars may be a media_library object → resolve to URL
  // or a number → ★ repeat, or a plain string
  const starsRaw = raw.rating_stars;
  let rating_stars;
  if (starsRaw && typeof starsRaw === "object" && starsRaw.type === "media_library") {
    rating_stars = await resolveImg(starsRaw); // resolves media ID → image URL
  } else {
    rating_stars = normaliseStars(starsRaw);
  }

  return {
    author_name:           raw.author_name                                    || "",
    author_position:       raw.author_position  || raw["author__position"]    || "",
    author_image:          await resolveImg(raw.author_image || raw.author_imge),
    rating_stars,
    author_review_details: raw.author_review_details                          || "",
  };
}

/* ─────────────────────────────────────────────
   Extract items from an ACF Group or Repeater.

   ACF Group field  → single associative array
                      { author_name, author_position, … }
                      Wrap in array → [ item ]

   ACF Repeater     → indexed array of associative arrays
                      [ { author_name, … }, { … } ]

   Group with numbered sub-groups → item_1, item_2 …
───────────────────────────────────────────── */
async function extractItems(group) {
  if (!group || typeof group !== "object") return [];

  // Repeater — indexed array of item objects
  if (Array.isArray(group)) {
    const built = await Promise.all(group.map(buildItem));
    return built.filter(Boolean);
  }

  // Plain Group whose direct keys ARE the item fields
  if ("author_name" in group || "author_review_details" in group) {
    const built = await buildItem(group);
    return built ? [built] : [];
  }

  // Group with numbered sub-groups: item_1, item_2 …
  const items = [];
  for (let i = 1; i <= 20; i++) {
    const raw = group[`item_${i}`];
    if (!raw) break;
    const built = await buildItem(raw);
    if (built) items.push(built);
  }
  return items;
}

/* ─────────────────────────────────────────────
   Parse the native ACF fallback response
   wp/v2/pages/63?_fields=acf

   ACF field names from actual API response:
     testimonialssection  (double 's' — ACF typo)
       title, discerption (typo — no 'i')
       left-slider        (hyphen)
       right_slide_items
───────────────────────────────────────────── */
async function parseFromAcf(acf) {
  // ACF key is "testimonialssection" (double 's') — also try single 's' as fallback
  const ts = acf?.testimonialssection ?? acf?.testimonialsection;
  if (!ts) return null;

  // "left-slider" uses a hyphen in ACF
  const leftGroup  = ts["left-slider"]      ?? ts.left_slider      ?? ts.left_slide_items  ?? null;
  const rightGroup = ts.right_slide_items   ?? ts["right-slide-items"] ?? ts.right_slider  ?? null;

  const [leftItems, rightItems] = await Promise.all([
    extractItems(leftGroup),
    extractItems(rightGroup),
  ]);

  return {
    title:       ts.title       || "",
    // ACF field is "discerption" (typo) — also try correct spelling
    description: ts.discerption || ts.discription || ts.description || "",
    leftItems,
    rightItems,
  };
}

/* ─────────────────────────────────────────────
   Star icon — badge decoration
───────────────────────────────────────────── */
const StarIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="ts-badge__icon">
    <circle cx="10" cy="10" r="10" fill="#2E3192" />
    <g stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
      <line x1="10" y1="5.2" x2="10" y2="14.8" />
      <line x1="6.8" y1="7"  x2="13.2" y2="13" />
      <line x1="13.2" y1="7" x2="6.8"  y2="13" />
    </g>
  </svg>
);

/* ─────────────────────────────────────────────
   Single testimonial card
───────────────────────────────────────────── */
function TestimonialCard({ item }) {
  return (
    <div className="ts-card">
      <div className="ts-card__header">
        <div
          className={`ts-card__avatar${item.author_image ? "" : " ts-card__avatar--empty"}`}
          style={item.author_image ? { backgroundImage: `url('${item.author_image}')` } : {}}
          aria-hidden="true"
        />
        <div>
          {item.author_name     && <div className="ts-card__name">{item.author_name}</div>}
          {item.author_position && <div className="ts-card__company">{item.author_position}</div>}
        </div>
      </div>

      {item.rating_stars && (
        <div className="ts-card__stars" aria-label={`Rating: ${item.rating_stars}`}>
          {/* rating_stars is either ★★★★★ text or an image URL from Icon Picker */}
          {item.rating_stars.startsWith("http") ? (
            <img src={item.rating_stars} alt="rating" className="ts-card__stars-img" />
          ) : (
            item.rating_stars
          )}
        </div>
      )}

      {item.author_review_details && (
        <div className="ts-card__text">{item.author_review_details}</div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Infinite scroll row
   Items are duplicated once for a seamless loop
───────────────────────────────────────────── */
function SliderRow({ items, direction }) {
  if (!items || items.length === 0) return null;
  const doubled = [...items, ...items];

  return (
    <div className={`ts-row ts-row--${direction}`}>
      <div className="ts-track">
        {doubled.map((item, i) => (
          <TestimonialCard key={i} item={item} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Loading skeleton
───────────────────────────────────────────── */
function Skeleton() {
  return (
    <section className="ts-section">
      <div className="container">
        <div className="ts-section__header">
          <div className="skeleton" style={{ width: 140, height: 32, borderRadius: 999, margin: "0 auto 20px" }} />
          <div className="skeleton" style={{ width: "50%", height: 44, margin: "0 auto 12px" }} />
          <div className="skeleton" style={{ width: "65%", height: 20, margin: "0 auto" }} />
        </div>
      </div>
     
    <div className="slider-container">
        
         <div className="ts-row ts-row--left">
        <div className="ts-track">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="ts-card skeleton" style={{ minWidth: 320, height: 190 }} />
          ))}
        </div>
      </div>
      <div className="ts-row ts-row--right">
        <div className="ts-track">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="ts-card skeleton" style={{ minWidth: 320, height: 190 }} />
          ))}
        </div>
      </div>

    </div>

    </section>
  );
}

/* ═══════════════════════════════════════════════
   TESTIMONIALS SECTION
   Primary:  GET /theme/v1/testimonialssection
   Fallback: GET /wp/v2/pages/63?_fields=acf
   100% WordPress-driven — no static data.
═══════════════════════════════════════════════ */
export default function TestimonialSection() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // ── 1. Try dedicated REST endpoint ──
      try {
        const r = await fetch(PRIMARY_URL);
        if (!r.ok) throw new Error(r.status);
        const d = await r.json();

        if (!cancelled) {
          setData({
            title:       d.title       || "",
            description: d.description || "",
            leftItems:   Array.isArray(d.left_items)  ? d.left_items  : [],
            rightItems:  Array.isArray(d.right_items) ? d.right_items : [],
          });
        }
        return;
      } catch { /* fall through to ACF fallback */ }

      // ── 2. Fallback: native ACF endpoint ──
      try {
        const r = await fetch(FALLBACK_URL);
        if (!r.ok) throw new Error(r.status);
        const d = await r.json();
        const parsed = await parseFromAcf(d?.acf);
        if (!cancelled) setData(parsed);
      } catch {
        if (!cancelled) setData(null);
      }
    }

    load().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  if (loading) return <Skeleton />;
  if (!data)   return null;

  const { title, description, leftItems, rightItems } = data;

  // Nothing to show if both rows are empty
  if (!leftItems.length && !rightItems.length) return null;

  return (
    <section className="ts-section" aria-label="Testimonials">

      {/* ── Header ── */}
      <div className="container">
        <div className="ts-section__header">
              {/* Badge */}
          <div className="badge-sec">
            <StarIcon />
            <span>TESTIMONIALS</span>
          </div>
          {title       && <h2 className="ts-section__title">{title}</h2>}
          {description && <p  className="ts-section__desc">{description}</p>}
        </div>
      </div>

      {/* ── Row 1: scrolls left ── */}
      <SliderRow items={leftItems}  direction="left"  />

      {/* ── Row 2: scrolls right ── */}
      <SliderRow items={rightItems} direction="right" />

    </section>
  );
}
