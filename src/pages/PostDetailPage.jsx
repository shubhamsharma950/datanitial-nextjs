/**
 * PostDetailPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Single detail page for both Blog posts and Case Studies.
 * Route params:
 *   /blog/:slug          → type="blog"
 *   /case-studies/:slug  → type="case-study"
 *
 * Layout (matches design):
 *   • InnerPageHeader (same nav as all inner pages)
 *   • Article area:
 *       - Published date badge
 *       - Title
 *       - Subtitle / excerpt
 *       - Featured image
 *       - Full WP content (rendered HTML)
 *   • Related section:
 *       - "Related Articles" (blog) or "Related Case Studies" (case-study)
 *       - 3-column card grid, queried by same tags → categories → latest
 *       - Load More button
 */

import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import InnerPageHeader from "./InnerPageHeader";
import {
  fetchBlogPostBySlug,
  fetchCaseStudyBySlug,
  fetchRelatedBlogPosts,
  fetchRelatedCaseStudies,
  formatDate,
} from "../components/resources/resourcesApi";
import "./PostDetailPage.css";

/* ── Extract first wp-block-heading h4 text from WP HTML content ── */
function extractFirstH4Heading(html) {
  if (!html) return "";
  const parser = new DOMParser();
  const doc    = parser.parseFromString(html, "text/html");
  const el     = doc.querySelector("h4.wp-block-heading");
  return el ? el.textContent.trim() : "";
}


function ArticleSkeleton() {
  return (
    <div className="pdp__article-skeleton" aria-busy="true">
      <div className="skeleton" style={{ width: 180, height: 32, borderRadius: 999, margin: "0 auto 28px" }} />
      <div className="skeleton" style={{ width: "80%", height: 48, margin: "0 auto 16px" }} />
      <div className="skeleton" style={{ width: "60%", height: 28, margin: "0 auto 40px" }} />
      <div className="skeleton" style={{ width: "100%", height: 480, borderRadius: 16, marginBottom: 40 }} />
      {[1,2,3,4].map(i => (
        <div key={i} className="skeleton" style={{ width: i % 2 === 0 ? "90%" : "100%", height: 20, marginBottom: 12 }} />
      ))}
    </div>
  );
}

/* ── Related card ── */
function RelatedCard({ post, type }) {
  const to = `/${type === "blog" ? "blog" : "case-studies"}/${post.slug}`;

  return (
    <article className="pdp__rel-card" aria-label={post.title}>
      <div className="pdp__rel-card-img-wrap">
        {post.image ? (
          <img src={post.image} alt={post.title} className="pdp__rel-card-img" loading="lazy" />
        ) : (
          <div className="pdp__rel-card-img-placeholder" aria-hidden="true" />
        )}
      </div>
      <div className="pdp__rel-card-body">
        <div className="pdp__rel-meta">
          <span className="pdp__rel-meta-date">{formatDate(post.date)}</span>
          <span className="pdp__rel-meta-read">{post.readTime}</span>
        </div>
        <h3 className="pdp__rel-card-title">{post.title}</h3>
        <Link to={to} className="pdp__rel-card-link" aria-label={`Read more about ${post.title}`}>
          Read More…
        </Link>
      </div>
    </article>
  );
}

/* ── Related section skeleton ── */
function RelatedSkeleton() {
  return (
    <div className="pdp__related-grid">
      {[1, 2, 3].map(i => (
        <div key={i} className="pdp__rel-card pdp__rel-card--skeleton">
          <div className="skeleton pdp__rel-card-img-wrap" />
          <div className="pdp__rel-card-body">
            <div className="skeleton" style={{ width: "80%", height: 13, marginBottom: 10 }} />
            <div className="skeleton" style={{ width: "100%", height: 18, marginBottom: 6 }} />
            <div className="skeleton" style={{ width: "90%", height: 18, marginBottom: 16 }} />
            <div className="skeleton" style={{ width: 90, height: 14 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════ */
export default function PostDetailPage({ type = "blog" }) {
  const { slug } = useParams();

  /* ── Article state ── */
  const [post,        setPost]        = useState(null);
  const [postLoading, setPostLoading] = useState(true);
  const [notFound,    setNotFound]    = useState(false);

  /* ── Related state ── */
  const [related,      setRelated]      = useState([]);
  const [relPage,      setRelPage]      = useState(1);
  const [relTotal,     setRelTotal]     = useState(1);
  const [relLoading,   setRelLoading]   = useState(true);
  const [relLoadMore,  setRelLoadMore]  = useState(false);

  /* ── Fetch main post ── */
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setPostLoading(true);
    setNotFound(false);

    const fetcher = type === "blog" ? fetchBlogPostBySlug : fetchCaseStudyBySlug;

    fetcher(slug)
      .then((p) => {
        if (cancelled) return;
        if (!p) { setNotFound(true); return; }
        setPost(p);
      })
      .catch(() => { if (!cancelled) setNotFound(true); })
      .finally(() => { if (!cancelled) setPostLoading(false); });

    return () => { cancelled = true; };
  }, [slug, type]);

  /* ── Fetch related posts once main post is loaded ── */
  useEffect(() => {
    if (!post) return;
    let cancelled = false;
    setRelLoading(true);

    const opts = {
      excludeId:  post.id,
      tags:       post.tags,
      categories: post.categories,
      page:       1,
    };

    const fetcher = type === "blog" ? fetchRelatedBlogPosts : fetchRelatedCaseStudies;

    fetcher(opts)
      .then(({ posts: p, totalPages: tp }) => {
        if (cancelled) return;
        setRelated(p);
        setRelTotal(tp);
        setRelPage(1);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setRelLoading(false); });

    return () => { cancelled = true; };
  }, [post, type]);

  /* ── Load more related ── */
  const handleRelLoadMore = useCallback(() => {
    if (!post) return;
    const nextPage = relPage + 1;
    setRelLoadMore(true);

    const opts = {
      excludeId:  post.id,
      tags:       post.tags,
      categories: post.categories,
      page:       nextPage,
    };

    const fetcher = type === "blog" ? fetchRelatedBlogPosts : fetchRelatedCaseStudies;

    fetcher(opts)
      .then(({ posts: morePosts }) => {
        setRelated((prev) => [...prev, ...morePosts]);
        setRelPage(nextPage);
      })
      .catch(() => {})
      .finally(() => setRelLoadMore(false));
  }, [post, relPage, type]);

  /* ── Scroll to top on slug change ── */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  /* ── Add body.inner-page to hide the global site header ── */
  useEffect(() => {
    document.body.classList.add("inner-page");
    return () => document.body.classList.remove("inner-page");
  }, []);

  const relLabel = type === "blog" ? "Related Articles" : "Related Case Studies";
  const hasMoreRelated = relPage < relTotal;

  return (
    <div className="pdp">
      {/* ── Header (same as all inner pages) ── */}
      <div className="pdp__header-wrap">
        <InnerPageHeader />
      </div>

      {/* ── Main content ── */}
      <main className="pdp__main" id="main-content">
        <div className="pdp__container">

          {postLoading ? (
            <ArticleSkeleton />
          ) : notFound ? (
            <div className="pdp__not-found">
              <h1>Post not found</h1>
              <p>The article you're looking for doesn't exist or has been removed.</p>
              <a href="/resources" className="pdp__back-link">← Back to Resources</a>
            </div>
          ) : post ? (
            <article className="pdp__article" aria-label={post.title}>

            <div className="pdp_head">
              {/* Published date badge */}
              <div className="pdp__date-badge">
                Published {formatDate(post.date)}
              </div>

              {/* Title */}
              <h1 className="pdp__title">{post.title}</h1>
                 {/* Excerpt / subtitle */}
              {/* {post.excerpt && (
                <p className="pdp__subtitle">{post.excerpt}</p>

              {/* First wp-block-heading h4 from content — used as subtitle */}
              {extractFirstH4Heading(post.content) && (
                <h4 className="pdp__subtitle">
                  {extractFirstH4Heading(post.content)}
                </h4>
              )}
            </div>

              {/* Featured image */}
              {post.image && (
                <div className="pdp__hero-img-wrap">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="pdp__hero-img"
                    loading="eager"
                  />
                </div>
              )}

              {/* Full WP content */}
              {post.content && (
                <div
                  className="pdp__content wp-content"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              )}

            </article>
          ) : null}

        </div>
      </main>

      {/* ── Related section ── */}
      {(post || relLoading) && (
        <section className="pdp__related" aria-label={relLabel}>
          {/* <div className="pdp__related-inner"> */}
          <div className="container">

            <h2 className="pdp__related-title">{relLabel}</h2>

            {relLoading ? (
              <RelatedSkeleton />
            ) : related.length > 0 ? (
              <>
                <div className="pdp__related-grid" role="list">
                  {related.map((p) => (
                    <div key={p.id} role="listitem">
                      <RelatedCard post={p} type={type} />
                    </div>
                  ))}
                </div>

                {hasMoreRelated && (
                  <div className="pdp__load-more-wrap">
                    <button
                      className="rs_page_btn"
                      onClick={handleRelLoadMore}
                      disabled={relLoadMore}
                      aria-label={`Load more ${relLabel.toLowerCase()}`}
                    >
                      {relLoadMore ? "Loading…" : "Load More"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="pdp__related-empty">No related posts found.</p>
            )}

          </div>
        </section>
      )}
    </div>
  );
}
