/**
 * SdSectionProblems.jsx  —  components/solution-detail/
 * ─────────────────────────────────────────────────────────────────────────────
 * Pixel-accurate match to the mockup:
 *
 *   ┌──────────────────────────────────────────────────────────────────┐
 *   │  [★ BADGE]                                                       │
 *   │  Title                                                           │
 *   │  Description                                                     │
 *   │                                                                  │
 *   │  ● Problem 1          ┌──────┐  ╔══════════════════════════╗    │
 *   │  ● Problem 2          │ LOGO │  ║  ✓ Solution 1            ║    │
 *   │  ● Problem 3          └──────┘  ║  ✓ Solution 2            ║    │
 *   │  ● Problem 4                    ║  ✓ Solution 3            ║    │
 *   │                                 ║  ✓ Solution 4            ║    │
 *   │                                 ╚══════════════════════════╝    │
 *   └──────────────────────────────────────────────────────────────────┘
 *
 *  • Left list  → plain light bg, dark bullet dots, slides from LEFT
 *  • Center logo → white rounded card, overlaps right panel left edge
 *  • Right panel → dark blue blob (border-radius: 0 40px 40px 40px),
 *                  slides from RIGHT
 *
 * ACF: acf.section_problems
 *   title, description, badge,
 *   list_with_animation.left_list   (newline-separated)
 *   list_with_animation.fav_logo    (Image)
 *   list_with_animation.right_list  (newline-separated)
 */

import { useEffect, useRef, useState } from "react";
import { getSdSectionProblems } from "./solutionsDetailApi";
import "./SdSectionProblems.css";

const FALLBACK_LOGO =
  "https://darkred-worm-224502.hostingersite.com/wp-content/uploads/2026/05/animi-log.svg";

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

/* ── Checkmark icon ── */
const CheckIcon = () => (
  <svg className="sdp__check-icon" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="16" fill="#fff" />
    <path
      d="M10 16.5l4.5 4.5 8-9"
      stroke="#4E63D7"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ── Skeleton ── */
function Skeleton() {
  return (
    <section className="sdp">
      <div className="container">
        <div className="sdp__header">
          <div className="skeleton" style={{ width: 140, height: 34, borderRadius: 999, margin: "0 auto 20px" }} />
          <div className="skeleton" style={{ width: "56%", height: 52, margin: "0 auto 14px" }} />
          <div className="skeleton" style={{ width: "68%", height: 20, margin: "0 auto 6px" }} />
          <div className="skeleton" style={{ width: "52%", height: 20, margin: "0 auto" }} />
        </div>
        <div className="sdp__body">
          <div className="sdp__left-skeleton">
            {[1,2,3,4].map(i => (
              <div key={i} className="skeleton" style={{ height: 22, borderRadius: 6, marginBottom: 24, width: `${70 + i * 5}%` }} />
            ))}
          </div>
          <div className="sdp__right-wrap">
            <div className="skeleton sdp__panel-skeleton" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════ */
export default function SdSectionProblems() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [leftVisible, setLeftVisible] = useState(false);
  const [rightVisible, setRightVisible] = useState(false);
  const bodyRef = useRef(null);

  /* ── Fetch ── */
  useEffect(() => {
    let cancelled = false;
    getSdSectionProblems()
      .then((d)  => { if (!cancelled) setData(d); })
      .catch(()  => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  /* ── IntersectionObserver on the body row ── */
  useEffect(() => {
    if (loading || !bodyRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Start left panel animation
          setLeftVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(bodyRef.current);
    return () => obs.disconnect();
  }, [loading]);

  /* ── Sequential animation: Right panel starts AFTER left completes ── */
  useEffect(() => {
    if (leftVisible) {
      // Calculate total left animation time:
      // Container: 800ms + longest item delay (4 items × 80ms = 320ms) + item duration 600ms = 1720ms
      // Add small buffer for safety: 1800ms
      const timer = setTimeout(() => {
        setRightVisible(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [leftVisible]);

  if (loading) return <Skeleton />;
  if (!data)   return null;

  const problems  = Array.isArray(data.problems_list)  ? data.problems_list  : [];
  const solutions = Array.isArray(data.solutions_list) ? data.solutions_list : [];
  const logoSrc   = data.center_image || FALLBACK_LOGO;

  return (
    <section className="sdp" aria-label={data.title || "Problems Section"}>
      <div className="sdp-container">

        {/* ══ HEADER ══ */}
        <div className="sdp__header">
          {data.badge_text && (
            <div className="badge-sec">
              <StarIcon />
              <span>{data.badge_text}</span>
            </div>
          )}
          {data.title && <h2 className="head-title">{data.title}</h2>}
          {data.description && <p className="head__desc">{data.description}</p>}
        </div>

        {/* ══ BODY ROW ══ */}
        <div className="sdp__body" ref={bodyRef}>

          {/* ── LEFT: problems list ── */}
          <ul
            className={`sdp__problems${leftVisible ? " sdp__problems--in" : ""}`}
            aria-label="Problems"
          >
            {problems.map((item, i) => (
              <li
                key={i}
                className="sdp__problem-item"
                style={{ transitionDelay: `${i * 0.08}s` }}
              >
                <span className="sdp__dot" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* ── RIGHT WRAP: logo + blue panel together ── */}
          <div className={`sdp__right-wrap${rightVisible ? " sdp__right-wrap--in" : ""}`}>

            {/* Center logo card — overlaps left edge of blue panel */}
            <div className="sdp__logo-card" aria-hidden="true">
              <img
                src={logoSrc}
                alt=""
                className="sdp__logo"
                loading="lazy"
              />
            </div>

            {/* Blue solutions panel */}
            <div className="sdp__solutions-panel" aria-label="Solutions">
              <ul className="sdp__solutions">
                {solutions.map((item, i) => (
                  <li
                    key={i}
                    className="sdp__solution-item"
                    style={{ transitionDelay: `${i * 0.08}s` }}
                  >
                    <CheckIcon />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
