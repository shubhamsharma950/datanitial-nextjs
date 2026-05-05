/**
 * ResourcesSectionTwo.jsx  —  components/resources/
 * ─────────────────────────────────────────────────────────────────────────────
 * Section 2: Latest Blog Posts Grid
 *
 * Layout:
 *   • White background
 *   • Centred header: badge + title + description  ← from ACF page 17 → section_two
 *   • 3-column card grid (image · date · read time · title · Read More)
 *   • "Load More" button — appends next page of posts without re-fetching meta
 *
 * API calls:
 *   Mount  → getSectionTwoMeta()  (ACF, once)
 *          + fetchBlogPosts(1)    (posts page 1)
 *   Click  → fetchBlogPosts(N)    (posts only — no ACF re-fetch)
 */

import { useEffect, useState, useCallback } from "react";
import { getSectionTwoMeta, fetchBlogPosts, formatDate } from "./resourcesApi";
import "./ResourcesSectionTwo.css";

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
    <section className="rs2">
      <div className="rs2__container">
        <div className="rs2__header">
          <div className="skeleton" style={{ width: 160, height: 36, borderRadius: 999, margin: "0 auto 20px" }} />
          <div className="skeleton" style={{ width: "50%", height: 48, margin: "0 auto 14px" }} />
          <div className="skeleton" style={{ width: "70%", height: 22, margin: "0 auto" }} />
        </div>
        <div className="rs2__grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rs2__card rs2__card--skeleton">
              <div className="skeleton rs2__card-img-wrap" />
              <div className="rs2__card-body">
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

/* ── Single blog card ── */
function BlogCard({ post }) {
  const link = post.slug ? `/blog/${post.slug}` : "#";

  return (
    <article className="rs2__card" aria-label={post.title}>
      {/* Image */}
      <div className="rs2__card-img-wrap">
        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            className="rs2__card-img"
            loading="lazy"
          />
        ) : (
          <div className="rs2__card-img-placeholder" aria-hidden="true" />
        )}
      </div>

      {/* Body */}
      <div className="rs2__card-body">
        <div className="rs2__meta">
          <span className="rs2__meta-date">{formatDate(post.date)}</span>
          <span className="rs2__meta-read">{post.readTime}</span>
        </div>
        <h3 className="rs2__card-title">{post.title}</h3>
        <a
          href={link}
          className="rs2__card-link"
          aria-label={`Read more about ${post.title}`}
        >
          Read More…
        </a>
      </div>
    </article>
  );
}

/* ── Main component ── */
export default function ResourcesSectionTwo() {
  const [meta,        setMeta]        = useState(null);
  const [posts,       setPosts]       = useState([]);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  /* ── Mount: fetch ACF meta + first page of posts in parallel ── */
  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getSectionTwoMeta(),
      fetchBlogPosts(1),
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

  /* ── Load More: posts only — ACF meta is NOT re-fetched ── */
  const handleLoadMore = useCallback(() => {
    const nextPage = page + 1;
    setLoadingMore(true);

    fetchBlogPosts(nextPage)
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
    <section className="rs2" aria-label="Latest Blog Posts">
      <div className="rs2__container">

        {/* ── Header (dynamic from ACF) ── */}
        <header className="rs2__header">
          <div className="badge-sec">
            <StarIcon />
            <span>{meta.badge_text}</span>
          </div>
          <h2 className="rs2__title head-title">{meta.title}</h2>
          {meta.description && (
            <p className="rs2__desc head__desc">{meta.description}</p>
          )}
        </header>

        {/* ── Posts grid ── */}
        {posts.length > 0 ? (
          <div className="rs2__grid" role="list" aria-label="Blog articles">
            {posts.map((post) => (
              <div key={post.id} role="listitem">
                <BlogCard post={post} />
              </div>
            ))}
          </div>
        ) : (
          <p className="rs2__empty">No blog posts found.</p>
        )}

        {/* ── Load More ── */}
        {hasMore && (
          <div className="rs2__load-more-wrap">
            <button
              // className="rs2__load-more-btn"
              className="rs_page_btn"
              onClick={handleLoadMore}
              disabled={loadingMore}
              aria-label="Load more blog posts"
            >
              {loadingMore ? "Loading…" : "Load More"}
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
