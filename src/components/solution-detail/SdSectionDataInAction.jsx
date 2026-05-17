/**
 * SdSectionDataInAction.jsx  —  components/solution-detail/
 * ─────────────────────────────────────────────────────────────────────────────
 * Half-arc design: logo at bottom-center, click logo → images fan upward.
 * Images closer to center are larger; outer images are smaller.
 *
 * ACF path: acf.section_data_in_action
 *   ├── badge        Text
 *   ├── title        Text
 *   └── description  Text Area
 */

import { useEffect, useRef, useState } from "react";
import { getSdSectionDataInAction } from "./solutionsDetailApi";
import "./SdSectionDataInAction.css";


/* ── Star icon ── */
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
/* ─────────────────────────────────────────────
   Fallback use-case images
───────────────────────────────────────────── */
const DEFAULT_USE_CASES = [
  { image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=300&h=220&fit=crop", alt: "E-commerce analytics" },
  { image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=220&fit=crop", alt: "Market data dashboard" },
  { image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=220&fit=crop", alt: "Financial insights" },
  { image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=300&h=220&fit=crop", alt: "Business intelligence" },
  { image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=300&h=220&fit=crop", alt: "Tech team collaboration" },
  { image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=300&h=220&fit=crop", alt: "Data science" },
  { image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300&h=220&fit=crop", alt: "Retail strategy" },
  { image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=300&h=220&fit=crop", alt: "Competitive intelligence" },
  { image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=300&h=220&fit=crop", alt: "Executive decisions" },
];

/*
 * Positions spread around center in a full orbital layout.
 * Matches reference: logo center, images scattered on arc rings.
 * Sizes vary — inner arc images larger, outer smaller.
 */
const DESKTOP_NODES = [
  { x: -480, y: -80,  size: 90  },   // 0 — far left
  { x: -340, y: -220, size: 100 },   // 1 — left outer
  { x: -260, y: -60,  size: 80  },   // 2 — left low
  { x: -180, y: -320, size: 120 },   // 3 — left inner top
  { x:  -80, y: -140, size: 75  },   // 4 — center-left
  { x:  160, y: -300, size: 115 },   // 5 — center-right top
  { x:  300, y: -180, size: 95  },   // 6 — right inner
  { x:  420, y:  -60, size: 80  },   // 7 — right mid
  { x:  500, y: -260, size: 85  },   // 8 — far right
];

const MOBILE_NODES = [
  { x: -130, y:  -50, size: 48 },
  { x: -100, y: -140, size: 56 },
  { x:  -60, y:  -30, size: 42 },
  { x:  -40, y: -200, size: 62 },
  { x:   20, y:  -60, size: 40 },
  { x:   60, y: -180, size: 58 },
  { x:  100, y:  -80, size: 50 },
  { x:  120, y: -240, size: 52 },
  { x:  140, y:  -40, size: 44 },
];

/* Per-image float timings */
const FLOAT_DUR   = [3.4, 4.0, 3.7, 4.3, 3.1, 4.6, 3.3, 4.1, 3.8];
const FLOAT_DELAY = [0.0, 0.5, 0.9, 0.3, 1.1, 0.7, 0.2, 0.8, 0.4];

/* ─────────────────────────────────────────────
   Skeleton
───────────────────────────────────────────── */
function Skeleton() {
  return (
    <section className="sddia">
      <div className="container">
        <div className="sddia__inner">
          <div className="skeleton" style={{ width: 120, height: 28, borderRadius: 999, margin: "0 auto 14px" }} />
          <div className="skeleton" style={{ width: "52%", height: 46, margin: "0 auto 12px" }} />
          <div className="skeleton" style={{ width: "68%", height: 20, margin: "0 auto 0" }} />
          <div className="skeleton" style={{ width: "100%", height: 480, borderRadius: 12, marginTop: 40 }} />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function SdSectionDataInAction() {
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [inView,    setInView]    = useState(false);   // arcs appear on scroll
  const [triggered, setTriggered] = useState(false);  // images appear on logo click
  const [isMobile,  setIsMobile]  = useState(false);
  const stageRef = useRef(null);

  /* ── Fetch ── */
  useEffect(() => {
    let cancelled = false;
    getSdSectionDataInAction()
      .then((d) => { if (!cancelled) setData(d); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  /* ── Responsive ── */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const handler = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* ── IntersectionObserver — arcs + logo appear on scroll ── */
  useEffect(() => {
    if (!stageRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.15 }
    );
    obs.observe(stageRef.current);
    return () => obs.disconnect();
  }, [loading]);

  if (loading) return <Skeleton />;
  if (!data)   return null;

  const useCases = (data.use_cases?.length ? data.use_cases : DEFAULT_USE_CASES).slice(0, 9);
  const nodes    = isMobile ? MOBILE_NODES : DESKTOP_NODES;

  const handleLogoClick = () => {
    if (!triggered) setTriggered(true);
  };

  return (
    <section className="sddia" aria-label={data.title || "Data in Action"}>
      <div className="container">
        <div className="sddia__inner">

          {/* ── Header ── */}
          <div className={`sddia__header${inView ? " sddia__header--visible" : ""}`}>
             <div className="badge-sec">
              <StarIcon />
              <span>{data.badge}</span>
            </div>

            {data.title && (
              <h2 className="head-title">{data.title}</h2>
            )}
            {data.description && (
              <p
                className="head__desc"
                dangerouslySetInnerHTML={{ __html: data.description }}
              />
            )}
          </div>

          {/* ── Stage ── */}
          <div className="sddia__stage" ref={stageRef}>
            <div className="sddia__arc-origin">

              {/* Half-circle arcs */}
              <div className={`sddia__arc sddia__arc--lg${inView ? " sddia__arc--visible" : ""}`} style={{ transitionDelay: "0.05s" }} />
              <div className={`sddia__arc sddia__arc--md${inView ? " sddia__arc--visible" : ""}`} style={{ transitionDelay: "0.2s"  }} />
              <div className={`sddia__arc sddia__arc--sm${inView ? " sddia__arc--visible" : ""}`} style={{ transitionDelay: "0.35s" }} />
              {/* Extra arc — appears on logo click */}
              <div className={`sddia__arc sddia__arc--ssm${triggered ? " sddia__arc--triggered" : ""}`} />

              {/* Orbital images — triggered by logo click */}
              {useCases.map((uc, i) => {
                const node = nodes[i] ?? { x: 0, y: -200, size: 90 };
                const half = node.size / 2;
                /* stagger: each image 0.1s apart, slow entry */
                const burstDelay = `${0.05 + i * 0.1}s`;
                /* float starts after burst settles (~0.8s) */
                const floatDelay = `${0.05 + i * 0.1 + 0.8 + FLOAT_DELAY[i % FLOAT_DELAY.length]}s`;

                return (
                  <div
                    key={i}
                    className={`sddia__node${triggered ? " sddia__node--visible" : ""}`}
                    style={{
                      "--tx":  `${node.x}px`,
                      "--ty":  `${node.y}px`,
                      width:   `${node.size}px`,
                      height:  `${node.size}px`,
                      marginLeft: `-${half}px`,
                      marginTop:  `-${half}px`,
                      transitionDelay: triggered ? burstDelay : "0s",
                      /* z-index: larger images on top */
                      zIndex: Math.round(node.size / 10),
                    }}
                  >
                    <img
                      src={uc.image}
                      alt={uc.alt || `Use case ${i + 1}`}
                      className={`sddia__node-img${triggered ? " sddia__node-img--float" : ""}`}
                      style={{
                        animationDuration: `${FLOAT_DUR[i % FLOAT_DUR.length]}s`,
                        animationDelay:    floatDelay,
                      }}
                      loading="lazy"
                    />
                  </div>
                );
              })}

              {/* Central logo — clickable, appears on scroll */}
              <button
                className={`sddia__logo-wrap${inView ? " sddia__logo-wrap--visible" : ""}${triggered ? " sddia__logo-wrap--done" : ""}`}
                onClick={handleLogoClick}
                type="button"
                aria-label={triggered ? "Use cases revealed" : "Click to reveal use cases"}
                disabled={triggered}
              >
                <img
                  src="https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/05/animated-log-2.png"
                  alt={data.title || "Solution logo"}
                  className="sddia__logo"
                  draggable={false}
                />
                {/* Pulse hint ring — only before click */}
                {!triggered && inView && (
                  <span className="sddia__logo-pulse" aria-hidden="true" />
                )}
              </button>

            </div>
          </div>

          {/* Click hint text */}
          {!triggered && inView && (
            <p className="sddia__hint">
              {/* Click the logo to explore use cases */}
              </p>
          )}

        </div>
      </div>
    </section>
  );
}
