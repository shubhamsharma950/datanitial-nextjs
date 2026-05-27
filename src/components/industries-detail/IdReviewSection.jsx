/**
 * IdReviewSection.jsx  —  Industries Detail / Section 2
 *
 * ACF path: review_section (Group)
 *   title            — Text
 *   description      — Text Area
 *   cta              — Link  { title, url, target }
 *   lists            — Text Area  (newline-separated pill tags)
 *   background_image — Image (full ACF image object → .url)
 *
 * Animation sequence on scroll-enter:
 *   1. BG image fades in + slow de-zoom  (0s)
 *   2. Dark overlay fades in             (0.6s delay)
 *   3. Left content slides up            (0.8s delay)
 *   4. Pills stagger in one by one       (1.0s–1.4s delay)
 *
 * Pill layout (pyramid):
 *   Row 1:  [pill1]
 *   Row 2:  [pill2]  [pill3]
 *   Row 3:  [pill4]  [pill5]
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchIndustriesDetailPage, resolveImg } from "./industriesDetailApi";
import "./IdReviewSection.css";

/* Split flat pills array into pyramid rows: 1, 2, 2 */
function buildRows(pills) {
  const rows = [];
  if (pills.length === 0) return rows;
  rows.push([pills[0]]);                                    // row 1: 1 pill
  if (pills.length > 1) rows.push(pills.slice(1, 3));      // row 2: 2 pills
  if (pills.length > 3) rows.push(pills.slice(3, 5));      // row 3: 2 pills
  if (pills.length > 5) rows.push(pills.slice(5));         // overflow
  return rows;
}

export default function IdReviewSection() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const sectionRef            = useRef(null);

  /* ── Fetch ── */
  useEffect(() => {
    let cancelled = false;

    fetchIndustriesDetailPage()
      .then(async (acf) => {
        const s = acf?.review_section ?? {};

        const bgImg = await resolveImg(s.background_image);

        const lists = s.lists
          ? s.lists.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
          : [];

        if (!cancelled) {
          setData({
            title:       s.title       || "",
            description: s.description || "",
            cta:         s.cta         || null,
            lists,
            bgImg,
          });
        }
      })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  /* ── Scroll-reveal ── */
  useEffect(() => {
    if (loading || !sectionRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          sectionRef.current?.classList.add("idr--visible");
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [loading]);

  if (loading || !data) return null;

  const ctaHref    = data.cta?.url    || "#";
  const ctaLabel   = data.cta?.title  || "Contact us";
  const ctaTarget  = data.cta?.target || "_self";
  const isExternal = ctaHref.startsWith("http");

  /* flat pills list → pill elements (keyed globally for nth-child stagger) */
  const pillEls = data.lists.map((item, idx) => (
    <span key={idx} className="idr__pill">{item}</span>
  ));

  const rows = buildRows(data.lists);

  return (
    <section
      className="idr"
      ref={sectionRef}
      aria-label={data.title || "Review & Ratings"}
    >
      {/* 1. Background image */}
      {data.bgImg && (
        <div
          className="idr__bg"
          style={{ backgroundImage: `url(${data.bgImg})` }}
          aria-hidden="true"
        />
      )}

      {/* 2. Dark overlay (delayed) */}
      <div className="idr__overlay" aria-hidden="true" />

      {/* 3. Content */}
      <div className="container">
        <div className="idr__inner">

          {/* LEFT */}
          <div className="idr__left">
            {data.title       && <h2 className="idr__title">{data.title}</h2>}
            {data.description && <p  className="idr__desc">{data.description}</p>}

            {data.cta && (
              isExternal ? (
                <a
                  href={ctaHref}
                  target={ctaTarget || "_blank"}
                  rel="noopener noreferrer"
                  className="idr__cta"
                >
                  {ctaLabel}
                </a>
              ) : (
                <Link to={ctaHref} className="idr__cta">{ctaLabel}</Link>
              )
            )}
          </div>

          {/* RIGHT — pyramid pill rows */}
          {rows.length > 0 && (
            <div className="idr__pills" aria-label="Topics">
              {rows.map((row, rIdx) => (
                <div key={rIdx} className="idr__pill-row">
                  {row.map((item, pIdx) => {
                    /* global pill index for nth-child stagger */
                    const globalIdx = data.lists.indexOf(item, rIdx > 0 ? rIdx : 0);
                    return (
                      <span key={pIdx} className="idr__pill">{item}</span>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
