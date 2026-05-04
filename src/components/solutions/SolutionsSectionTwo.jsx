/**
 * SolutionsSectionTwo.jsx  —  components/solutions/
 * ─────────────────────────────────────────────────────────────────────────────
 * Section 2: "More Than Just Data Access"
 *
 * ACF path: acf.section_two (Group)
 *   title             → Text          → <h2>
 *   description       → Text Area     → <p>
 *   bullet_point_list → Text Area     → newline-separated → <ul> bullet list
 *   image             → Image field   → right-side photo
 *
 * Layout: 50/50 two-column split
 *   Left  → title, description, bullet list
 *   Right → full-bleed image with rounded corners
 *
 * Data source: getSectionTwo() from solutionsApi.js
 * Animations:  CSS scroll-reveal via IntersectionObserver (no extra deps)
 */

import { useEffect, useRef, useState } from "react";
import { getSectionTwo } from "./solutionsApi";
import "./SolutionsSectionTwo.css";

/* ── Bullet dot icon ── */
const BulletIcon = () => (
  <svg
    className="sol2__bullet-icon"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="10" cy="10" r="10" fill="var(--primary)" opacity="0.12" />
    <circle cx="10" cy="10" r="4"  fill="var(--primary)" />
  </svg>
);

/* ── Skeleton ── */
function Skeleton() {
  return (
    <section className="sol2">
      <div className="container">
        <div className="sol2__body">
          <div className="sol2__left">
            <div className="skeleton" style={{ width: "72%", height: 52, marginBottom: 20 }} />
            <div className="skeleton" style={{ width: "90%", height: 20, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: "80%", height: 20, marginBottom: 28 }} />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton" style={{ width: "60%", height: 18, marginBottom: 12 }} />
            ))}
          </div>
          <div className="skeleton sol2__img-skeleton" />
        </div>
      </div>
    </section>
  );
}

/* ── Main component ── */
export default function SolutionsSectionTwo() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  /* ── Fetch ── */
  useEffect(() => {
    let cancelled = false;
    getSectionTwo()
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
      { threshold: 0.1 }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [loading]);

  if (loading) return <Skeleton />;
  if (!data)   return null;

  const bullets = Array.isArray(data.bullet_points) ? data.bullet_points : [];

  return (
    <section
      className={`sol2${visible ? " sol2--visible" : ""}`}
      ref={sectionRef}
      aria-label={data.title || "Solutions Section Two"}
    >
      <div className="container">
        <div className="sol2__body">

          {/* ── Left: title + description + bullet list ── */}
          <div className="sol2__left">
            {data.title && (
              <h2 className="sol2__title">{data.title}</h2>
            )}
            {data.description && (
              <p className="sol2__desc">{data.description}</p>
            )}
            {bullets.length > 0 && (
              <ul className="sol2__bullets" aria-label="Key features">
                {bullets.map((point, i) => (
                  <li key={i} className="sol2__bullet-item">
                    <BulletIcon />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ── Right: image ── */}
          <div className="sol2__img-wrap">
            {data.image ? (
              <img
                src={data.image}
                alt={data.title || "Solutions"}
                className="sol2__img"
                loading="lazy"
              />
            ) : (
              <div className="sol2__img-placeholder" />
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
