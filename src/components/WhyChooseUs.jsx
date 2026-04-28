import { useEffect, useRef, useState } from "react";
import "./WhyChooseUs.css";

const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.NEXT_PUBLIC_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

// Primary: custom endpoint (needs updated functions.php on Hostinger)
// Fallback: native ACF endpoint (already works)
const PRIMARY_URL  = `${WP_BASE}/theme/v1/why-choose-us`;
const FALLBACK_URL = `${WP_BASE}/wp/v2/pages/63?_fields=acf`;

/* ── Icons ── */
const StarIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="wcu-badge__icon">
    <circle cx="10" cy="10" r="10" fill="#2E3192" />
    <g stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
      <line x1="10" y1="5.2" x2="10" y2="14.8" />
      <line x1="6.8" y1="7" x2="13.2" y2="13" />
      <line x1="13.2" y1="7" x2="6.8" y2="13" />
    </g>
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="wcu-check">
    <circle cx="10" cy="10" r="10" />
    <path fill="none" d="M6 10l3 3 5-5" stroke="#fff" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Skeleton ── */
function Skeleton() {
  return (
    <section className="wcu">
      <div className="container">
        <div className="wcu__badge skeleton" style={{ width: 140, height: 32, borderRadius: 999, margin: "0 auto 24px" }} />
        <div className="skeleton" style={{ width: "60%", height: 44, margin: "0 auto 12px" }} />
        <div className="skeleton" style={{ width: "70%", height: 18, margin: "0 auto 48px" }} />
        <div className="wcu__grid">
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton" style={{ height: 280, borderRadius: 20 }} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Parse data from native ACF fallback ── */
async function parseFromAcf(acf, wpBase) {
  const wcu = acf?.why_choose_us;
  if (!wcu) return null;

  const buildBullets = (box) => {
    const bullets = [];
    for (let i = 1; i <= 5; i++) {
      const t = box[`title${i}`] || "";
      const d = box[`dis${i}`]   || "";
      if (t || d) bullets.push({ title: t, description: d });
    }
    return bullets;
  };

  // Resolve image ID to URL
  const resolveImg = async (val) => {
    if (!val) return "";
    if (typeof val === "object" && val.url) return val.url;
    if (typeof val === "number" || /^\d+$/.test(String(val))) {
      try {
        const r = await fetch(`${wpBase}/wp/v2/media/${val}?_fields=source_url`);
        const d = await r.json();
        return d.source_url || "";
      } catch { return ""; }
    }
    return typeof val === "string" ? val : "";
  };

  const box2img = await resolveImg(wcu.box2?.image);

  return {
    section_title: wcu.section_title || "",
    section_dis:   wcu.section_dis   || "",
    box1: { heading: wcu.box1?.heading || "", bullets: buildBullets(wcu.box1 || {}), image: "" },
    box2: { image: box2img, title: wcu.box2?.title || "", dis: wcu.box2?.dis || "" },
    box3: { title: wcu.box3?.title || "", dic: wcu.box3?.dic || "" },
    box4: { heading: wcu.box4?.heading || "", bullets: buildBullets(wcu.box4 || {}), image: "" },
  };
}

/* ═══════════════════════════════════════════════
   WHY CHOOSE US
   ACF field: why_choose_us (Group) on page 63
   Layout: 2×2 grid
     box1 — dark gradient + heading + bullet list
     box2 — white card + image + title + desc
     box3 — outline/bordered card + centered text
     box4 — dark card + heading + bullet list
═══════════════════════════════════════════════ */
export default function WhyChooseUs() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const cardRefs              = useRef([]);

  /* ── Scroll reveal ── */
  useEffect(() => {
    if (loading || !data) return;
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); obs.unobserve(e.target); }
      }),
      { threshold: 0.12 }
    );
    cardRefs.current.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, [loading, data]);

  /* ── Fetch ── */
  useEffect(() => {
    // Try custom endpoint first
    fetch(PRIMARY_URL)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(d => setData(d))
      .catch(() => {
        // Fallback to native ACF
        fetch(FALLBACK_URL)
          .then(r => r.json())
          .then(async d => {
            const parsed = await parseFromAcf(d?.acf, WP_BASE);
            if (parsed) setData(parsed);
          })
          .catch(() => {});
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;
  if (!data)   return null;

  const { section_title, section_dis, box1, box2, box3, box4 } = data;

  return (
    <section className="wcu" aria-label="Why Choose Us">
      <div className="container">

        {/* ── Badge ── */}
        <div className="wcu__badge">
          <StarIcon />
          <span>WHY CHOOSE US</span>
        </div>

        {/* ── Section header ── */}
        <div className="wcu__header">
          {section_title && <h2 className="wcu__title">{section_title}</h2>}
          {section_dis   && <p  className="wcu__desc">{section_dis}</p>}
        </div>

        {/* ── 2×2 Grid ── */}
        <div className="wcu__grid">

          {/* Box 1 — dark gradient, heading + bullet list (top-left, large) */}
          <article className="wcu-card wcu-card--dark" ref={el => cardRefs.current[0] = el}>
            {box1.image && <img src={box1.image} alt="" className="wcu-card__bg-img" />}
            <div className="wcu-card__overlay" />
            <div className="wcu-card__content">
              {box1.heading && <h3 className="wcu-card__title">{box1.heading}</h3>}
              {box1.bullets?.length > 0 && (
                <ul className="wcu-card__bullets">
                  {box1.bullets.map((b, i) => (
                    <li key={i} className="wcu-card__bullet">
                      <CheckIcon />
                      <span>
                        <strong>{b.title}</strong>
                        {b.description && <span className="wcu-card__bullet-desc"> {b.description}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>

          {/* Box 2 — white card, image + title + description (top-right) */}
          <article className="wcu-card wcu-card--light" ref={el => cardRefs.current[1] = el}>
            {box2.image && (
              <div className="wcu-card__img-wrap">
                <img src={box2.image} alt={box2.title} className="wcu-card__img" loading="lazy" />
              </div>
            )}
            <div className="wcu-card__content">
              {box2.title && <h3 className="wcu-card__title wcu-card__title--dark">{box2.title}</h3>}
              {box2.dis   && <p  className="wcu-card__desc  wcu-card__desc--dark">{box2.dis}</p>}
            </div>
          </article>

          {/* Box 3 — outline/bordered card, centered text (bottom-left) */}
          <article className="wcu-card wcu-card--outline" ref={el => cardRefs.current[2] = el}>
            <div className="wcu-card__corner wcu-card__corner--tl" />
            <div className="wcu-card__corner wcu-card__corner--br" />
            <div className="wcu-card__content wcu-card__content--center">
              {box3.title && <h3 className="wcu-card__title wcu-card__title--dark">{box3.title}</h3>}
              {box3.dic   && <p  className="wcu-card__desc  wcu-card__desc--dark">{box3.dic}</p>}
            </div>
          </article>

          {/* Box 4 — dark card, heading + bullet list (bottom-right) */}
          <article className="wcu-card wcu-card--dark2" ref={el => cardRefs.current[3] = el}>
            {box4.image && <img src={box4.image} alt="" className="wcu-card__bg-img" />}
            <div className="wcu-card__overlay" />
            <div className="wcu-card__content">
              {box4.heading && <h3 className="wcu-card__title">{box4.heading}</h3>}
              {box4.bullets?.length > 0 && (
                <ul className="wcu-card__bullets">
                  {box4.bullets.map((b, i) => (
                    <li key={i} className="wcu-card__bullet">
                      <CheckIcon />
                      <span>
                        <strong>{b.title}</strong>
                        {b.description && <span className="wcu-card__bullet-desc"> {b.description}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>

        </div>
      </div>
    </section>
  );
}
