import { useEffect, useRef, useState } from "react";
import "./CoreCompetence.css";

const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.NEXT_PUBLIC_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

const PRIMARY_URL  = `${WP_BASE}/theme/v1/core-competence`;
const FALLBACK_URL = `${WP_BASE}/wp/v2/pages/63?_fields=acf`;

/* ── Fallback static data ── */
const FALLBACK = {
  title:       "Core Competence",
  description: "We are the top-tier web crawling service providers, capable of crawling freely available information at exceptionally fast speeds while maintaining excellent accuracy.",
  steps: [
    { number: 1, title: "Price Intelligence",   description: "Track competitor pricing trends in real time to optimize your pricing strategy." },
    { number: 2, title: "Competitor Analysis",  description: "Analyze competitor activities, strategies, and market positioning continuously." },
    { number: 3, title: "Data Aggregation",     description: "Collect and organize news data from multiple sources for actionable insights." },
    { number: 4, title: "Keyword Ranking",      description: "Track keyword performance and search rankings to enhance visibility." },
  ],
};

/* ── Parse from native ACF fallback ── */
function parseFromAcf(acf) {
  const cc = acf?.core_competence;
  if (!cc) return FALLBACK;
  const cv    = cc.circle_values || {};
  const steps = [];
  for (let i = 1; i <= 5; i++) {
    const t = cc.circle_values?.[`c_title${i}`] || "";
    const d = cc.circle_values?.[`c_dis${i}`]   || "";
    if (t || d) steps.push({ number: i, title: t, description: d });
  }
  return {
    title:       cc.title       || FALLBACK.title,
    description: cc.discerption || FALLBACK.description,
    steps:       steps.length   ? steps : FALLBACK.steps,
  };
}

/* ── Star icon ── */
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

/* ── Place N numbers on a semicircle arc ── */
function getArcPositions(count, cx, cy, r) {
  return Array.from({ length: count }, (_, i) => {
    const angleDeg = -160 + (140 / Math.max(count - 1, 1)) * i;
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  });
}

/* ── Skeleton ── */
function Skeleton() {
  return (
    <section className="cc">
      <div className="container">
        <div className="cc__badge-wrap">
          <div className="skeleton" style={{ width: 160, height: 30, borderRadius: 999 }} />
        </div>
        <div className="skeleton" style={{ width: "50%", height: 44, margin: "0 auto 12px" }} />
        <div className="skeleton" style={{ width: "65%", height: 18, margin: "0 auto 48px" }} />
        <div className="skeleton" style={{ width: "100%", height: 320, borderRadius: 20 }} />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   CORE COMPETENCE — Dynamic from ACF
   Endpoint: /theme/v1/core-competence
   Fields: core_competence.title, .discerption,
           .circle_values.c_title1-5, .c_dis1-5
═══════════════════════════════════════════════ */
export default function CoreCompetence() {
  const [data,       setData]       = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [loading,    setLoading]    = useState(true);
  const sectionRef                  = useRef(null);

  /* ── Fetch from WordPress ── */
  useEffect(() => {
    fetch(PRIMARY_URL)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(d => setData(d))
      .catch(() => {
        fetch(FALLBACK_URL)
          .then(r => r.json())
          .then(d => setData(parseFromAcf(d?.acf)))
          .catch(() => setData(FALLBACK));
      })
      .finally(() => setLoading(false));
  }, []);

  /* ── Scroll-driven step activation ── */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !data?.steps?.length) return;
    const count = data.steps.length;

    const onScroll = () => {
      const rect     = section.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1,
        (-rect.top + window.innerHeight * 0.5) / (rect.height - window.innerHeight * 0.3)
      ));
      setActiveStep(Math.min(count - 1, Math.floor(progress * count)));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [data]);

  if (loading) return <Skeleton />;

  const { title, description, steps } = data || FALLBACK;
  const n         = steps.length;
  const cx = 300, cy = 320, r = 280;
  const positions = getArcPositions(n, cx, cy, r);
  const active    = steps[activeStep] || steps[0];

  return (
    <section className="cc" ref={sectionRef} aria-label={title}>
      <div className="container">

        {/* ── Badge ── */}
        <div className="cc__badge-wrap">
          <div className="cc__badge">
            <StarIcon />
            <span>CORE COMPETENCE</span>
          </div>
        </div>

        {/* ── Header — dynamic from ACF ── */}
        <div className="cc__header">
          <h2 className="cc__title">{title}</h2>
          <p  className="cc__desc">{description}</p>
        </div>

        {/* ══════════════════════════════════════
            DESKTOP — SVG semicircle arc
        ══════════════════════════════════════ */}
        <div className="cc__arc-wrap">
          <svg className="cc__arc-svg" viewBox="0 0 600 340" fill="none">

            {/* Base arc */}
            <path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
              stroke="#c8d4f8"
              strokeWidth="2"
              fill="none"
            />

            {/* Filled progress arc */}
            {activeStep > 0 && (() => {
              const s = positions[0];
              const e = positions[activeStep];
              const largeArc = activeStep >= Math.ceil(n / 2) ? 1 : 0;
              return (
                <path
                  d={`M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`}
                  stroke="#2E3192"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
              );
            })()}

            {/* Number bubbles */}
            {positions.map((pos, i) => {
              const isActive = i === activeStep;
              const isPast   = i < activeStep;
              return (
                <g key={i} onClick={() => setActiveStep(i)} style={{ cursor: "pointer" }}>
                  <rect
                    x={pos.x - 22} y={pos.y - 22}
                    width={44} height={44}
                    rx={isActive ? 14 : 10}
                    fill={isActive ? "#2E3192" : isPast ? "#eef1fb" : "#f5f7ff"}
                    stroke={isActive ? "#2E3192" : isPast ? "#c8d4f8" : "#e0e4f0"}
                    strokeWidth="1.5"
                    style={{ transition: "all 0.35s ease" }}
                  />
                  <text
                    x={pos.x} y={pos.y + 6}
                    textAnchor="middle"
                    fontSize={isActive ? "18" : "16"}
                    fontWeight={isActive ? "800" : "600"}
                    fill={isActive ? "#fff" : isPast ? "#2E3192" : "#9a9ab0"}
                    fontFamily="Nunito, system-ui, sans-serif"
                    style={{ transition: "all 0.35s ease" }}
                  >
                    {steps[i].number}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Content card — dynamic title + description */}
          <div className="cc__arc-content">
            {steps.map((step, i) => (
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
            MOBILE — single card + prev/next
        ══════════════════════════════════════ */}
        <div className="cc__mobile">

          <div className="cc__mobile-dots">
            {steps.map((_, i) => (
              <button
                key={i}
                className={`cc__mobile-dot${i === activeStep ? " cc__mobile-dot--active" : ""}`}
                onClick={() => setActiveStep(i)}
                aria-label={`Step ${i + 1}`}
              />
            ))}
          </div>

          <div className="cc__mobile-card-wrap">
            {steps.map((step, i) => (
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

          <div className="cc__mobile-nav">
            <button
              className="cc__mobile-btn"
              onClick={() => setActiveStep(s => Math.max(0, s - 1))}
              disabled={activeStep === 0}
              aria-label="Previous"
            >←</button>
            <span className="cc__mobile-counter">{activeStep + 1} / {n}</span>
            <button
              className="cc__mobile-btn"
              onClick={() => setActiveStep(s => Math.min(n - 1, s + 1))}
              disabled={activeStep === n - 1}
              aria-label="Next"
            >→</button>
          </div>

        </div>

      </div>
    </section>
  );
}
