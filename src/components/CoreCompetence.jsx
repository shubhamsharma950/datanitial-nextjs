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
   Desktop: fixed positions for the three visible number boxes.
   Left  = prev step   (left side of arc)
   Top   = active step (top/center of arc)
   Right = next step   (right side of arc)
   ─────────────────────────────────────────────────────────────*/
const DESKTOP_PREV_STYLE = {
  left:         "calc(15.899% - 39px)",
  top:          "calc(19.0307% - 49px)",
  borderRadius: "12px",
  opacity:      1,
  transform: 'rotate(323deg)'
};

const DESKTOP_ACTIVE_STYLE = {
  left:         "calc(51.101% - 48px)",
  top:          "calc(2.03074% - 50px)",
  borderRadius: "12px",
  opacity:      1,
};

const DESKTOP_NEXT_STYLE = {
  left:         "calc(97.3013% - 175px)",
  top:          "calc(36% - 89px)",
  borderRadius: "12px",
  opacity:      1,
  transform: 'rotate(45deg)'
};

export default function CoreCompetence() {
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [isMobile,  setIsMobile]  = useState(false);

  const sectionRef   = useRef(null);
  const hasPlayed    = useRef(false);
  const intervalRef  = useRef(null);

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

  /* ── Auto-play: run 1→2→3→4 once when section enters viewport (desktop + mobile) ── */
  useEffect(() => {
    if (!data?.steps?.length) return;
    const steps = data.steps;
    const total = steps.length;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPlayed.current) {
          hasPlayed.current = true;
          setStepIndex(0);

          let current = 0;
          intervalRef.current = setInterval(() => {
            current += 1;
            if (current >= total) {
              clearInterval(intervalRef.current);
              return;
            }
            setStepIndex(current);
          }, 900); // 900 ms per step — adjust as needed
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      observer.disconnect();
      clearInterval(intervalRef.current);
    };
  }, [data, isMobile]);

  if (loading || !data) return null;

  const { title, description, steps } = data;
  const total = steps.length;

  /* Active step */
  const activeStep  = steps[stepIndex] || steps[0];
  /* Content: if active step has no title (e.g. step 5), show last step with content */
  const contentStep = activeStep.title
    ? activeStep
    : [...steps].reverse().find(s => s.title) || activeStep;

  /* Neighbours - adjusted for last slide to show 3-4-5 layout */
  let prevStep, centerStep, nextStep;
  
  if (stepIndex === total - 1 && total >= 3) {
    // On last slide (e.g., slide 5): show 3-4-5 as left-center-right
    prevStep = steps[total - 3];   // Slide 3 on left
    centerStep = steps[total - 2]; // Slide 4 in center
    nextStep = steps[total - 1];   // Slide 5 on right
  } else {
    prevStep = stepIndex > 0 ? steps[stepIndex - 1] : null;
    centerStep = activeStep;
    nextStep = stepIndex < total - 1 ? steps[stepIndex + 1] : null;
  }

  return (
    <>
      {/* ── Header ── */}
      <div className="cc__header-wrap">
        <div className="badge-sec">
          <StarIcon /><span>OFFERING</span>
        </div>
        <h2 className="cc__title head-title">{title}</h2>
        <p  className="cc__desc head__desc">{description}</p>
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

            {/* ── DESKTOP number boxes ── */}
            {!isMobile && (
              <>
                {/* PREV (left side of arc) */}
                {prevStep && (
                  <div className="arc-num-box" style={DESKTOP_PREV_STYLE}>
                    {prevStep.number}
                  </div>
                )}

                {/* ACTIVE (top/center of arc) */}
                <div className="arc-num-box arc-num-active" style={DESKTOP_ACTIVE_STYLE}>
                  {centerStep.number}
                </div>

                {/* NEXT (right side of arc) */}
                {nextStep && (
                  <div className="arc-num-box" style={DESKTOP_NEXT_STYLE}>
                    {nextStep.number}
                  </div>
                )}
              </>
            )}

            {/* ── MOBILE number boxes ── */}
            {isMobile && (
              <div
                className="arc-num-box arc-center arc-num-active"
                aria-label={`Step ${activeStep.number}`}
              >
                {activeStep.number}
              </div>
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
