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
    { number: 5 }
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
    steps:       (steps.length ? steps : FALLBACK.steps).slice(0, 4),
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
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);

  const sectionRef   = useRef(null);
  const currentStep  = useRef(0);

  /* ── Fetch ── */
  useEffect(() => {
    fetch(PRIMARY_URL)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(d => setData({ ...d, steps: d.steps ? d.steps.slice(0, 4) : d.steps }))
      .catch(() =>
        fetch(FALLBACK_URL).then(r => r.json())
          .then(d => setData(parseFromAcf(d?.acf)))
          .catch(() => setData(FALLBACK))
      )
      .finally(() => setLoading(false));
  }, []);

  /* ── Scroll handler ── */
  useEffect(() => {
    if (!data?.steps?.length) return;
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
    handleScroll(); // init
    return () => window.removeEventListener("scroll", handleScroll);
  }, [data]);

  if (loading || !data) return null;

  const { title, description, steps } = data;
  const step = steps[stepIndex] || steps[0];

  /* Build left / center / right numbers exactly like the HTML.
     Right is only shown when there is a NEXT step with actual content. */
  const leftNum   = stepIndex > 0               ? steps[stepIndex - 1].number : "";
  const centerNum = step.number;
  const nextStep  = steps[stepIndex + 1];
  const rightNum  = (nextStep && nextStep.title) ? nextStep.number : "";

  return (
    <>
      {/* ── Header (outside sticky scroll area) ── */}
      <div className="cc__header-wrap">
        <div className="badge-sec">
          <StarIcon /><span>OFFERING</span>
        </div>
        <h2 className="cc__title">{title}</h2>
        <p  className="cc__desc">{description}</p>
      </div>

      {/* ── Scroll arc section ── */}
      <section
        className="arc-scroll-wrapper"
        ref={sectionRef}
        aria-label={title}
      >
        <div className="arc-sticky-box">
          <div className="arc-main-card">

            {/* Arc SVG — full card height, fill extends to bottom */}
            <svg
              className="arc-svg"
              viewBox="0 0 1800 820"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {/* Filled shape: arc curve on top, rectangle fills rest to bottom */}
              <path d="M0,430 Q900,-70 1800,430 L1800,820 L0,820 Z" className="arc-fill" />
              {/* Stroke only on the arc curve */}
              <path d="M0,430 Q900,-70 1800,430" className="arc-stroke" />
            </svg>

            {/* Number boxes */}
            <div
              className="arc-num-box arc-left"
              style={{ opacity: leftNum !== "" ? 1 : 0 }}
            >
              {leftNum}
            </div>
            <div className="arc-num-box arc-center">
              {centerNum}
            </div>
            <div
              className="arc-num-box arc-right"
              style={{ opacity: rightNum !== "" ? 1 : 0 }}
            >
              {rightNum}
            </div>

            {/* Content */}
            <div className="arc-content">
              <h2 className="arc-content__title">{step.title}</h2>
              <p  className="arc-content__text">{step.description}</p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
