/**
 * SdCard1.jsx  —  components/solution-detail/
 * ─────────────────────────────────────────────────────────────────────────────
 * Card 1 — text LEFT, image RIGHT layout.
 *
 * ACF path: acf.card1
 *   card_title        → <h3>
 *   card_description  → <p> bold description
 *   card_tags         → bullet list
 *   card_image        → right-side image with rounded corners
 */

import { useEffect, useRef, useState } from "react";
import { getSdCards } from "./solutionsDetailApi";
import "./SdCard1.css";

/* ── Skeleton ── */
function Skeleton() {
  return (
    <section className="sdc1">
      <div className="container">
        <div className="sdc1__inner">
          <div className="sdc1__text">
            <div className="skeleton" style={{ width: "70%", height: 48, marginBottom: 20 }} />
            <div className="skeleton" style={{ width: "95%", height: 20, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: "85%", height: 20, marginBottom: 24 }} />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton" style={{ width: `${75 + i * 4}%`, height: 18, marginBottom: 10 }} />
            ))}
          </div>
          <div className="skeleton sdc1__img-skeleton" />
        </div>
      </div>
    </section>
  );
}

/* ── Main component ── */
export default function SdCard1() {
  const [card,    setCard]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  /* ── Fetch ── */
  useEffect(() => {
    let cancelled = false;
    getSdCards()
      .then(({ card1 }) => { if (!cancelled) setCard(card1); })
      .catch(()          => { if (!cancelled) setCard(null); })
      .finally(()        => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  /* ── Scroll reveal ── */
  useEffect(() => {
    if (loading || !sectionRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
      },
      { threshold: 0.1 }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [loading]);

  if (loading) return <Skeleton />;
  if (!card)   return null;

  const tags = Array.isArray(card.card_tags) ? card.card_tags : [];

  return (
    <section
      className={`sdc1${visible ? " sdc1--visible" : ""}`}
      ref={sectionRef}
      aria-label={card.card_title || "Card 1"}
    >
      <div className="container">
        <div className="sdc1__inner">

          {/* ── Text side (left) ── */}
          <div className="sdc1__text">
            {card.card_title && (
              <h3 className="sdc1__title">{card.card_title}</h3>
            )}
            {card.card_description && (
              <p className="sdc1__desc">{card.card_description}</p>
            )}
            {tags.length > 0 && (
              <ul className="sdc1__list" aria-label="Features">
                {tags.map((tag, i) => (
                  <li key={i} className="sdc1__list-item">{tag}</li>
                ))}
              </ul>
            )}
          </div>

          {/* ── Image side (right) ── */}
          <div className="sdc1__img-wrap" aria-hidden="true">
            {card.card_image ? (
              <img
                src={card.card_image}
                alt={card.card_title || ""}
                className="sdc1__img"
                loading="lazy"
              />
            ) : (
              <div className="sdc1__img-placeholder" />
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
