/**
 * SdSectionOne.jsx  —  components/solution-detail/
 * ─────────────────────────────────────────────────────────────────────────────
 * Section 1: Centred badge + title + description header block.
 *
 * ACF path: acf.section_one
 *   badge_text   → pill badge
 *   title        → <h2>
 *   description  → <p>
 *  image   ->  image
 *
 * Data source: getSdSectionOne() from solutionsDetailApi.js
 */

import { useEffect, useRef, useState } from "react";
import { getSdSectionOne } from "./solutionsDetailApi";
import "./SdSectionOne.css";

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
    <section className="sd-s1">
      <div className="container">
        <div className="sd-s1__header">
          <div className="skeleton" style={{ width: 200, height: 36, borderRadius: 999, margin: "0 auto 20px" }} />
          <div className="skeleton" style={{ width: "55%", height: 52, margin: "0 auto 16px" }} />
          <div className="skeleton" style={{ width: "70%", height: 22, margin: "0 auto 32px" }} />
          <div className="skeleton" style={{ width: "100%", height: 360, borderRadius: 12, margin: "0 auto" }} />
        </div>
      </div>
    </section>
  );
}

/* ── Main component ── */
export default function SdSectionOne() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  /* ── Fetch ── */
  useEffect(() => {
    let cancelled = false;
    getSdSectionOne()
      .then((d)  => { if (!cancelled) setData(d); })
      .catch(()  => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  /* ── Scroll reveal ── */
  useEffect(() => {
    if (loading || !sectionRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [loading]);

  if (loading) return <Skeleton />;
  if (!data)   return null;

  return (
    <section
      className="sd-s1"
      ref={sectionRef}
      aria-label={data.title || "Solution Detail Section One"}
    >
      <div className="container">
        <div className={`sd-s1__header${visible ? " sd-s1__header--visible" : ""}`}>
          {data.badge_text && (
            <div className="badge-sec">
              <StarIcon />
              <span>{data.badge_text}</span>
            </div>
          )}
          {data.title && (
            <h2 className="sd-s1__title head-title">{data.title}</h2>
          )}
          {data.description && (
            <p
              className="sd-s1__desc head__desc"
              dangerouslySetInnerHTML={{ __html: data.description }}
            />
          )}
          {data.image && (
            <div className="sd-s1__image-wrapper">
              <img
                src={data.image}
                alt={data.title || "Solution detail"}
                className="sd-s1__image"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}