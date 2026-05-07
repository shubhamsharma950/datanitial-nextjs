/**
 * SdExtractionProcess.jsx  —  components/solution-detail/
 * ─────────────────────────────────────────────────────────────────────────────
 * "Extraction Process" numbered steps section.
 *
 * Layout:
 *   [number]  |  [title + description]
 *
 * The "|" is ONE continuous vertical line (grey track) that runs through all
 * rows. A blue fill grows downward as each step scrolls into view.
 * No click interaction.
 */

import { useEffect, useRef, useState } from "react";
import { getSdExtractionProcess } from "./solutionsDetailApi";
import "./SdExtractionProcess.css";

/* ── Star icon — matches badge-sec pattern ── */
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
    <section className="sdep">
      <div className="container">
        <div className="sdep__header">
          <div className="skeleton" style={{ width: 160, height: 34, borderRadius: 20, margin: "0 auto 24px" }} />
          <div className="skeleton" style={{ width: "55%", height: 48, margin: "0 auto 16px" }} />
          <div className="skeleton" style={{ width: "70%", height: 20, margin: "0 auto 8px" }} />
          <div className="skeleton" style={{ width: "60%", height: 20, margin: "0 auto" }} />
        </div>
        <div className="sdep__body">
          <div className="sdep__track-wrap">
            <div className="sdep__track" />
          </div>
          <div className="sdep__rows">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="sdep__row">
                <div className="skeleton sdep__num-skel" />
                <div className="sdep__content">
                  <div className="skeleton" style={{ width: "45%", height: 20, marginBottom: 10 }} />
                  <div className="skeleton" style={{ width: "80%", height: 15 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Main component ── */
export default function SdExtractionProcess() {
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [visible,   setVisible]   = useState(false);
  // how many steps have been activated (0 = none, 6 = all)
  const [activeCount, setActiveCount] = useState(0);

  const sectionRef  = useRef(null);
  const itemRefs    = useRef([]);
  const trackRef    = useRef(null);
  const fillRef     = useRef(null);

  /* ── Fetch ── */
  useEffect(() => {
    let cancelled = false;
    getSdExtractionProcess()
      .then((d)  => { if (!cancelled) setData(d); })
      .catch(()  => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  /* ── Section reveal ── */
  useEffect(() => {
    if (loading || !sectionRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.05 }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [loading]);

  /* ── Per-step scroll activation ── */
  useEffect(() => {
    if (loading || !data) return;
    const observers = [];

    itemRefs.current.forEach((el, idx) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // keep the highest activated index
            setActiveCount((prev) => Math.max(prev, idx + 1));
          }
        },
        { threshold: 0.4, rootMargin: "0px 0px -40px 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [loading, data]);

  /* ── Grow the blue fill to the bottom of the last activated row ── */
  useEffect(() => {
    if (!fillRef.current || !trackRef.current || activeCount === 0) return;

    const steps = data?.steps ?? [];
    if (activeCount === 0) {
      fillRef.current.style.height = "0px";
      return;
    }

    // measure from top of track to bottom of last activated row
    const trackTop  = trackRef.current.getBoundingClientRect().top + window.scrollY;
    const lastEl    = itemRefs.current[activeCount - 1];
    if (!lastEl) return;
    const lastRect  = lastEl.getBoundingClientRect();
    const lastBottom = lastRect.top + window.scrollY + lastRect.height / 2;
    const newHeight  = Math.max(0, lastBottom - trackTop);
    fillRef.current.style.height = `${newHeight}px`;
  }, [activeCount, data]);

  if (loading) return <Skeleton />;
  if (!data)   return null;

  const steps = data.steps ?? [];

  return (
    <section
      className={`sdep${visible ? " sdep--visible" : ""}`}
      ref={sectionRef}
      aria-label={data.title || "Extraction Process"}
    >
      <div className="container">

        {/* ── Header ── */}
        <div className="sdep__header">
          {data.badge && (
  <span className="badge-sec">
             <StarIcon />
              <span>{data.badge}</span>

            </span>
          )}
          {data.title       && <h2 className="head-title">{data.title}</h2>}
          {data.description && <p  className="head__desc">{data.description}</p>}
        </div>

        {/* ── Body: numbers | line | content ── */}
        {steps.length > 0 && (
          <div className="sdep__body">

            {/* Continuous vertical line track */}
            <div className="sdep__track-wrap" ref={trackRef}>
              {/* grey background track */}
              <div className="sdep__track" />
              {/* blue fill that grows downward */}
              <div className="sdep__track-fill" ref={fillRef} />
            </div>

            {/* Rows */}
            <ol className="sdep__rows" aria-label="Process steps">
              {steps.map((step, idx) => {
                const isActive = idx < activeCount;
                return (
                  <li
                    key={idx}
                    ref={(el) => (itemRefs.current[idx] = el)}
                    className={`sdep__row${isActive ? " sdep__row--active" : ""}`}
                  >
                    {/* Number */}
                    <span className="sdep__num" aria-hidden="true">
                      {String(idx + 1).padStart(2, "0")}
                    </span>

                    {/* Content */}
                    <div className="sdep__content">
                      {step.title && <h3 className="sdep__step-title">{step.title}</h3>}
                      {step.des   && <p  className="sdep__step-desc">{step.des}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>

          </div>
        )}

      </div>
    </section>
  );
}
