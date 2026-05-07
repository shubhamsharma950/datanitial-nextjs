/**
 * ResourcesSectionThree.jsx  —  components/resources/
 * ─────────────────────────────────────────────────────────────────────────────
 * Section 3: Case Studies Grid
 *
 * Layout:
 *   • Light blue-grey background
 *   • Centred header: badge + title + description  ← from ACF page 17 → section_three
 *   • 3-column card grid (image · date · read time · title · Read More)
 *   • "Load More" button — appends next page without re-fetching meta
 *
 * API calls:
 *   Mount  → getSectionThreeMeta()  (ACF, once)
 *          + fetchCaseStudies(1)     (CPT posts page 1)
 *   Click  → fetchCaseStudies(N)    (posts only — no ACF re-fetch)
 *
 * CPT REST base: tries "case-studie" → "case-studies" → "case_studies"
 * (matches whatever slug WP registered the post type with)
 */

import { useEffect, useState, useCallback } from "react";
import { getSectionThreeMeta, fetchCaseStudies, formatDate } from "./resourcesApi";
import "./ResourcesSectionThree.css";

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
    <section className="rs3">
      <div className="rs3__container">
        <div className="rs3__header">
          <div className="skeleton" style={{ width: 180, height: 36, borderRadius: 999, margin: "0 auto 20px" }} />
          <div className="skeleton" style={{ width: "50%", height: 48, margin: "0 auto 14px" }} />
          <div className="skeleton" style={{ width: "70%", height: 22, margin: "0 auto" }} />
        </div>
        <div className="rs3__grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rs3__card rs3__card--skeleton">
              <div className="skeleton rs3__card-img-wrap" />
              <div className="rs3__card-body">
                <div className="skeleton" style={{ width: "80%", height: 13, marginBottom: 10 }} />
                <div className="skeleton" style={{ width: "100%", height: 18, marginBottom: 6 }} />
                <div className="skeleton" style={{ width: "90%", height: 18, marginBottom: 16 }} />
                <div className="skeleton" style={{ width: 90, height: 14 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Single case study card ── */
function CaseStudyCard({ post }) {
  const link = post.slug ? `/case-studies/${post.slug}` : "#";

  return (
    <article className="rs3__card" aria-label={post.title}>
      {/* Image */}
      <div className="rs3__card-img-wrap">
        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            className="rs3__card-img"
            loading="lazy"
          />
        ) : (
          <div className="rs3__card-img-placeholder" aria-hidden="true" />
        )}
      </div>

      {/* Body */}
      <div className="rs3__card-body">
        <div className="rs3__meta">
          <span className="rs3__meta-date">{formatDate(post.date)}</span>
          <span className="rs3__meta-read">{post.readTime}</span>
        </div>
        <h3 className="rs3__card-title">{post.title}</h3>
        <a
          href={link}
          className="rs3__card-link"
          aria-label={`Read more about ${post.title}`}
        >
          Read More…
        </a>
      </div>
    </article>
  );
}

/* ── Main component ── */
export default function ResourcesSectionThree() {
  const [meta,        setMeta]        = useState(null);
  const [posts,       setPosts]       = useState([]);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  /* ── Mount: fetch ACF meta + first page of case studies in parallel ── */
  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getSectionThreeMeta(),
      fetchCaseStudies(1),
    ])
      .then(([m, { posts: p, totalPages: tp }]) => {
        if (cancelled) return;
        setMeta(m);
        setPosts(p);
        setTotalPages(tp);
      })
      .catch(() => {
        if (!cancelled) setMeta(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  /* ── Load More: case studies only — ACF meta is NOT re-fetched ── */
  const handleLoadMore = useCallback(() => {
    const nextPage = page + 1;
    setLoadingMore(true);

    fetchCaseStudies(nextPage)
      .then(({ posts: morePosts }) => {
        setPosts((prev) => [...prev, ...morePosts]);
        setPage(nextPage);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  }, [page]);

  if (loading) return <Skeleton />;
  if (!meta)   return null;

  const hasMore = page < totalPages;

  return (
    <section className="rs3" aria-label="Case Studies">
      <div className="rs3__container">

        {/* ── Header (dynamic from ACF) ── */}
        <header className="rs3__header">
          <div className="badge-sec">
            <StarIcon />
            <span>{meta.badge_text}</span>
          </div>
          <h2 className="rs3__title head-title">{meta.title}</h2>
          {meta.description && (
            <p className="rs3__desc head__desc">{meta.description}</p>
          )}
        </header>

        {/* ── Case studies grid ── */}
        {posts.length > 0 ? (
          <div className="rs3__grid" role="list" aria-label="Case studies">
            {posts.map((post) => (
              <div key={post.id} role="listitem">
                <CaseStudyCard post={post} />
              </div>
            ))}
          </div>
        ) : (
          <p className="rs3__empty">No case studies found.</p>
        )}

        {/* ── Load More ── */}
        {hasMore && (
          <div className="rs3__load-more-wrap">
            <button
              className="rs_page_btn"
              onClick={handleLoadMore}
              disabled={loadingMore}
              aria-label="Load more case studies"
            >
              {loadingMore ? "Loading…" : "Load More"}
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
