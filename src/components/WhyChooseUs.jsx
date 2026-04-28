import { useEffect, useRef, useState } from "react";
import "./WhyChooseUs.css";

const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.NEXT_PUBLIC_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

const ACF_URL = `${WP_BASE}/wp/v2/pages/63?_fields=acf`;

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

/* ── Resolve image ID → URL ── */
async function resolveImage(val) {
  if (!val) return { url: "", alt: "" };
  if (typeof val === "object" && val.url) return { url: val.url, alt: val.alt || "" };
  if (typeof val === "number" || (typeof val === "string" && /^\d+$/.test(val))) {
    try {
      const r = await fetch(`${WP_BASE}/wp/v2/media/${val}?_fields=source_url,alt_text`);
      const d = await r.json();
      return { url: d.source_url || "", alt: d.alt_text || "" };
    } catch { return { url: "", alt: "" }; }
  }
  if (typeof val === "string") return { url: val, alt: "" };
  return { url: "", alt: "" };
}

/* ── Skeleton ── */
function Skeleton() {
  return (
    <section className="wcu">
      <div className="container">
        <div className="badge-sec skeleton" style={{ width: 140, height: 32, borderRadius: 999, margin: "0 auto 24px" }} />
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

/* ═══════════════════════════════════════════════
   WHY CHOOSE US
   Reads ACF from /wp/v2/pages/63
   Uses who_we_are (title/desc) + we_are_card (4 cards)
   Layout: 2×2 grid matching the design screenshot
═══════════════════════════════════════════════ */
export default function WhyChooseUs() {
  const [heading,  setHeading]  = useState("");
  const [subtext,  setSubtext]  = useState("");
  const [cards,    setCards]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const cardRefs                = useRef([]);

  /* ── Scroll reveal ── */
  useEffect(() => {
    if (loading || !cards.length) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-visible"); obs.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    cardRefs.current.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, [loading, cards]);

  /* ── Fetch ACF ── */
  useEffect(() => {
    fetch(ACF_URL)
      .then(r => r.json())
      .then(async data => {
        const acf = data?.acf;
        if (!acf) return;

        // Section heading & description from who_we_are group
        const who = acf.who_we_are;
        if (who) {
          setHeading(who.chose_us_  || "");
          setSubtext(who.we_are_dis || "");
        }

        // Cards from we_are_card group
        const cg = acf.we_are_card;
        if (!cg) return;

        const imgG    = cg.we_are_card_image || {};
        const titleG  = cg.we_are_card_title || {};
        const disG    = cg.we_are_card_dis   || {};
        const bulletG = cg.card_bullet_point || {};

        const [img1, img2, img3] = await Promise.all([
          resolveImage(imgG.image1),
          resolveImage(imgG.image2),
          resolveImage(imgG.image3),
        ]);
        const imgs = [img1, img2, img3];

        const built = [];
        for (let i = 1; i <= 3; i++) {
          const img     = imgs[i - 1];
          const title   = titleG[`title${i}`]                                  || "";
          const desc    = disG[`discreption${i}`] || disG[`discretion${i}`]    || "";
          const raw     = bulletG[`card_point${i}`]                            || "";
          const bullets = raw.split(/\r?\n/).map(b => b.trim()).filter(Boolean);
          if (title || img.url || desc) built.push({ image: img.url, image_alt: img.alt || title, title, description: desc, bullets });
        }
        setCards(built);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;
  if (!heading && !subtext && !cards.length) return null;

  // Card 0 → large left (dark gradient + bullets)
  // Card 1 → top right (image + title + desc)
  // Card 2 → bottom left (bordered outline)
  // Card 3 → bottom right (dark + bullets) — reuse card 0 style if only 3 cards
  const c0 = cards[0] || {};
  const c1 = cards[1] || {};
  const c2 = cards[2] || {};

  return (
    <section className="wcu" aria-label="Why Choose Us">
      <div className="container">

        {/* ── Badge ── */}
        <div className="wcu__badge">
          <StarIcon />
          <span>WHY CHOOSE US</span>
        </div>

        {/* ── Heading ── */}
        <div className="wcu__header">
          {heading && <h2 className="wcu__title">{heading}</h2>}
          {subtext  && <p  className="wcu__desc">{subtext}</p>}
        </div>

        {/* ── 2×2 Grid ── */}
        <div className="wcu__grid">

          {/* Card 1 — large dark gradient (left) */}
          <article
            className="wcu-card wcu-card--dark wcu-card--large"
            ref={el => cardRefs.current[0] = el}
          >
            {c0.image && (
              <img src={c0.image} alt={c0.image_alt} className="wcu-card__bg-img" />
            )}
            <div className="wcu-card__overlay" />
            <div className="wcu-card__content">
              {c0.title && <h3 className="wcu-card__title">{c0.title}</h3>}
              {c0.bullets?.length > 0 && (
                <ul className="wcu-card__bullets">
                  {c0.bullets.map((b, bi) => {
                    const [bold, ...rest] = b.split(/[.–—]/);
                    return (
                      <li key={bi} className="wcu-card__bullet">
                        <CheckIcon />
                        <span>
                          <strong>{bold.trim()}</strong>
                          {rest.length ? `. ${rest.join(".").trim()}` : ""}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
              {!c0.bullets?.length && c0.description && (
                <p className="wcu-card__desc">{c0.description}</p>
              )}
            </div>
          </article>

          {/* Card 2 — image top right */}
          <article
            className="wcu-card wcu-card--light"
            ref={el => cardRefs.current[1] = el}
          >
            {c1.image && (
              <div className="wcu-card__img-wrap">
                <img src={c1.image} alt={c1.image_alt} className="wcu-card__img" loading="lazy" />
              </div>
            )}
            <div className="wcu-card__content">
              {c1.title       && <h3 className="wcu-card__title wcu-card__title--dark">{c1.title}</h3>}
              {c1.description && <p  className="wcu-card__desc wcu-card__desc--dark">{c1.description}</p>}
            </div>
          </article>

          {/* Card 3 — bordered outline bottom left */}
          <article
            className="wcu-card wcu-card--outline"
            ref={el => cardRefs.current[2] = el}
          >
            <div className="wcu-card__corner wcu-card__corner--tl" />
            <div className="wcu-card__corner wcu-card__corner--br" />
            <div className="wcu-card__content wcu-card__content--center">
              {c2.title       && <h3 className="wcu-card__title wcu-card__title--dark">{c2.title}</h3>}
              {c2.description && <p  className="wcu-card__desc wcu-card__desc--dark">{c2.description}</p>}
            </div>
          </article>

          {/* Card 4 — dark with bullets bottom right */}
          <article
            className="wcu-card wcu-card--dark2"
            ref={el => cardRefs.current[3] = el}
          >
            {c2.image && (
              <img src={c2.image} alt={c2.image_alt} className="wcu-card__bg-img" />
            )}
            <div className="wcu-card__overlay" />
            <div className="wcu-card__content">
              {c0.description && <h3 className="wcu-card__title">{c0.description}</h3>}
              {c0.bullets?.length > 0 && (
                <ul className="wcu-card__bullets">
                  {c0.bullets.map((b, bi) => {
                    const [bold, ...rest] = b.split(/[.–—]/);
                    return (
                      <li key={bi} className="wcu-card__bullet">
                        <CheckIcon />
                        <span>
                          <strong>{bold.trim()}</strong>
                          {rest.length ? `. ${rest.join(".").trim()}` : ""}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </article>

        </div>
      </div>
    </section>
  );
}
