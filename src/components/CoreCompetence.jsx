import { useEffect, useRef, useState } from "react";
import "./CoreCompetence.css";

const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.NEXT_PUBLIC_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

const PRIMARY_URL  = `${WP_BASE}/theme/v1/core-competence`;
const FALLBACK_URL = `${WP_BASE}/wp/v2/pages/63?_fields=acf`;

const FALLBACK = {
  title:       "Core Competence",
  description: "We are the top-tier web crawling service providers, capable of crawling freely available information at exceptionally fast speeds while maintaining excellent accuracy.",
  steps: [
    { number: 1, title: "Price Intelligence",    description: "Track competitor pricing trends in real time to optimize your pricing strategy." },
    { number: 2, title: "Competitor Analysis",   description: "Analyze competitor activities, strategies, and market positioning continuously." },
    { number: 3, title: "Data Aggregation",      description: "Collect and organize news data from multiple sources for actionable insights." },
    { number: 4, title: "Keyword Ranking",       description: "Track keyword performance and search rankings to enhance visibility." },
  ],
};

function parseFromAcf(acf) {
  const cc = acf?.core_competence;
  if (!cc) return FALLBACK;
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

/* ════════════════════════════════════════════════════════════
   CORE COMPETENCE
   Design:
   - Full-width filled semicircle (light blue, top arc = navy border)
   - Numbers sit ON the arc curve
   - Active number = top center (12 o'clock)
   - Other numbers spread to the right along the arc
   - Scroll → numbers rotate left (next step moves to top)
   - Content (title + desc) inside the arc, fades on change
   - Responsive: same circle, smaller on mobile
════════════════════════════════════════════════════════════ */
export default function CoreCompetence() {
  const [data,       setData]       = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [fading,     setFading]     = useState(false);
  const [loading,    setLoading]    = useState(true);
  const sectionRef                  = useRef(null);
  const prevStep                    = useRef(0);

  /* ── Fetch ── */
  useEffect(() => {
    fetch(PRIMARY_URL)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(d => setData(d))
      .catch(() =>
        fetch(FALLBACK_URL).then(r => r.json())
          .then(d => setData(parseFromAcf(d?.acf)))
          .catch(() => setData(FALLBACK))
      )
      .finally(() => setLoading(false));
  }, []);

  /* ── Scroll-driven step change ── */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !data?.steps?.length) return;
    const count = data.steps.length;

    const onScroll = () => {
      const rect     = section.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1,
        (-rect.top + window.innerHeight * 0.5) / (rect.height - window.innerHeight * 0.3)
      ));
      const next = Math.min(count - 1, Math.floor(progress * count));
      if (next !== prevStep.current) {
        setFading(true);
        setTimeout(() => {
          setActiveStep(next);
          prevStep.current = next;
          setFading(false);
        }, 220);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [data]);

  if (loading || !data) return null;

  const { title, description, steps } = data;
  const n      = steps.length;
  const active = steps[activeStep] || steps[0];

  /* ── SVG dimensions ── */
  const W  = 1000;   // viewBox width
  const H  = 560;    // viewBox height (shows top half of circle)
  const cx = W / 2;
  const cy = H + 20; // center is below the visible area → shows top arc
  const R  = H + 20; // radius = distance from center to top of viewBox

  /* ── Place numbers on the arc ──
     Active step always at top (angle = -90° = 12 o'clock).
     Other steps spread to the right at +30° intervals.
     As activeStep increases, all numbers shift left.           */
  const BASE_ANGLE = -90; // degrees — top of circle
  const STEP_ANGLE = 28;  // degrees between each number

  const getPos = (stepIndex) => {
    // Offset from active: positive = to the right
    const offset = stepIndex - activeStep;
    const angleDeg = BASE_ANGLE + offset * STEP_ANGLE;
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + R * Math.cos(rad),
      y: cy + R * Math.sin(rad),
      isActive: stepIndex === activeStep,
      isVisible: Math.abs(offset) <= 2, // show ±2 from active
    };
  };

  return (
    <section className="cc" ref={sectionRef} aria-label={title}>
      <div className="cc__header-wrap container">
        <div className="cc__badge-wrap">
          <div className="cc__badge"><StarIcon /><span>CORE COMPETENCE</span></div>
        </div>
        <div className="cc__header">
          <h2 className="cc__title">{title}</h2>
          <p  className="cc__desc">{description}</p>
        </div>
      </div>

      {/* ── Full-width arc container ── */}
      <div className="cc__arc-outer">
        <svg
          className="cc__arc-svg"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMax meet"
          aria-hidden="true"
        >
          {/* Filled semicircle — light blue */}
          <path
            d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy} Z`}
            fill="#dce8f8"
          />
          {/* Arc border — navy blue */}
          <path
            d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
            stroke="#2E3192"
            strokeWidth="3"
            fill="none"
          />

          {/* ── Number bubbles on arc ── */}
          {steps.map((step, i) => {
            const pos = getPos(i);
            if (!pos.isVisible) return null;
            const isActive = pos.isActive;
            return (
              <g
                key={step.number}
                onClick={() => setActiveStep(i)}
                style={{ cursor: "pointer", transition: "all 0.4s ease" }}
              >
                {/* Bubble */}
                <rect
                  x={pos.x - (isActive ? 28 : 22)}
                  y={pos.y - (isActive ? 28 : 22)}
                  width={isActive ? 56 : 44}
                  height={isActive ? 56 : 44}
                  rx={isActive ? 16 : 12}
                  fill={isActive ? "#dce8f8" : "#eef3fb"}
                  stroke={isActive ? "#2E3192" : "#c8d4f8"}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                {/* Number */}
                <text
                  x={pos.x}
                  y={pos.y + (isActive ? 8 : 6)}
                  textAnchor="middle"
                  fontSize={isActive ? "26" : "18"}
                  fontWeight="800"
                  fill={isActive ? "#2E3192" : "#8a9ac8"}
                  fontFamily="Nunito, system-ui, sans-serif"
                >
                  {step.number}
                </text>
              </g>
            );
          })}
        </svg>

        {/* ── Content inside the arc ── */}
        <div className={`cc__arc-content${fading ? " cc__arc-content--fading" : ""}`}>
          <h3 className="cc__card-title">{active.title}</h3>
          <p  className="cc__card-desc">{active.description}</p>
        </div>
      </div>

      {/* ── Mobile: dots + card ── */}
      <div className="cc__mobile container">
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
              className={`cc__mobile-card${i === activeStep ? " cc__mobile-card--visible" : ""}${fading && i === activeStep ? " cc__mobile-card--fading" : ""}`}
              aria-hidden={i !== activeStep}
            >
              <div className="cc__mobile-num">{step.number}</div>
              <h3 className="cc__card-title">{step.title}</h3>
              <p  className="cc__card-desc">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="cc__mobile-nav">
          <button className="cc__mobile-btn" onClick={() => setActiveStep(s => Math.max(0, s - 1))} disabled={activeStep === 0}>←</button>
          <span className="cc__mobile-counter">{activeStep + 1} / {n}</span>
          <button className="cc__mobile-btn" onClick={() => setActiveStep(s => Math.min(n - 1, s + 1))} disabled={activeStep === n - 1}>→</button>
        </div>
      </div>

    </section>
  );
}
