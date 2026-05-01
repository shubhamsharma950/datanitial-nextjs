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
   Arc positions for each "slot" on the arc.

   ─────────────────────────────────────────────────────────────*/
const ARC_SLOTS = [
  // slot 0 — far left (hidden)
  { left: "calc(-4% - 50px)",      top: "calc(36% - 89px)",      opacity: 0, borderRadius: "12px", transform: "rotate(322deg)" },
  // slot 1 — left/prev
  { left: "calc(15.899% - 39px)",  top: "calc(19.0307% - 49px)", opacity: 1, borderRadius: "12px", transform: "rotate(322deg)" },
  // slot 2 — active/center
  { left: "calc(51.101% - 48px)",  top: "calc(2.03074% - 50px)", opacity: 1, borderRadius: "12px" },
  // slot 3 — right/next
  { left: "calc(97.3013% - 175px)",top: "calc(36% - 89px)",      opacity: 1, borderRadius: "12px", transform: "rotate(45deg)"  },
  // slot 4 — far right (hidden)
  { left: "calc(104% + 10px)",     top: "calc(36% - 89px)",      opacity: 0, borderRadius: "12px", transform: "rotate(45deg)"  },
];

/*
  For a given activeIndex and total steps, compute which slot each step occupies.
  Steps before prev are hidden left (slot 0).
  Steps after next are hidden right (slot 4).
  prev  = activeIndex - 1  → slot 1
  active = activeIndex      → slot 2
  next  = activeIndex + 1  → slot 3
*/
function getSlotForStep(stepIdx, activeIdx) {
  const diff = stepIdx - activeIdx;
  if (diff === -1) return 1; // prev
  if (diff ===  0) return 2; // active
  if (diff ===  1) return 3; // next
  if (diff  <  -1) return 0; // far left (hidden)
  return 4;                  // far right (hidden)
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

      // Only activate when section is in view (rect.top <= 0 means we've scrolled into it)
      if (rect.top > 0) {
        // Section hasn't reached top yet — show step 0
        if (currentStep.current !== 0) {
          currentStep.current = 0;
          setStepIndex(0);
        }
        return;
      }

      // How far we've scrolled through the section (0 → 1)
      const scrolled = Math.min(Math.max(-rect.top / totalScroll, 0), 1);

      // Divide scroll range evenly among steps
      // Each step occupies 1/steps.length of the scroll range
      const idx = Math.min(steps.length - 1, Math.floor(scrolled * steps.length));

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
  const total = steps.length;

  /* Active step */
  const activeStep  = steps[stepIndex] || steps[0];
  const contentStep = activeStep.title
    ? activeStep
    : [...steps].reverse().find(s => s.title) || activeStep;

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
              <path
                d="M0,600 A600,600 0 0,1 1200,600 L1200,600 L0,600 Z"
                className="arc-fill"
              />
              <path
                d="M0,600 A600,600 0 0,1 1200,600"
                className="arc-stroke"
              />
            </svg>

            {/* ── DESKTOP: render ALL steps, each positioned by its slot ── */}
            {!isMobile && steps.map((step, i) => {
              const slot      = getSlotForStep(i, stepIndex);
              const slotStyle = ARC_SLOTS[slot];
              const isActive  = slot === 2;

              return (
                <div
                  key={step.number}
                  className={`arc-num-box${isActive ? " arc-num-active" : ""}`}
                  style={{
                    left:         slotStyle.left,
                    top:          slotStyle.top,
                    opacity:      slotStyle.opacity,
                    borderRadius: slotStyle.borderRadius,
                    transform:    slotStyle.transform,
                  }}
                  aria-hidden={!isActive}
                >
                  {step.number}
                </div>
              );
            })}

            {/* ── MOBILE number box ── */}
            {isMobile && (
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
            )}

            {/* ── Content ── */}
            <div className="arc-content" key={stepIndex}>
              <h2 className="arc-content__title">{contentStep.title}</h2>
              <p  className="arc-content__text">{contentStep.description}</p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
