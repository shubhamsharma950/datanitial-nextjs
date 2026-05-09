/**
 * SolutionsSectionThree.jsx  —  components/solutions/
 * ─────────────────────────────────────────────────────────────────────────────
 * Section 3: "Designed Around Your Stack"
 *
 * ACF path: acf.section_three (Group)
 *   ├── badge        Text
 *   ├── title        Text
 *   ├── description  Text Area
 *   ├── card1 / card2 / card3  (Groups)
 *         ├── card_title, card_description, card_image
 *
 * Animation system — VEED-style cinematic scroll reveal:
 *   • A dedicated IntersectionObserver watches the .sol3__grid element.
 *   • It adds  "sol3__grid--in"  when the grid enters the viewport,
 *     removes it when the grid exits — so the animation replays on re-entry.
 *   • Card 1 (index 0): floats UP   from below  (translateY +80px → 0, rotate -4deg → 0)
 *   • Card 2 (index 1): minimal fade only — stable anchor for the trio
 *   • Card 3 (index 2): floats DOWN from above  (translateY -80px → 0, rotate +4deg → 0)
 *   • All cards: opacity 0→1, blur 12px→0, scale 0.9→1
 *   • GPU-optimised: translate3d + will-change: transform, opacity, filter
 *   • Staggered delays: 0ms / 120ms / 60ms for natural cascade
 *   • Soft cubic-bezier(0.22, 1, 0.36, 1) — spring-like, premium feel
 *   • Reverses smoothly on scroll-out (class removed → CSS transitions back)
 *
 * Header uses a separate IntersectionObserver (one-shot reveal, no replay needed).
 */

import { useEffect, useRef, useState } from "react";
import { getSectionThree } from "./solutionsApi";
import "./SolutionsSectionThree.css";

/* ── Star icon ── */
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
    <section className="sol3">
      <div className="container">
        <div className="sol3__header">
          <div className="skeleton" style={{ width: 160, height: 36, borderRadius: 999, margin: "0 auto 20px" }} />
          <div className="skeleton" style={{ width: "50%", height: 52, margin: "0 auto 14px" }} />
          <div className="skeleton" style={{ width: "65%", height: 22, margin: "0 auto" }} />
        </div>
        <div className="sol3__grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton sol3__card-skeleton" />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Single card — position class drives the animation variant ── */
function WorkflowCard({ card, position }) {
  // position: "first" | "center" | "last"
  return (
    <article
      className={`sol3__card sol3__card--${position}`}
      aria-label={card.card_title}
    >
      <div className="sol3__icon-wrap" aria-hidden="true">
        {card.card_image ? (
          <img
            src={card.card_image}
            alt=""
            className="sol3__icon-img"
            loading="lazy"
          />
        ) : (
          <div className="sol3__icon-placeholder" />
        )}
      </div>

      {card.card_title && (
        <h3 className="sol3__card-title">{card.card_title}</h3>
      )}
      {card.card_description && (
        <p className="sol3__card-desc">{card.card_description}</p>
      )}
    </article>
  );
}

const POSITIONS = ["first", "center", "last"];

/* ── Main component ── */
export default function SolutionsSectionThree() {
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [gridHovered, setGridHovered] = useState(false);

  const sectionRef    = useRef(null);
  const gridRef       = useRef(null);
  const headerRef     = useRef(null);
  const scrollInRef   = useRef(false); // tracks whether --in is currently active

  /* ── Fetch ── */
  useEffect(() => {
    let cancelled = false;
    getSectionThree()
      .then((d)  => { if (!cancelled) setData(d); })
      .catch(()  => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  /* ── Header: one-shot reveal ── */
  useEffect(() => {
    if (loading || !headerRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(headerRef.current);
    return () => obs.disconnect();
  }, [loading]);

  /* ── Grid: bidirectional — adds/removes class on enter AND exit ── */
  useEffect(() => {
    if (loading || !gridRef.current) return;

    const grid = gridRef.current;

    const obs = new IntersectionObserver(
      ([entry]) => {
        scrollInRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          grid.classList.add("sol3__grid--in");
        } else {
          grid.classList.remove("sol3__grid--in");
        }
      },
      {
        // Trigger when 25% of the grid is visible — feels natural on all screen sizes
        threshold: 0.25,
      }
    );

    obs.observe(grid);
    return () => obs.disconnect();
  }, [loading]);

  /* ── Grid: hover — keyframe animation fires from hidden position every time ── */
  useEffect(() => {
    if (loading || !gridRef.current) return;

    const grid = gridRef.current;

    const onEnter = () => {
      grid.classList.add("sol3__grid--hovered");
      setGridHovered(true);
    };

    const onLeave = () => {
      grid.classList.remove("sol3__grid--hovered");
      // Restore --in if scroll observer says we're still in viewport
      if (scrollInRef.current) {
        grid.classList.add("sol3__grid--in");
      }
      setGridHovered(false);
    };

    grid.addEventListener("mouseenter", onEnter);
    grid.addEventListener("mouseleave", onLeave);

    return () => {
      grid.removeEventListener("mouseenter", onEnter);
      grid.removeEventListener("mouseleave", onLeave);
    };
  }, [loading]);

  if (loading) return <Skeleton />;
  if (!data)   return null;

  const cards = Array.isArray(data.cards) ? data.cards : [];

  return (
    <section
      className="sol3"
      ref={sectionRef}
      aria-label={data.title || "Solutions Section Three"}
    >
      <div className="container">

        {/* ── Header ── */}
        <div
          ref={headerRef}
          className={`sol3__header${headerVisible ? " sol3__header--visible" : ""}`}
        >
          {data.badge_text && (
            <div className="badge-sec">
              <StarIcon />
              <span>{data.badge_text}</span>
            </div>
          )}
          {data.title && (
            <h2 className="sol3__title head-title">{data.title}</h2>
          )}
          {data.description && (
            <p className="sol3__desc head__desc">{data.description}</p>
          )}
        </div>

        {/* ── Grid — IntersectionObserver toggles sol3__grid--in ── */}
        {cards.length > 0 && (
          <div className="sol3__grid" ref={gridRef} role="list">
            {cards.map((card, i) => (
              <WorkflowCard
                key={i}
                card={card}
                position={POSITIONS[i] ?? "center"}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
