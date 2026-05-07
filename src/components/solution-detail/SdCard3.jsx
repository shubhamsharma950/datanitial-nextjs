/**
 * SdCard3.jsx  —  components/solution-detail/
 * ─────────────────────────────────────────────────────────────────────────────
 * Card 3 — text LEFT, image RIGHT layout (same orientation as Card 1).
 *
 * ACF path: acf.card3 (top-level group)
 *   card_title        → <h3>
 *   card_description  → <p>
 *   card_image        → right-side image
 *   card_tags         → pill chips
 *
 * Data source: getSdCards() from solutionsDetailApi.js
 */

import { useEffect, useRef, useState } from "react";
import { getSdCards } from "./solutionsDetailApi";
import "./SdCard3.css";

/* ── Skeleton ── */
function Skeleton() {
  return (
    <section className="sdc3">
      <div className="container">
        <div className="sdc3__inner">
          <div className="sdc3__text">
            <div className="skeleton" style={{ width: "65%", height: 44, marginBottom: 20 }} />
            <div className="skeleton" style={{ width: "90%", height: 20, marginBottom: 10 }} />
            <div className="skeleton" style={{ width: "80%", height: 20, marginBottom: 24 }} />
            <div style={{ display: "flex", gap: 10 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ width: 100, height: 36, borderRadius: 999 }} />
              ))}
            </div>
          </div>
          <div className="skeleton sdc3__img-skeleton" />
        </div>
      </div>
    </section>
  );
}

/* ── Main component ── */
export default function SdCard3() {
  const [card,    setCard]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  /* ── Fetch ── */
  useEffect(() => {
    let cancelled = false;
    getSdCards()
      .then(({ card3 }) => { if (!cancelled) setCard(card3); })
      .catch(()          => { if (!cancelled) setCard(null); })
      .finally(()        => { if (!cancelled) setLoading(false); });
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
      className={`sdc3${visible ? " sdc3--visible" : ""}`}
      ref={sectionRef}
      aria-label={card.card_title || "Card 3"}
    >
      <div className="container">
        <div className="sdc3__inner">

          {/* ── Text side (left) ── */}
          <div className="sdc3__text">
            {card.card_title && (
              <h3 className="sdc3__title">{card.card_title}</h3>
            )}
            {card.card_description && (
              <p className="sdc3__desc">{card.card_description}</p>
            )}
            {tags.length > 0 && (
              <div className="sdc3__tags" aria-label="Tags">
                {tags.map((tag, i) => (
                  <span key={i} className="sdc3__tag">{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* ── Image side (right) ── */}
          <div className="sdc3__img-wrap" aria-hidden="true">
            {card.card_image ? (
              <img
                src={card.card_image}
                alt={card.card_title || ""}
                className="sdc3__img"
                loading="lazy"
              />
            ) : (
              <div className="sdc3__img-placeholder" />
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
