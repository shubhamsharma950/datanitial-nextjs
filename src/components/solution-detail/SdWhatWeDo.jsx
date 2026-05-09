/**
 * SdWhatWeDo.jsx  —  components/solution-detail/
 * ─────────────────────────────────────────────────────────────────────────────
 * Masonry-style card grid (desktop) / single-column stack (mobile).
 * Layout mirrors the reference image: 6 cards in a 3-column asymmetric grid
 * where some cards are tall (image top) and some are short (text only).
 *
 * ACF path: acf.what_we_do
 *   ├── badge        Text
 *   ├── title        Text
 *   ├── description  Text Area
 *   └── blocks       Group
 *         ├── one    Group → { title, des, image }
 *         ├── two    Group → { title, des, image }
 *         ├── three  Group → { title, des, image }
 *         ├── four   Group → { title, des, image }
 *         ├── five   Group → { title, des, image }
 *         └── six    Group → { title, des, image }
 */

import { useEffect, useRef, useState } from "react";
import { getSdWhatWeDo } from "./solutionsDetailApi";
import "./SdWhatWeDo.css";

/* ── Star icon (shared badge style) ── */
const StarIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <circle cx="10" cy="10" r="10" fill="#2E3192" />
    <g stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
      <line x1="10" y1="5.2" x2="10" y2="14.8" />
      <line x1="6.8" y1="7"  x2="13.2" y2="13" />
      <line x1="13.2" y1="7" x2="6.8"  y2="13" />
    </g>
  </svg>
);

/* ── Skeleton ── */
function Skeleton() {
  return (
    <section className="sdwwd">
      <div className="sdwwd__container">
        <div className="skeleton" style={{ width: 120, height: 28, borderRadius: 999, margin: "0 auto 14px" }} />
        <div className="skeleton" style={{ width: "52%", height: 46, margin: "0 auto 12px" }} />
        <div className="skeleton" style={{ width: "68%", height: 20, margin: "0 auto 40px" }} />
        <div className="sdwwd__grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton sdwwd__card-skeleton" />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Single card ── */
function WwdCard({ card, index, visible }) {
  return (
    <article
      className={`sdwwd__card${visible ? " sdwwd__card--visible" : ""}`}
      style={{ transitionDelay: `${0.08 * index}s` }}
    >
      {card.image && (
        <div className="sdwwd__card-img-wrap">
          <img
            src={card.image}
            alt={card.title || `Card ${index + 1}`}
            className="sdwwd__card-img"
            loading="lazy"
          />
        </div>
      )}
      <div className="sdwwd__card-body">
        {card.title && <h3 className="sdwwd__card-title">{card.title}</h3>}
        {card.des   && <p  className="sdwwd__card-des">{card.des}</p>}
      </div>
    </article>
  );
}

/* ── Main component ── */
export default function SdWhatWeDo() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  /* Fetch */
  useEffect(() => {
    let cancelled = false;
    getSdWhatWeDo()
      .then((d)  => { if (!cancelled) setData(d); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  /* Scroll-triggered reveal */
  useEffect(() => {
    if (!sectionRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [loading]);

  if (loading) return <Skeleton />;
  if (!data)   return null;

  return (
    <section className="sdwwd" ref={sectionRef} aria-label={data.title || "What We Do"}>
      <div className="sdwwd__container">

        {/* Header */}
        <div className={`sdwwd__header${visible ? " sdwwd__header--visible" : ""}`}>
          {data.badge && (
            <div className="badge-sec">
              <StarIcon />
              <span>{data.badge}</span>
            </div>
          )}
          {data.title && (
            <h2 className="head-title">{data.title}</h2>
          )}
          {data.description && (
            <p
              className="head__desc"
              dangerouslySetInnerHTML={{ __html: data.description }}
            />
          )}
        </div>

        {/* Card grid */}
        {data.cards?.length > 0 && (
          <div className="sdwwd__grid">
            {data.cards.map((card, i) => (
              <WwdCard key={i} card={card} index={i} visible={visible} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
