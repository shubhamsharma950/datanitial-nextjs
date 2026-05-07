/**
 * ResourcesSectionOne.jsx  —  components/resources/
 * ─────────────────────────────────────────────────────────────────────────────
 * Section 1: Featured Resource Card
 *
 * Layout:
 *   • Centred header: badge + title + description (from ACF page 17)
 *   • Large horizontal featured card:
 *       - Left: post image with "Featured" badge overlay
 *       - Right: date, read time, title, excerpt, Read More button
 *
 * Data: getSectionOne() from resourcesApi.js
 *   - ACF meta from page 17 → section_one
 *   - Post from WP category "Featured"
 */

import { useEffect, useState } from "react";
import { getSectionOne, formatDate } from "./resourcesApi";
import "./ResourcesSectionOne.css";

/* ── Star badge icon ── */
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
    <section className="rs1">
      <div className="rs1__container">
        <div className="rs1__header">
          <div className="skeleton" style={{ width: 200, height: 36, borderRadius: 999, margin: "0 auto 20px" }} />
          <div className="skeleton" style={{ width: "50%", height: 48, margin: "0 auto 14px" }} />
          <div className="skeleton" style={{ width: "65%", height: 22, margin: "0 auto" }} />
        </div>
        <div className="skeleton rs1__card-skeleton" />
      </div>
    </section>
  );
}

/* ── Featured card ── */
function FeaturedCard({ post }) {
  const link = post.slug ? `/blog/${post.slug}` : "#";

  return (
   <a href={link}>
     <article className="rs1__card" aria-label={`Featured: ${post.title}`}>
      {/* Image side */}
      <div className="rs1__card-img-wrap">
        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            className="rs1__card-img"
            loading="eager"
          />
        ) : (
          <div className="rs1__card-img-placeholder" aria-hidden="true" />
        )}
        <span className="rs1__featured-badge">Featured</span>
      </div>

      {/* Content side */}
      <div className="rs1__card-content">
        <div className="rs1__meta">
          <span className="rs1__meta-date">{formatDate(post.date)}</span>
          <span className="rs1__meta-read">{post.readTime}</span>
        </div>
        <h2 className="rs1__card-title">{post.title}</h2>
        {post.excerpt && (
          <p className="rs1__card-excerpt">
            {post.excerpt.length > 260
              ? post.excerpt.slice(0, 260) + "…"
              : post.excerpt}
          </p>
        )}
        <a
          href={link}
          className="rs_page_btn"
          aria-label={`Read more about ${post.title}`}
        >
          Read More
        </a>
      </div>
    </article>
   </a>
  );
}

/* ── Main component ── */
export default function ResourcesSectionOne() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getSectionOne()
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <Skeleton />;
  if (!data)   return null;

  const { meta, post } = data;

  return (
    <section className="rs1" aria-label="Featured Resources">
      <div className="rs1__container">

        {/* ── Header ── */}
        <header className="rs1__header">
          <div className="badge-sec">
            <StarIcon />
            <span>{meta.badge_text}</span>
          </div>
          <h1 className="rs1__title head-title">{meta.title}</h1>
          {meta.description && (
            <p className="rs1__desc head__desc">{meta.description}</p>
          )}
        </header>

        {/* ── Featured card ── */}
        {post ? (
          <FeaturedCard post={post} />
        ) : (
          <p className="rs1__empty">No featured post found.</p>
        )}

      </div>
    </section>
  );
}
