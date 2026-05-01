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
    { number: 1, title: "Price Intelligence",  description: "Track competitor pricing trends in real time to optimize your pricing strategy." },
    { number: 2, title: "Competitor Analysis", description: "Analyze competitor activities, strategies, and market positioning continuously." },
    { number: 3, title: "Data Aggregation",    description: "Collect and organize news data from multiple sources for actionable insights." },
    { number: 4, title: "Keyword Ranking",     description: "Track keyword performance and search rankings to enhance visibility." },
    { number: 5 },
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
    steps:       steps.length ? steps : FALLBACK.steps,
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

/* ─────────────────────────────────────────────────────────────
   Compute the (left%, top%) position of a number box that sits
   ON the arc curve.

   SVG viewBox: 1200 × 600.
   Semicircle: centre (600, 600), radius 600.
     x = 600 - 600·cos(θ)
     y = 600 - 600·sin(θ)

   We spread steps across 20°…160° (not 0°…180°) so the edge
   numbers (1 and 5) stay fully inside the card and don't cause
   horizontal overflow.
   ─────────────────────────────────────────────────────────────*/
const ARC_START_DEG = 20;   // degrees from left edge
const ARC_END_DEG   = 160;  // degrees from left edge

function arcPosition(index, total, cardW = 1200, cardH = 600) {
  const startRad = (ARC_START_DEG * Math.PI) / 180;
  const endRad   = (ARC_END_DEG   * Math.PI) / 180;
  const angle    = startRad + ((endRad - startRad) * index) / (total - 1);
  const cx = 600, cy = 600, r = 600;
  const x = cx - r * Math.cos(angle);
  const y = cy - r * Math.sin(angle);
  return {
    leftPct: (x / cardW) * 100,
    topPct:  (y / cardH) * 100,
  };
}

/* Rotation: box tilts tangentially along the arc */
function arcRotation(index, total) {
  const startRad = (ARC_START_DEG * Math.PI) / 180;
  const endRad   = (ARC_END_DEG   * Math.PI) / 180;
  const angle    = startRad + ((endRad - startRad) * index) / (total - 1);
  const deg      = -(90 - (angle * 180) / Math.PI);
  return deg;
}

export default function CoreCompetence() {
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [isMobile,  setIsMobile]  = useState(false);

  const sectionRef  = useRef(null);
  const currentStep = useRef(0);

  /* ── Detect mobile ── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 991);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

  /* ── Desktop scroll handler ── */
  useEffect(() => {
    if (!data?.steps?.length || isMobile) return;
    const steps = data.steps;

    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect        = section.getBoundingClientRect();
      const totalScroll = section.offsetHeight - window.innerHeight;
      const progress    = Math.min(Math.max(-rect.top / totalScroll, 0), 1);
      const idx         = Math.min(steps.length - 1, Math.floor(progress * steps.length));
      if (idx !== currentStep.current) {
        currentStep.current = idx;
        setStepIndex(idx);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [data, isMobile]);

  if (loading || !data) return null;

  const { title, description, steps } = data;
  const total = steps.length; // e.g. 5

  /* Active step */
  const activeStep  = steps[stepIndex] || steps[0];
  /* Content: if active step has no title (step 5), show last step with content */
  const contentStep = activeStep.title
    ? activeStep
    : [...steps].reverse().find(s => s.title) || activeStep;

  /* Neighbours */
  const prevStep = stepIndex > 0               ? steps[stepIndex - 1] : null;
  const nextStep = stepIndex < total - 1       ? steps[stepIndex + 1] : null;

  /* Mobile navigation */
  const handleLeftClick  = () => { if (stepIndex > 0)       setStepIndex(i => i - 1); };
  const handleRightClick = () => { if (stepIndex < total-1) setStepIndex(i => i + 1); };

  /* ── Desktop: compute arc positions for prev / active / next ── */
  const BOX_W = 100; // px, number box width
  const BOX_H = 100; // px, number box height

  function desktopNumStyle(stepIdx) {
    const { leftPct, topPct } = arcPosition(stepIdx, total);
    const rot = arcRotation(stepIdx, total);
    return {
      left:      `calc(${leftPct}% - ${BOX_W / 2}px)`,
      top:       `calc(${topPct}% - ${BOX_H / 2}px)`,
      transform: `rotate(${rot}deg)`,
    };
  }

  /* Center box: top of arc — special border-radius (top corners rounded) */
  function centerBorderRadius(stepIdx, total) {
    const { leftPct } = arcPosition(stepIdx, total);
    // near top-center → flat bottom
    if (leftPct > 35 && leftPct < 65) return "18px 18px 0 0";
    // left side
    if (leftPct <= 35) return "18px 18px 18px 0";
    // right side
    return "18px 18px 0 18px";
  }

  return (
    <>
      {/* ── Header ── */}
      <div className="cc__header-wrap">
        <div className="badge-sec">
          <StarIcon /><span>OFFERING</span>
        </div>
        <h2 className="cc__title">{title}</h2>
        <p  className="cc__desc">{description}</p>
      </div>

      {/* ── Arc scroll section ── */}
      <section
        className="arc-scroll-wrapper"
        ref={sectionRef}
        aria-label={title}
      >
        <div className="arc-sticky-box">
          <div className="arc-main-card">

            {/* ── Arc SVG: true semicircle ── */}
            <svg
              className="arc-svg"
              viewBox="0 0 1200 600"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {/* Semicircle: centre (600,600) radius 600 */}
              <path
                d="M0,600 A600,600 0 0,1 1200,600 L1200,600 L0,600 Z"
                className="arc-fill"
              />
              <path
                d="M0,600 A600,600 0 0,1 1200,600"
                className="arc-stroke"
              />
            </svg>

            {/* ── DESKTOP number boxes ── */}
            {!isMobile && (
              <>
                {/* PREV (left) */}
                {prevStep && (
                  <div
                    className="arc-num-box"
                    style={{
                      ...desktopNumStyle(stepIndex - 1),
                      borderRadius: centerBorderRadius(stepIndex - 1, total),
                      opacity: 1,
                    }}
                  >
                    {prevStep.number}
                  </div>
                )}

                {/* ACTIVE (center) */}
                <div
                  className="arc-num-box arc-num-active"
                  style={{
                    ...desktopNumStyle(stepIndex),
                    borderRadius: centerBorderRadius(stepIndex, total),
                  }}
                >
                  {activeStep.number}
                </div>

                {/* NEXT (right) */}
                {nextStep && (
                  <div
                    className="arc-num-box"
                    style={{
                      ...desktopNumStyle(stepIndex + 1),
                      borderRadius: centerBorderRadius(stepIndex + 1, total),
                      opacity: 0.7,
                    }}
                  >
                    {nextStep.number}
                  </div>
                )}
              </>
            )}

            {/* ── MOBILE number boxes ── */}
            {isMobile && (
              <>
                {/* CENTER only — click cycles to next step */}
                <div
                  className="arc-num-box arc-center arc-num-active arc-num-clickable"
                  onClick={() => setStepIndex(i => (i + 1) % total)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setStepIndex(i => (i + 1) % total)}
                  aria-label={`Step ${activeStep.number}, click for next`}
                  title="Click to go to next step"
                >
                  {activeStep.number}
                </div>
              </>
            )}

            {/* ── Content ── */}
            <div className="arc-content">
              <h2 className="arc-content__title">{contentStep.title}</h2>
              <p  className="arc-content__text">{contentStep.description}</p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
