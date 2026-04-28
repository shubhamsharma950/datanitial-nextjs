import { useEffect, useRef, useState } from "react";
import "./CoreCompetence.css";

/* ═══════════════════════════════════════════════
   CORE COMPETENCE — Semicircle arc design
   Numbers sit on a curved arc path.
   Active number is at the top (12 o'clock).
   Scroll down → rotate arc clockwise (next step)
   Scroll up   → rotate arc counter-clockwise
   Mobile: shows one card at a time with prev/next
═══════════════════════════════════════════════ */

const STEPS = [
  { number: 1, title: "Price Intelligence",   description: "Track competitor pricing in real-time to optimize your pricing strategy and stay ahead of market shifts." },
  { number: 2, title: "Competitor Analysis",  description: "Analyze competitor activities, strategies, and market positioning continuously." },
  { number: 3, title: "Data Aggregation",     description: "Collect and aggregate clean data from multiple sources for actionable insights." },
  { number: 4, title: "Keyword Ranking",      description: "Track keyword performance and search rankings to enhance visibility." },
  { number: 5, title: "Real-Time Monitoring", description: "Monitor live data streams and get instant alerts on critical business metrics." },
];

const SECTION_TITLE = "Core Competence";
const SECTION_DESC  = "We provide the most comprehensive data extraction services available to businesses of all sizes, consistently delivering accuracy and speed.";

const StarIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="cc-badge__icon">
    <circle cx="10" cy="10" r="10" fill="#2E3192" />
    <g stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
      <line x1="10" y1="5.2" x2="10" y2="14.8" />
      <line x1="6.8" y1="7"  x2="13.2" y2="13" />
      <line x1="13.2" y1="7" x2="6.8"  y2="13" />
    </g>
  </svg>
);

/* ── Place N numbers evenly on a semicircle (top half) ──
   Returns array of { x, y, angle } in SVG coords
   cx, cy = center of circle, r = radius
   Numbers spread from -180° to 0° (top half arc)        */
function getArcPositions(count, cx, cy, r) {
  return Array.from({ length: count }, (_, i) => {
    // Spread from -160° to -20° so numbers don't go to the very edges
    const angleDeg = -160 + (140 / (count - 1)) * i;
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
      angleDeg,
    };
  });
}

export default function CoreCompetence() {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef  = useRef(null);

  /* ── Scroll-driven step activation ── */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onScroll = () => {
      const rect   = section.getBoundingClientRect();
      const vh     = window.innerHeight;
      const progress = Math.max(0, Math.min(1,
        (-rect.top + vh * 0.5) / (rect.height - vh * 0.3)
      ));
      setActiveStep(Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length)));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const n    = STEPS.length;
  // SVG viewBox: 0 0 600 340  (wide semicircle, bottom half cut off)
  const cx   = 300;
  const cy   = 320; // center below the visible area so arc shows as top half
  const r    = 280;
  const positions = getArcPositions(n, cx, cy, r);
  const active    = STEPS[activeStep];

  return (
    <section className="cc" ref={sectionRef} aria-label="Core Competence">
      <div className="container">

        {/* ── Badge ── */}
        <div className="cc__badge-wrap">
          <div className="cc__badge">
            <StarIcon />
            <span>CORE COMPETENCE</span>
          </div>
        </div>

        {/* ── Header ── */}
        <div className="cc__header">
          <h2 className="cc__title">{SECTION_TITLE}</h2>
          <p  className="cc__desc">{SECTION_DESC}</p>
        </div>

        {/* ══════════════════════════════════════
            DESKTOP — SVG semicircle
        ══════════════════════════════════════ */}
        <div className="cc__arc-wrap" aria-hidden="false">
          <svg
            className="cc__arc-svg"
            viewBox="0 0 600 340"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* ── Semicircle arc path ── */}
            <path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
              stroke="#c8d4f8"
              strokeWidth="2"
              fill="none"
            />

            {/* ── Filled arc up to active step ── */}
            {(() => {
              const startPos = positions[0];
              const endPos   = positions[activeStep];
              // Large arc flag: 1 if angle span > 180°
              const dx = endPos.x - startPos.x;
              const dy = endPos.y - startPos.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              if (dist < 1) return null;
              const largeArc = activeStep >= Math.ceil(n / 2) ? 1 : 0;
              return (
                <path
                  d={`M ${startPos.x} ${startPos.y} A ${r} ${r} 0 ${largeArc} 1 ${endPos.x} ${endPos.y}`}
                  stroke="#2E3192"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
              );
            })()}

            {/* ── Number bubbles on arc ── */}
            {positions.map((pos, i) => {
              const isActive = i === activeStep;
              const isPast   = i < activeStep;
              return (
                <g
                  key={i}
                  className="cc__arc-node"
                  onClick={() => setActiveStep(i)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Bubble background */}
                  <rect
                    x={pos.x - 22}
                    y={pos.y - 22}
                    width={44}
                    height={44}
                    rx={isActive ? 14 : 10}
                    fill={isActive ? "#2E3192" : isPast ? "#eef1fb" : "#f5f7ff"}
                    stroke={isActive ? "#2E3192" : isPast ? "#c8d4f8" : "#e0e4f0"}
                    strokeWidth="1.5"
                    style={{ transition: "all 0.35s ease" }}
                  />
                  {/* Number text */}
                  <text
                    x={pos.x}
                    y={pos.y + 6}
                    textAnchor="middle"
                    fontSize={isActive ? "18" : "16"}
                    fontWeight={isActive ? "800" : "600"}
                    fill={isActive ? "#fff" : isPast ? "#2E3192" : "#9a9ab0"}
                    fontFamily="Nunito, system-ui, sans-serif"
                    style={{ transition: "all 0.35s ease" }}
                  >
                    {STEPS[i].number}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* ── Content card inside the arc ── */}
          <div className="cc__arc-content">
            {STEPS.map((step, i) => (
              <div
                key={step.number}
                className={`cc__arc-card${i === activeStep ? " cc__arc-card--visible" : ""}`}
                aria-hidden={i !== activeStep}
              >
                <h3 className="cc__card-title">{step.title}</h3>
                <p  className="cc__card-desc">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════
            MOBILE — single card with prev/next
        ══════════════════════════════════════ */}
        <div className="cc__mobile">

          {/* Step dots */}
          <div className="cc__mobile-dots" aria-label="Step indicators">
            {STEPS.map((_, i) => (
              <button
                key={i}
                className={`cc__mobile-dot${i === activeStep ? " cc__mobile-dot--active" : ""}`}
                onClick={() => setActiveStep(i)}
                aria-label={`Step ${i + 1}`}
              />
            ))}
          </div>

          {/* Single card */}
          <div className="cc__mobile-card-wrap">
            {STEPS.map((step, i) => (
              <div
                key={step.number}
                className={`cc__mobile-card${i === activeStep ? " cc__mobile-card--visible" : ""}`}
                aria-hidden={i !== activeStep}
              >
                <div className="cc__mobile-num">{step.number}</div>
                <h3 className="cc__card-title">{step.title}</h3>
                <p  className="cc__card-desc">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Prev / Next */}
          <div className="cc__mobile-nav">
            <button
              className="cc__mobile-btn"
              onClick={() => setActiveStep(s => Math.max(0, s - 1))}
              disabled={activeStep === 0}
              aria-label="Previous step"
            >
              ←
            </button>
            <span className="cc__mobile-counter">
              {activeStep + 1} / {STEPS.length}
            </span>
            <button
              className="cc__mobile-btn"
              onClick={() => setActiveStep(s => Math.min(STEPS.length - 1, s + 1))}
              disabled={activeStep === STEPS.length - 1}
              aria-label="Next step"
            >
              →
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
