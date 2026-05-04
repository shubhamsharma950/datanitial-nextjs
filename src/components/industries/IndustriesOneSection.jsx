/**
 * IndustriesOneSection.jsx  —  Section 1
 *
 * ACF path: section_one (Group)
 *   badge_text, title, description,
 *   image_one  — square photo (top-left)
 *   image_two  — tall photo  (right of image_one, full height)
 *   stat_number, stat_description
 *
 * Layout (matches design):
 *
 *   ┌─────────────────────────────┬──────────────────────────────┐
 *   │  [img_one  ]  [             │  badge                       │
 *   │  [square   ]  [ img_two    ]│  title                       │
 *   │  ──────────   [ tall       ]│  description                 │
 *   │  [stat card]  [            ]│                              │
 *   └─────────────────────────────┴──────────────────────────────┘
 *
 *   Left half  = sub-grid: col-A (img_one + stat card stacked) | col-B (img_two tall)
 *   Right half = badge + heading + description
 */

import { useEffect, useRef, useState } from "react";
import { fetchIndustriesPage, resolveImg } from "./industriesApi";
import "./IndustriesOneSection.css";

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

function Skeleton() {
  return (
    <section className="ind1">
      <div className="container">
        <div className="ind1__inner">
          <div className="ind1__images">
            <div className="ind1__col-a">
              <div className="skeleton ind1__img-one" />
              <div className="skeleton ind1__stat-card" style={{ height: 130 }} />
            </div>
            <div className="skeleton ind1__col-b" />
          </div>
          <div className="ind1__content">
            <div className="skeleton" style={{ width: 140, height: 32, borderRadius: 999, marginBottom: 24 }} />
            <div className="skeleton" style={{ width: "85%", height: 48, marginBottom: 10 }} />
            <div className="skeleton" style={{ width: "90%", height: 18, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: "75%", height: 18 }} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function IndustriesOneSection() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const sectionRef            = useRef(null);

  /* ── Fetch ── */
  useEffect(() => {
    let cancelled = false;
    fetchIndustriesPage()
      .then(async (acf) => {
        const s = acf?.section_one ?? {};
        const [imgOne, imgTwo] = await Promise.all([
          resolveImg(s.image_one),
          resolveImg(s.image_two),
        ]);
        if (!cancelled) {
          setData({
            badge:           s.badge_text       || "WHY CHOOSE US",
            title:           s.title            || "",
            description:     s.description      || "",
            imgOne,
            imgOneAlt:       s.image_one?.alt   || "Industries",
            imgTwo,
            imgTwoAlt:       s.image_two?.alt   || "Industries",
            statNumber:      s.stat_number      || "",
            statDescription: s.stat_description || "",
          });
        }
      })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  /* ── Scroll reveal ── */
  useEffect(() => {
    if (loading || !sectionRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          sectionRef.current?.classList.add("ind1--visible");
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [loading]);

  if (loading) return <Skeleton />;
  if (!data)   return null;

  return (
    <section className="ind1" ref={sectionRef} aria-label="Built for Scale — Industries">
      <div className="container">
        <div className="ind1__inner">

          {/* ══ LEFT HALF: two-column image block ══ */}
          <div className="ind1__images">

            {/* Col A: image_one (square) + stat card stacked */}
            <div className="ind1__col-a">

              {/* image_one — square photo */}
              <div className="ind1__img-one">
                {data.imgOne
                  ? <img src={data.imgOne} alt={data.imgOneAlt} className="ind1__img" loading="lazy" />
                  : <div className="ind1__img-placeholder" aria-hidden="true" />
                }
              </div>

              {/* Stat card — separate card below image_one */}
              {(data.statNumber || data.statDescription) && (
                <div className="ind1__stat-card">
                  {data.statNumber      && <span className="ind1__stat-num">{data.statNumber}</span>}
                  {data.statDescription && <p    className="ind1__stat-desc">{data.statDescription}</p>}
                </div>
              )}

            </div>

            {/* Col B: image_two — tall, full height */}
            <div className="ind1__col-b">
              {data.imgTwo
                ? <img src={data.imgTwo} alt={data.imgTwoAlt} className="ind1__img" loading="lazy" />
                : <div className="ind1__img-placeholder" aria-hidden="true" />
              }
            </div>

          </div>

          {/* ══ RIGHT HALF: badge + title + description ══ */}
          <div className="ind1__content">
            <div class="faq-badge"><span class="faq-badge__icon" aria-hidden="true"></span><span class="faq-badge__label">{data.badge}</span></div>

            {data.title       && <h2 className="ind1__title head-title">{data.title}</h2>}
            {data.description && <p  className="ind1__desc head__desc">{data.description}</p>}
          </div>

        </div>
      </div>
    </section>
  );
}
