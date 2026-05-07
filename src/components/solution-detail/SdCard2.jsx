/**
 * SdCard2.jsx  —  components/solution-detail/
 * ─────────────────────────────────────────────────────────────────────────────
 * Card 2 — image LEFT, text RIGHT layout.
 *
 * ACF path: acf.card  (card2 is stored as "card" in WP)
 *   card_title        → <h3>
 *   card_description  → <p>
 *   card_image        → left-side image with rounded corners
 *   card_tags (Group)
 *     ├── number   → stat1_value  e.g. "10M+"
 *     ├── des1     → stat1_label  e.g. "Records Processed Daily"
 *     ├── percent  → stat2_value  e.g. "99%"
 *     └── des2     → stat2_label  e.g. "Accuracy Rate"
 *
 * Data source: getSdCards() from solutionsDetailApi.js
 */

import { useEffect, useRef, useState } from "react";
import { getSdCards } from "./solutionsDetailApi";
import "./SdCard2.css";

/* ── Skeleton ── */
function Skeleton() {
  return (
    <section className="sdc2">
      <div className="container">
        <div className="sdc2__inner">
          <div className="skeleton sdc2__img-skeleton" />
          <div className="sdc2__text">
            <div className="skeleton" style={{ width: "75%", height: 48, marginBottom: 20 }} />
            <div className="skeleton" style={{ width: "95%", height: 20, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: "85%", height: 20, marginBottom: 36 }} />
            <div style={{ display: "flex", gap: 40 }}>
              <div>
                <div className="skeleton" style={{ width: 80, height: 40, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: 140, height: 16 }} />
              </div>
              <div>
                <div className="skeleton" style={{ width: 60, height: 40, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: 100, height: 16 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Main component ── */
export default function SdCard2() {
  const [card,    setCard]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  /* ── Fetch ── */
  useEffect(() => {
    let cancelled = false;
    getSdCards()
      .then(({ card2 }) => { if (!cancelled) setCard(card2); })
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

  const hasStats = card.stat1_value || card.stat2_value;

  return (
    <section
      className={`sdc2${visible ? " sdc2--visible" : ""}`}
      ref={sectionRef}
      aria-label={card.card_title || "Card 2"}
    >
      <div className="container">
        <div className="sdc2__inner">

          {/* ── Image side (left) ── */}
          <div className="sdc2__img-wrap" aria-hidden="true">
            {card.card_image ? (
              <img
                src={card.card_image}
                alt={card.card_title || ""}
                className="sdc2__img"
                loading="lazy"
              />
            ) : (
              <div className="sdc2__img-placeholder" />
            )}
          </div>

          {/* ── Text side (right) ── */}
          <div className="sdc2__text">
            {card.card_title && (
              <h3 className="sdc2__title">{card.card_title}</h3>
            )}
            {card.card_description && (
              <p className="sdc2__desc">{card.card_description}</p>
            )}

            {/* ── Stats row ── */}
            {hasStats && (
              <div className="sdc2__stats" aria-label="Statistics">
                {card.stat1_value && (
                  <div className="sdc2__stat">
                    <span className="sdc2__stat-value">{card.stat1_value}</span>
                    {card.stat1_label && (
                      <span className="sdc2__stat-label">{card.stat1_label}</span>
                    )}
                  </div>
                )}
                {card.stat2_value && (
                  <div className="sdc2__stat">
                    <span className="sdc2__stat-value">{card.stat2_value}</span>
                    {card.stat2_label && (
                      <span className="sdc2__stat-label">{card.stat2_label}</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
