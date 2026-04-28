import { useEffect, useRef, useState } from "react";
import "./CoreCompetence.css";

/* ═══════════════════════════════════════════════
   CORE COMPETENCE — Scroll-driven step section
   As user scrolls down, each numbered step
   activates in sequence (1→2→3→4→5).
   On scroll up, steps deactivate in reverse.
═══════════════════════════════════════════════ */

const STEPS = [
  {
    number: 1,
    title:       "Price Intelligence",
    description: "Track competitor pricing in real-time to optimize your pricing strategy and stay ahead of market shifts.",
  },
  {
    number: 2,
    title:       "Competitor Analysis",
    description: "Analyze competitor activities, strategies, and market positioning continuously.",
  },
  {
    number: 3,
    title:       "Data Aggregation",
    description: "Collect and aggregate clean data from multiple sources for actionable insights.",
  },
  {
    number: 4,
    title:       "Keyword Ranking",
    description: "Track keyword performance and search rankings to enhance visibility.",
  },
  {
    number: 5,
    title:       "Real-Time Monitoring",
    description: "Monitor live data streams and get instant alerts on critical business metrics.",
  },
];

const SECTION_TITLE = "Core Competence";
const SECTION_DESC  = "We provide the most comprehensive data extraction services available to businesses of all sizes, consistently delivering accuracy and speed.";

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

export default function CoreCompetence() {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef  = useRef(null);
  const stepsRef    = useRef([]);

  /* ── Scroll-driven step activation ── */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleScroll = () => {
      const sectionTop    = section.getBoundingClientRect().top;
      const sectionHeight = section.offsetHeight;
      const windowHeight  = window.innerHeight;

      // How far we've scrolled into the section (0 → 1)
      const progress = Math.max(0, Math.min(1,
        (-sectionTop + windowHeight * 0.4) / (sectionHeight - windowHeight * 0.4)
      ));

      // Map progress to step index
      const step = Math.min(
        STEPS.length - 1,
        Math.floor(progress * STEPS.length)
      );
      setActiveStep(step);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // run once on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

        {/* ── Main layout: step list + active card ── */}
        <div className="cc__body">

          {/* Left — numbered step list */}
          <div className="cc__steps" role="list">
            {STEPS.map((step, i) => (
              <button
                key={step.number}
                role="listitem"
                className={`cc__step${i <= activeStep ? " cc__step--active" : ""}${i === activeStep ? " cc__step--current" : ""}`}
                onClick={() => setActiveStep(i)}
                aria-current={i === activeStep ? "step" : undefined}
              >
                {/* Number bubble */}
                <span className="cc__step-num">{step.number}</span>

                {/* Connector line (not on last) */}
                {i < STEPS.length - 1 && (
                  <span
                    className={`cc__step-line${i < activeStep ? " cc__step-line--filled" : ""}`}
                    aria-hidden="true"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Right — active step card */}
          <div className="cc__card-wrap">
            {STEPS.map((step, i) => (
              <div
                key={step.number}
                className={`cc__card${i === activeStep ? " cc__card--visible" : ""}`}
                aria-hidden={i !== activeStep}
              >
                <div className="cc__card-num" aria-hidden="true">
                  {String(step.number).padStart(2, "0")}
                </div>
                <h3 className="cc__card-title">{step.title}</h3>
                <p  className="cc__card-desc">{step.description}</p>
              </div>
            ))}
          </div>

        </div>

        {/* ── Mobile: vertical list ── */}
        <div className="cc__mobile-list">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className={`cc__mobile-item${i <= activeStep ? " cc__mobile-item--active" : ""}`}
              ref={el => stepsRef.current[i] = el}
            >
              <div className="cc__mobile-left">
                <span className="cc__step-num">{step.number}</span>
                {i < STEPS.length - 1 && (
                  <span className={`cc__mobile-line${i < activeStep ? " cc__step-line--filled" : ""}`} aria-hidden="true" />
                )}
              </div>
              <div className="cc__mobile-content">
                <h3 className="cc__card-title">{step.title}</h3>
                <p  className="cc__card-desc">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
