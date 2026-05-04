/**
 * IndustriesThreeSection.jsx  —  Section 3
 * "What Powers Every Industry Solution"
 *
 * Layout: 2×2 card grid.
 * Each card has a style variant:
 *   dark       — dark purple gradient bg + text overlay (no photo)
 *   light      — light blue/white bg + text (no photo)
 *   photo      — full-bleed photo + text overlay at bottom
 *   dark_photo — dark overlay on photo + text at bottom
 *
 * ACF path: acf → section_three (Group)
 *   badge_text   Text
 *   title        Text
 *   description  Text Area
 *   card1 (Group) → { title, description, image }
 *   card2 (Group) → { title, description, image }
 *   card3 (Group) → { title, description, image }
 *   card4 (Group) → { title, description, image }
 */

import { useEffect, useRef, useState } from "react";
import { fetchIndustriesPage, resolveImg } from "./industriesApi";
import "./IndustriesThreeSection.css";

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

function Skeleton() {
  return (
    <section className="ind3">
      <div className="container">
        <div className="skeleton" style={{ width: 180, height: 32, borderRadius: 999, margin: "0 auto 24px" }} />
        <div className="skeleton" style={{ width: "55%", height: 44, margin: "0 auto 12px" }} />
        <div className="skeleton" style={{ width: "65%", height: 18, margin: "0 auto 48px" }} />
        <div className="ind3__grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 300, borderRadius: 20 }} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Single card ── */
function Card({ card, index, cardRef }) {
  const style = card.style;

  /* ── Card 1: dark — white inner image box + text below ── */
  if (style === "dark") {
    return (
      <article
        ref={cardRef}
        className="ind3-card ind3-card--dark ind3-card--reveal"
        style={{ "--card-delay": `${index * 0.1}s` }}
        aria-label={card.title}
      >
        {card.image && (
          <div className="ind3-card__img-box">
            <img src={card.image} alt={card.imageAlt || card.title} loading="lazy" />
          </div>
        )}
        <div className="ind3-card__content">
          {card.title       && <h3 className="ind3-card__title">{card.title}</h3>}
          {card.description && <p  className="ind3-card__desc">{card.description}</p>}
        </div>
      </article>
    );
  }

  /* ── Card 2: light — image fills top, dark text below ── */
  if (style === "light") {
    return (
      <article
        ref={cardRef}
        className="ind3-card ind3-card--light ind3-card--reveal"
        style={{ "--card-delay": `${index * 0.1}s` }}
        aria-label={card.title}
      >
        {card.image && (
          <div className="ind3-card__img-top">
            <img src={card.image} alt={card.imageAlt || card.title} loading="lazy" />
          </div>
        )}
        <div className="ind3-card__content">
          {card.title       && <h3 className="ind3-card__title">{card.title}</h3>}
          {card.description && <p  className="ind3-card__desc">{card.description}</p>}
        </div>
      </article>
    );
  }

  /* ── Card 3: photo — full-bleed bg image, gradient overlay, white text ── */
  if (style === "photo") {
    return (
      <article
        ref={cardRef}
        className="ind3-card ind3-card--photo ind3-card--reveal"
        style={{ "--card-delay": `${index * 0.1}s` }}
        aria-label={card.title}
      >
        {card.image && (
          <img
            src={card.image}
            alt={card.imageAlt || card.title}
            className="ind3-card__bg-img"
            loading="lazy"
            aria-hidden="true"
          />
        )}
        <div className="ind3-card__content">
          {card.title       && <h3 className="ind3-card__title">{card.title}</h3>}
          {card.description && <p  className="ind3-card__desc">{card.description}</p>}
        </div>
      </article>
    );
  }

  /* ── Card 4: dark_photo — dark navy bg, image fills top, white text ── */
  return (
    <article
      ref={cardRef}
      className="ind3-card ind3-card--dark_photo ind3-card--reveal"
      style={{ "--card-delay": `${index * 0.1}s` }}
      aria-label={card.title}
    >
      {card.image && (
        <div className="ind3-card__img-top">
          <img src={card.image} alt={card.imageAlt || card.title} loading="lazy" />
        </div>
      )}
      <div className="ind3-card__content">
        {card.title       && <h3 className="ind3-card__title">{card.title}</h3>}
        {card.description && <p  className="ind3-card__desc">{card.description}</p>}
      </div>
    </article>
  );
}

export default function IndustriesThreeSection() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const sectionRef            = useRef(null);
  const cardRefs              = useRef([]);

  /* ── Fetch ── */
  useEffect(() => {
    let cancelled = false;
    fetchIndustriesPage()
      .then(async (acf) => {
        const s = acf?.section_three ?? {};

        /* Read the four fixed card sub-groups: card1, card2, card3, card4 */
        const CARD_KEYS = ["card1", "card2", "card3", "card4"];
        const CARD_STYLES = ["dark", "light", "photo", "dark_photo"];

        const cards = await Promise.all(
          CARD_KEYS.map(async (key, i) => {
            const c = s[key] ?? {};
            return {
              title:       c.title       || "",
              description: c.description || "",
              image:       await resolveImg(c.image),
              imageAlt:    c.image?.alt  || c.title || "",
              style:       CARD_STYLES[i],   // assign style by position
            };
          })
        );

        /* Only keep cards that have at least a title or description */
        const validCards = cards.filter((c) => c.title || c.description);

        if (!cancelled) {
          setData({
            badge:       s.badge_text  || "DATA CAPABILITIES",
            title:       s.title       || "",
            description: s.description || "",
            cards:       validCards,
          });
        }
      })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  /* ── Scroll reveal for cards ── */
  useEffect(() => {
    if (loading || !data) return;
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("ind3-card--visible");
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );
    cardRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [loading, data]);

  if (loading) return <Skeleton />;
  if (!data)   return null;

  return (
    <section className="ind3" ref={sectionRef} aria-label="What Powers Every Industry Solution">
      <div className="container">

        {/* ── Header ── */}
        <div className="ind3__header">
          <div className="badge-sec">
            <StarIcon />
            <span>{data.badge}</span>
          </div>
          {data.title       && <h2 className="ind3__title head-title">{data.title}</h2>}
          {data.description && <p  className="ind3__desc head__desc">{data.description}</p>}
        </div>

        {/* ── 2×2 Grid ── */}
        <div className="ind3__grid">
          {data.cards.map((card, i) => (
            <Card
              key={i}
              card={card}
              index={i}
              cardRef={(el) => (cardRefs.current[i] = el)}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
