/**
 * SolutionsSectionOne.jsx  —  components/solutions/
 * ─────────────────────────────────────────────────────────────────────────────
 * Section 1: "Solving Your Data Bottlenecks"
 *
 * Layout: centred header (badge + title + description) followed by three
 * alternating cards — odd cards have text-left / image-right, even cards
 * flip to image-left / text-right (matching the uploaded design).
 *
 * Each card renders:
 *   • card_title
 *   • card_description
 *   • card_tags  → pill chips
 *   • card_image → illustration on the opposite side
 *
 * Data source: getSectionOne() from solutionsApi.js
 * Animations:  CSS scroll-reveal via IntersectionObserver (no extra deps)
 */

import { useEffect, useRef, useState } from "react";
import { getSectionOne } from "./solutionsApi";
import "./SolutionsSectionOne.css";

/* ── Star icon — matches badge-sec pattern from IndustriesTwoSection ── */
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
    <section className="sol1">
      <div className="container">
        <div className="sol1__header">
          <div className="skeleton" style={{ width: 220, height: 36, borderRadius: 999, margin: "0 auto 20px" }} />
          <div className="skeleton" style={{ width: "55%", height: 48, margin: "0 auto 14px" }} />
          <div className="skeleton" style={{ width: "70%", height: 22, margin: "0 auto" }} />
        </div>
        <div className="sol1__cards">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton sol1__card-skeleton" />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Single alternating card ── */
function SolutionCard({ card, index, visible }) {
  const isEven = index % 2 !== 0; // 0-indexed: card 2 (index 1) flips

  const tags = Array.isArray(card.card_tags)
    ? card.card_tags
    : typeof card.card_tags === "string" && card.card_tags.trim()
      ? card.card_tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

  return (
    <article
      className={`sol1__card${isEven ? " sol1__card--flip" : ""}${visible ? " sol1__card--visible" : ""}`}
      style={{ transitionDelay: `${index * 0.12}s` }}
      aria-label={card.card_title}
    >
      {/* Text side */}
      <div className="sol1__card-text">
        {card.card_title && <h3 className="sol1__card-title">{card.card_title}</h3>}
        {card.card_description && (
          <p className="sol1__card-desc">{card.card_description}</p>
        )}
        {tags.length > 0 && (
          <div className="sol1__tags" aria-label="Tags">
            {tags.map((tag, ti) => (
              <span key={ti} className="sol1__tag">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Image side */}
      <div className="sol1__card-img-wrap" aria-hidden="true">
        {card.card_image ? (
          <img
            src={card.card_image}
            alt={card.card_title || ""}
            className="sol1__card-img"
            loading="lazy"
          />
        ) : (
          <div className="sol1__card-img-placeholder" />
        )}
      </div>
    </article>
  );
}

/* ── Main component ── */
export default function SolutionsSectionOne() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  /* ── Fetch ── */
  useEffect(() => {
    let cancelled = false;
    getSectionOne()
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  /* ── Scroll reveal ── */
  useEffect(() => {
    if (loading || !sectionRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [loading]);

  if (loading) return <Skeleton />;
  if (!data)   return null;

  const cards = Array.isArray(data.cards) ? data.cards : [];

  return (
    <section className="sol1" ref={sectionRef} aria-label={data.title || "Solutions Section One"}>
      <div className="container">

        {/* ── Header ── */}
        <div className={`sol1__header${visible ? " sol1__header--visible" : ""}`}>
          {data.badge_text && (
            <div className="badge-sec">
              <StarIcon />
              <span>{data.badge_text}</span>
            </div>
          )}
          {data.title && (
            <h2 className="sol1__title head-title">{data.title}</h2>
          )}
          {data.description && (
            <p className="sol1__desc head__desc">{data.description}</p>
          )}
        </div>

        {/* ── Cards ── */}
        {cards.length > 0 && (
          <div className="sol1__cards">
            {cards.map((card, i) => (
              <SolutionCard key={i} card={card} index={i} visible={visible} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
