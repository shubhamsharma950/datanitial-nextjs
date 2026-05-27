/**
 * IdSectionTwo.jsx  —  Industries Detail / Section 2
 *
 * ACF path: section_two (Group)
 *   left_side (Group)
 *     title  — Text
 *     des    — Text Area
 *     list   — Text Area  (newline-separated bullet items)
 *   right_side (Group)
 *     bg_image    — Image  (person photo background)
 *     badge_lists — Text Area  (newline-separated badge labels)
 *
 * Layout:
 *   Full viewport height section.
 *   Two separate rounded cards with a gap between them.
 *   LEFT  — light blue, title + desc + bullets
 *           Animates: slides from right → left + fade on scroll enter
 *   RIGHT — dark purple + bg image, badges anchored top-left
 *           Animates: slides from left → right + fade
 */

import { useEffect, useRef, useState } from "react";
import { fetchIndustriesDetailPage, resolveImg } from "./industriesDetailApi";
import "./IdSectionTwo.css";

/* ── Star icon inside badge ── */
const BadgeIcon = () => (
  <span className="ids2__badge-icon" aria-hidden="true">
    <svg viewBox="0 0 18 18" fill="none" width="14" height="14">
      <circle cx="9" cy="9" r="9" fill="rgb(35 30 118)" />
      <g stroke="#fff" strokeWidth="1.6" strokeLinecap="round">
        <line x1="9" y1="4.5" x2="9" y2="13.5" />
        <line x1="5.5" y1="6.5" x2="12.5" y2="11.5" />
        <line x1="12.5" y1="6.5" x2="5.5" y2="11.5" />
      </g>
    </svg>
  </span>
);

/* ── Skeleton ── */
function Skeleton() {
  return (
    <section className="ids2">
      <div className="container">
        <div className="ids2__grid">
          <div className="skeleton ids2__card" style={{ minHeight: 480 }} />
          <div className="skeleton ids2__card" style={{ minHeight: 480 }} />
        </div>
      </div>
    </section>
  );
}

export default function IdSectionTwo() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const leftRef               = useRef(null);
  const rightRef              = useRef(null);

  /* ── Fetch ── */
  useEffect(() => {
    let cancelled = false;
    fetchIndustriesDetailPage()
      .then(async (acf) => {
        const s  = acf?.section_two ?? {};
        const ls = s?.left_side     ?? {};
        const rs = s?.right_side    ?? {};

        const bgImg = await resolveImg(rs.bg_image);

        const listItems = ls.list
          ? ls.list.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
          : [];

        const badges = rs.badge_lists
          ? rs.badge_lists.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
          : [];

        if (!cancelled) {
          setData({ title: ls.title || "", des: ls.des || "", listItems, bgImg, badges });
        }
      })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  /* ── Scroll reveal — only left card animates ── */
  useEffect(() => {
    if (loading) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("ids2__card--visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    if (leftRef.current) obs.observe(leftRef.current);
    // rightRef not observed — right card has no animation
    return () => obs.disconnect();
  }, [loading]);

  if (loading) return <Skeleton />;
  if (!data)   return null;

  return (
    <section className="ids2" aria-label={data.title || "Brand Monitoring"}>
      <div className="container">
        <div className="ids2__grid">

          {/* ══ LEFT CARD ══ */}
          <div className="ids2__card ids2__card--left" ref={leftRef}>
            {data.title && <h2 className="ids2__left-title">{data.title}</h2>}
            {data.des   && <p  className="ids2__left-des">{data.des}</p>}
            {data.listItems.length > 0 && (
              <ul className="ids2__list">
                {data.listItems.map((item, i) => (
                  <li key={i} className="ids2__list-item">{item}</li>
                ))}
              </ul>
            )}
          </div>

          {/* ══ RIGHT CARD ══ */}
          <div
            className="ids2__card ids2__card--right"
            ref={rightRef}
            style={data.bgImg ? { backgroundImage: `url(${data.bgImg})` } : {}}
          >
            {/* Gradient overlay */}
            <div className="ids2__right-overlay" aria-hidden="true" />

            {/* Badges — top-left */}
            {data.badges.length > 0 && (
              <div className="ids2__badges">
                {data.badges.map((badge, i) => (
                  <span key={i} className="ids2__badge">
                    <BadgeIcon />
                    <span>{badge}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
