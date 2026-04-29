import { useEffect, useRef, useState } from "react";
import "./CoreCompetence.css";

const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.NEXT_PUBLIC_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

const PRIMARY_URL  = `${WP_BASE}/theme/v1/core-competence`;
const FALLBACK_URL = `${WP_BASE}/wp/v2/pages/63?_fields=acf`;

const STEP_INTERVAL = 2400;

const FALLBACK = {
  title:       "Core Competence",
  description: "We are the top-tier web crawling service providers, capable of crawling freely available information at exceptionally fast speeds while maintaining excellent accuracy.",
  steps: [
    { number: 1, title: "Price Intelligence",  description: "Track competitor pricing trends in real time to optimize your pricing strategy." },
    { number: 2, title: "Competitor Analysis", description: "Analyze competitor activities, strategies, and market positioning continuously." },
    { number: 3, title: "Data Aggregation",    description: "Collect and organize news data from multiple sources for actionable insights." },
    { number: 4, title: "Keyword Ranking",     description: "Track keyword performance and search rankings to enhance visibility." },
    { number: 5, title: "Lead Generation",     description: "Identify and capture high-quality leads using intelligent data extraction." },
  ],
};

function parseFromAcf(acf) {
  const cc = acf?.core_competence;
  if (!cc) return FALLBACK;
  const steps = [];
  for (let i = 1; i <= 6; i++) {
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
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <circle cx="10" cy="10" r="10" fill="#2E3192" />
    <g stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
      <line x1="10" y1="5.2" x2="10" y2="14.8" />
      <line x1="6.8" y1="7"  x2="13.2" y2="13" />
      <line x1="13.2" y1="7" x2="6.8"  y2="13" />
    </g>
  </svg>
);

export default function CoreCompetence() {
  const [data,       setData]       = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [fading,     setFading]     = useState(false);
  const [loading,    setLoading]    = useState(true);
  const sectionRef                  = useRef(null);
  const activeStepRef               = useRef(0);
  const fadingRef                   = useRef(false);
  const intervalRef                 = useRef(null);
  const stepsCountRef               = useRef(0);

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

  /* ── Change step with fade ── */
  const changeStep = (next) => {
    if (next === activeStepRef.current || fadingRef.current) return;
    fadingRef.current = true;
    setFading(true);
    setTimeout(() => {
      activeStepRef.current = next;
      setActiveStep(next);
      fadingRef.current = false;
      setFading(false);
    }, 200);
  };

  /* ── Auto-advance on visibility; stop at last step ── */
  useEffect(() => {
    if (!data?.steps?.length) return;
    stepsCountRef.current = data.steps.length;

    const start = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => {
        const next = activeStepRef.current + 1;
        if (next >= stepsCountRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          return;
        }
        changeStep(next);
      }, STEP_INTERVAL);
    };

    const stop = () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };

    const obs = new IntersectionObserver(
      ([e]) => { e.isIntersecting ? start() : stop(); },
      { threshold: 0.25 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => { obs.disconnect(); stop(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (loading || !data) return null;

  const { title, description, steps } = data;
  const active = steps[activeStep] || steps[0];

  /* ════════════════════════════════════════════
     SVG geometry — ViewBox 1440 × 700
     R = 640, circle center at cy = 700 (bottom edge)
     Arc top = cy - R = 700 - 640 = 60px from top ✓
     Numbers sit at y ≈ 60 (top of arc)
     Content text sits at y ≈ 430–530 (inside arc)
  ════════════════════════════════════════════ */
  const VW = 1440;
  const VH = 700;
  const cx = VW / 2;  // 720
  const R  = 640;     // radius
  const cy = VH;      // circle center at bottom edge → arc top at y = VH - R = 60

  /* Active step → top of arc (angle = -90°).
     Each adjacent step is STEP_ANGLE degrees away. */
  const STEP_ANGLE = 22; // degrees — tighter spread like Figma

  const getPos = (idx) => {
    const offset   = idx - activeStep;
    const angleDeg = -90 + offset * STEP_ANGLE;
    const rad      = (angleDeg * Math.PI) / 180;
    const x        = cx + R * Math.cos(rad);
    const y        = cy + R * Math.sin(rad);
    // Only render if inside the visible viewBox (with some margin)
    const visible  = x > -80 && x < VW + 80 && y > -20 && y < VH + 10;
    return { x, y, offset, visible };
  };

  return (
    <section className="cc" ref={sectionRef} aria-label={title}>

      {/* ── Header ── */}
      <div className="cc__header-wrap">
        <div className="badge-sec">
          <StarIcon /><span>OFFERING</span>
        </div>
        <h2 className="cc__title">{title}</h2>
        <p  className="cc__desc">{description}</p>
      </div>

      {/* ── Full-width arc ── */}
      <div className="cc__arc-outer">
        <svg
          className="cc__arc-svg"
          viewBox={`0 0 ${VW} ${VH}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          {/* Filled circle — only top portion visible due to overflow:hidden on container */}
          <circle cx={cx} cy={cy} r={R} fill="#dce8f8" />

          {/* Arc stroke on top edge */}
          <circle
            cx={cx} cy={cy} r={R}
            fill="none"
            stroke="#2E3192"
            strokeWidth="2"
          />

          {/* ── Number bubbles on the arc ── */}
          {steps.map((step, i) => {
            const pos = getPos(i);
            if (!pos.visible) return null;

            const isActive = i === activeStep;
            const dist     = Math.abs(pos.offset);
            const opacity  = isActive ? 1 : Math.max(0.28, 1 - dist * 0.3);
            const boxSize  = isActive ? 72 : Math.max(44, 64 - dist * 10);
            const fontSize = isActive ? 32 : Math.max(16, 26 - dist * 4);
            const rx       = 14;

            return (
              <g
                key={step.number}
                onClick={() => {
                  clearInterval(intervalRef.current);
                  intervalRef.current = null;
                  changeStep(i);
                }}
                style={{ cursor: "pointer", opacity, transition: "all 0.5s ease" }}
              >
                {/* Drop shadow filter */}
                <defs>
                  <filter id={`shadow-${i}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#2E3192" floodOpacity="0.12" />
                  </filter>
                </defs>
                <rect
                  x={pos.x - boxSize / 2}
                  y={pos.y - boxSize / 2}
                  width={boxSize}
                  height={boxSize}
                  rx={rx}
                  fill={isActive ? "#dce8f8" : "#eef3fb"}
                  stroke={isActive ? "#2E3192" : "#c8d4f8"}
                  strokeWidth={isActive ? 2 : 1.5}
                  filter={`url(#shadow-${i})`}
                />
                <text
                  x={pos.x}
                  y={pos.y + fontSize * 0.38}
                  textAnchor="middle"
                  fontSize={fontSize}
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

        {/* ── Text content — centered inside the arc ── */}
        <div className={`cc__content${fading ? " cc__content--fading" : ""}`}>
          <h3 className="cc__card-title">{active.title}</h3>
          <p  className="cc__card-desc">{active.description}</p>
        </div>
      </div>

    </section>
  );
}
