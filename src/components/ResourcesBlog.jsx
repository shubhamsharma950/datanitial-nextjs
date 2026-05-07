import { useEffect, useState } from "react";
import "./ResourcesBlog.css";

const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.NEXT_PUBLIC_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

const ACF_URL     = `${WP_BASE}/wp/v2/pages/63?_fields=acf`;
const POSTS_URL   = `${WP_BASE}/wp/v2/posts?_fields=id,title,excerpt,date,slug,featured_media,_links&per_page=10&_embed=1`;

/* ── Fallback posts ── */
const FALLBACK_POSTS = Array.from({ length: 4 }, (_, i) => ({
  id:       i + 1,
  title:    "Essential Data Points for Quick Commerce Competitor Analysis in 2026",
  excerpt:  "In 2026, quick commerce competition is no longer defined by speed alone. Sub-20-minute delivery has become standard in dense urban markets.",
  date:     "2023-03-16T00:00:00",
  slug:     "#",
  image:    "",
  readTime: `${4 + i} Mins Read`,
}));

/* ── Helpers ── */
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function stripHtml(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

function estimateReadTime(text) {
  const words = text.trim().split(/\s+/).length;
  const mins  = Math.max(1, Math.round(words / 200));
  return `${mins} Mins Read`;
}

function normalisePost(post) {
  const rawExcerpt = post.excerpt?.rendered || "";
  const plainText  = stripHtml(rawExcerpt);
  const image      =
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    post._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes?.medium_large?.source_url ||
    "";

  return {
    id:       post.id,
    title:    stripHtml(post.title?.rendered || ""),
    excerpt:  plainText,
    date:     post.date,
    slug:     post.slug,
    image,
    readTime: estimateReadTime(plainText),
  };
}

/* ── Star badge icon ── */
const StarIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="rb-badge__icon">
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
    <section className="rb-section">
      <div className="container">
        {/* Header skeleton */}
        <div className="rb-header">
          <div className="skeleton" style={{ width: 130, height: 32, borderRadius: 999, marginBottom: 16 }} />
          <div className="skeleton" style={{ width: "50%", height: 44, marginBottom: 12 }} />
          <div className="skeleton" style={{ width: "65%", height: 20 }} />
        </div>
        {/* Featured skeleton */}
        <div className="skeleton rb-featured-skeleton" />
        {/* Grid skeleton */}
        <div className="rb-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="rb-card rb-card--skeleton">
              <div className="skeleton rb-card__img-wrap" />
              <div className="rb-card__body">
                <div className="skeleton" style={{ width: "80%", height: 16, marginBottom: 10 }} />
                <div className="skeleton" style={{ width: "100%", height: 20, marginBottom: 6 }} />
                <div className="skeleton" style={{ width: "90%",  height: 20, marginBottom: 16 }} />
                <div className="skeleton" style={{ width: 90,     height: 16 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Featured post (first / largest card) ── */
function FeaturedPost({ post }) {
  const link = post.slug !== "#" ? `/blog/${post.slug}` : "#";
  return (
    <article className="rb-featured" aria-label={`Featured: ${post.title}`}>
      {/* Image side — padded so image floats with its own border-radius */}
      <div className="rb-featured__img-wrap">
        {post.image ? (
          <img src={post.image} alt={post.title} className="rb-featured__img" loading="eager" />
        ) : (
          <div className="rb-featured__img-placeholder" aria-hidden="true" />
        )}
        {/* <span className="rb-featured__badge">Featured</span> */}
      </div>

      {/* Content */}
      <div className="rb-featured__content">
        <div className="rb-meta">
          <span className="rb-meta__date">{formatDate(post.date)}</span>
          <span className="rb-meta__read">{post.readTime}</span>
        </div>
        <h2 className="rb-featured__title">{post.title}</h2>
        {post.excerpt && (
          <p className="rb-featured__excerpt">
            {post.excerpt.length > 220 ? post.excerpt.slice(0, 220) + "…" : post.excerpt}
          </p>
        )}
        <a href={link} className="rs_page_btn" aria-label={`Read more about ${post.title}`}>
          Read More
        </a>
      </div>
    </article>
  );
}

/* ── Regular blog card ── */
function BlogCard({ post }) {
  const link = post.slug !== "#" ? `/blog/${post.slug}` : "#";
  return (
    <article className="rb-card" aria-label={post.title}>
      {/* Image */}
      <div className="rb-card__img-wrap">
        {post.image ? (
          <img src={post.image} alt={post.title} className="rb-card__img" loading="lazy" />
        ) : (
          <div className="rb-card__img-placeholder" aria-hidden="true" />
        )}
      </div>

      {/* Body */}
      <div className="rb-card__body">
        <div className="rb-meta">
          <span className="rb-meta__date">{formatDate(post.date)}</span>
          <span className="rb-meta__read">{post.readTime}</span>
        </div>
        <h3 className="rb-card__title">{post.title}</h3>
        <a href={link} className="rb-card__link" aria-label={`Read more about ${post.title}`}>
          Read More…
        </a>
      </div>
    </article>
  );
}

/* ═══════════════════════════════════════════════
   RESOURCES BLOG — main component
   Layout:
     • Section header: badge + title + description (ACF)
     • Featured post  (first WP post, large card)
     • 3-column grid  (remaining posts)
═══════════════════════════════════════════════ */
export default function ResourcesBlog() {
  const [meta,    setMeta]    = useState(null);
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeta = fetch(ACF_URL)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(d => {
        const ra = d?.acf?.resources_artical;
        return {
          title:      ra?.title      || "",
          discretion: ra?.discretion || "",
        };
      })
      .catch(() => ({ title: "", discretion: "" }));

    const fetchPosts = fetch(POSTS_URL)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => data.map(normalisePost))
      .catch(() => FALLBACK_POSTS);

    Promise.all([fetchMeta, fetchPosts]).then(([m, p]) => {
      setMeta(m);
      setPosts(p);
      setLoading(false);
    });
  }, []);

  if (loading) return <Skeleton />;

  const { title, discretion } = meta || {};
  const [featured, ...rest]   = posts.length ? posts : FALLBACK_POSTS;
  // Show max 3 cards in the grid below featured
  const gridPosts = rest.slice(0, 3);

  return (
    <section className="rb-section" aria-label="Resources and Blog">
      <div className="rb-container">

        {/* ── Section header ── */}
        <header className="rb-header">
      
            {/* ── Badge ── */}
        <div className="badge-sec">
          <StarIcon />
          <span>Resources</span>
        </div>


          <h1 className="rb-header__title head-title">{title}</h1>
          {discretion && <p className="rb-header__desc head__desc">{discretion}</p>}
        </header>

        {/* ── Featured post ── */}
        {featured && <FeaturedPost post={featured} />}

        {/* ── Grid of remaining posts ── */}
        {gridPosts.length > 0 && (
          <div className="rb-grid" role="list" aria-label="More articles">
            {gridPosts.map(post => (
              <div key={post.id} role="listitem">
                <BlogCard post={post} />
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
