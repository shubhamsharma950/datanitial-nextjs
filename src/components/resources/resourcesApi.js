/**
 * resourcesApi.js  —  components/resources/
 * ─────────────────────────────────────────────────────────────────────────────
 * All WordPress REST API calls for the Resources page (Page ID: 17).
 *
 * ACF structure expected (post.php?post=17):
 *
 *  acf
 *   ├── section_one  (Group)
 *   │     ├── badge_text    Text
 *   │     ├── title         Text
 *   │     └── description   Text Area
 *   │
 *   ├── section_two  (Group)
 *   │     ├── badge_text    Text
 *   │     ├── title         Text
 *   │     └── description   Text Area
 *   │
 *   └── section_three  (Group)
 *         ├── badge_text    Text
 *         ├── title         Text
 *         └── description   Text Area
 *
 * Section 1 — Featured post card:
 *   Fetches WP posts filtered by category slug "featured"
 *   GET /wp/v2/posts?categories=<id>&per_page=1&_embed=1
 *
 * Section 2 — Blog posts grid:
 *   GET /wp/v2/posts?per_page=6&_embed=1
 *   Supports load-more (pagination via page param)
 *
 * Section 3 — Case Studies grid:
 *   GET /wp/v2/case-studies?per_page=6&_embed=1
 *   (custom post type slug: case-studies)
 *   Supports load-more (pagination via page param)
 */

export const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

const PAGE_ID = 17;

/* ─────────────────────────────────────────────────────────────────────────
   Module-level cache — page ACF fetched once, shared across all sections
───────────────────────────────────────────────────────────────────────── */
let _acfCache   = null;
let _acfPromise = null;

async function fetchPageAcf() {
  if (_acfCache)   return _acfCache;
  if (_acfPromise) return _acfPromise;

  _acfPromise = fetch(`${WP_BASE}/wp/v2/pages/${PAGE_ID}?_fields=acf`)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((json) => {
      _acfCache   = json?.acf ?? {};
      _acfPromise = null;
      return _acfCache;
    })
    .catch((err) => {
      _acfPromise = null;
      throw err;
    });

  return _acfPromise;
}

/* ─────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────── */

/** Format ISO date → "16 March 2023" */
export function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Strip HTML tags → plain text */
function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

/** Estimate read time from plain text */
function estimateReadTime(text) {
  const words = (text || "").trim().split(/\s+/).length;
  const mins  = Math.max(1, Math.round(words / 200));
  return `${mins} Mins Read`;
}

/** Normalise a WP post/CPT object into a consistent card shape */
function normalisePost(post) {
  const rawExcerpt = post.excerpt?.rendered || "";
  const plainText  = stripHtml(rawExcerpt);
  const image =
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    post._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes?.medium_large?.source_url ||
    "";

  return {
    id:       post.id,
    title:    stripHtml(post.title?.rendered || ""),
    excerpt:  plainText,
    date:     post.date || "",
    slug:     post.slug || "",
    link:     post.link || "#",
    image,
    readTime: estimateReadTime(plainText),
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   Section One — Featured post card
   Fetches the first post in the "Featured" category.
   Returns: { meta: { badge_text, title, description }, post: {...} | null }
───────────────────────────────────────────────────────────────────────── */
export async function getSectionOne() {
  const [acf, catRes] = await Promise.all([
    fetchPageAcf().catch(() => ({})),
    // Resolve the "featured" category ID first
    fetch(`${WP_BASE}/wp/v2/categories?slug=featured&_fields=id,name`)
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => []),
  ]);

  const meta = {
    badge_text:  acf?.section_one?.badge_text  || "FEATURED RESOURCES",
    title:       acf?.section_one?.title       || "Insights That Matter Most",
    description: acf?.section_one?.description || "Handpicked content to help you stay ahead in a data-driven world.",
  };

  // If no "featured" category found, fall back to latest post
  let postData = null;
  try {
    const catId = catRes?.[0]?.id;
    const url   = catId
      ? `${WP_BASE}/wp/v2/posts?categories=${catId}&per_page=1&_embed=1&_fields=id,title,excerpt,date,slug,link,featured_media,_links`
      : `${WP_BASE}/wp/v2/posts?per_page=1&_embed=1&_fields=id,title,excerpt,date,slug,link,featured_media,_links`;

    const postsRes = await fetch(url);
    if (postsRes.ok) {
      const posts = await postsRes.json();
      if (posts.length > 0) postData = normalisePost(posts[0]);
    }
  } catch { /* use null */ }

  return { meta, post: postData };
}

/* ─────────────────────────────────────────────────────────────────────────
   Section Two — ACF meta only (fetched once on mount)
   Returns: { badge_text, title, description }
───────────────────────────────────────────────────────────────────────── */
export async function getSectionTwoMeta() {
  const acf = await fetchPageAcf().catch(() => ({}));
  return {
    badge_text:  acf?.section_two?.badge_text  || "ALL BLOGS",
    title:       acf?.section_two?.title       || "Latest Insights & Articles",
    description: acf?.section_two?.description || "Stay updated with trends, strategies, and expert perspectives on data and technology.",
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   Section Two — Blog posts (called on mount + every Load More click)
   GET /wp/v2/posts?per_page=6&page=N&_embed=1
   Returns: { posts[], totalPages }
   @param {number} page  — 1-based page number
───────────────────────────────────────────────────────────────────────── */
export async function fetchBlogPosts(page = 1) {
  const res = await fetch(
    `${WP_BASE}/wp/v2/posts?per_page=6&page=${page}&_embed=1&_fields=id,title,excerpt,date,slug,link,featured_media,_links`
  ).catch(() => null);

  if (!res?.ok) return { posts: [], totalPages: 1 };

  const data       = await res.json();
  const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1", 10);
  return { posts: data.map(normalisePost), totalPages };
}

/* ─────────────────────────────────────────────────────────────────────────
   Section Three — ACF meta only (fetched once on mount)
   Returns: { badge_text, title, description }
───────────────────────────────────────────────────────────────────────── */
export async function getSectionThreeMeta() {
  const acf = await fetchPageAcf().catch(() => ({}));
  return {
    badge_text:  acf?.section_three?.badge_text  || "ALL CASE STUDIES",
    title:       acf?.section_three?.title       || "Real Results. Proven Impact.",
    description: acf?.section_three?.description || "See how businesses across industries use our solutions to solve real challenges and achieve measurable outcomes.",
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   Section Three — Case Studies (called on mount + every Load More click)
   post_type=case-studie  (WP CPT slug as registered)
   Strategy:
     1. Try /wp/v2/case-studie  (rest_base matches CPT slug)
     2. Try /wp/v2/case-studies
     3. Try /wp/v2/case_studies
     4. Fall back to /wp/v2/posts?post_type=case-studie (some WP setups)
   Returns: { posts[], totalPages }
   @param {number} page  — 1-based page number
───────────────────────────────────────────────────────────────────────── */

// Cache the working CPT slug so we don't retry on every Load More
let _cptSlug = null;

async function resolveCptSlug() {
  if (_cptSlug) return _cptSlug;

  const slugsToTry = ["case-studie", "case-studies", "case_studies"];
  for (const slug of slugsToTry) {
    try {
      const res = await fetch(
        `${WP_BASE}/wp/v2/${slug}?per_page=1&_fields=id`
      );
      if (res.ok) {
        const data = await res.json();
        // A valid CPT endpoint returns an array (even if empty)
        if (Array.isArray(data)) {
          _cptSlug = slug;
          return slug;
        }
      }
    } catch { /* try next */ }
  }
  return null; // no CPT REST endpoint found
}

export async function fetchCaseStudies(page = 1) {
  const slug = await resolveCptSlug();

  if (slug) {
    try {
      const res = await fetch(
        `${WP_BASE}/wp/v2/${slug}?per_page=6&page=${page}&_embed=1&_fields=id,title,excerpt,date,slug,link,featured_media,_links`
      );
      if (res.ok) {
        const data       = await res.json();
        const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1", 10);
        return { posts: data.map(normalisePost), totalPages };
      }
    } catch { /* fall through to posts fallback */ }
  }

  // Last resort: query standard posts endpoint with post_type param
  // (works if WP has a custom query var exposed)
  try {
    const res = await fetch(
      `${WP_BASE}/wp/v2/posts?post_type=case-studie&per_page=6&page=${page}&_embed=1&_fields=id,title,excerpt,date,slug,link,featured_media,_links`
    );
    if (res.ok) {
      const data       = await res.json();
      const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1", 10);
      return { posts: data.map(normalisePost), totalPages };
    }
  } catch { /* give up */ }

  return { posts: [], totalPages: 1 };
}

/* ─────────────────────────────────────────────────────────────────────────
   Single post detail — fetch a blog post by slug
   Returns the full post object with content + tags + categories
───────────────────────────────────────────────────────────────────────── */
export async function fetchBlogPostBySlug(slug) {
  const res = await fetch(
    `${WP_BASE}/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=1&_fields=id,title,content,excerpt,date,slug,link,featured_media,tags,categories,_links`
  ).catch(() => null);

  if (!res?.ok) return null;
  const data = await res.json();
  if (!data.length) return null;

  const post = data[0];
  const rawExcerpt = post.excerpt?.rendered || "";
  const plainText  = stripHtml(rawExcerpt);
  const image =
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    post._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes?.large?.source_url ||
    "";

  return {
    id:         post.id,
    title:      stripHtml(post.title?.rendered || ""),
    content:    post.content?.rendered || "",
    excerpt:    plainText,
    date:       post.date || "",
    slug:       post.slug || "",
    link:       post.link || "#",
    image,
    readTime:   estimateReadTime(plainText),
    tags:       post.tags       || [],   // array of tag IDs
    categories: post.categories || [],   // array of category IDs
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   Single case study detail — fetch by slug
   Tries the resolved CPT REST base, same as fetchCaseStudies
───────────────────────────────────────────────────────────────────────── */
export async function fetchCaseStudyBySlug(slug) {
  const cptSlug = await resolveCptSlug();
  const endpoint = cptSlug
    ? `${WP_BASE}/wp/v2/${cptSlug}?slug=${encodeURIComponent(slug)}&_embed=1&_fields=id,title,content,excerpt,date,slug,link,featured_media,tags,categories,_links`
    : `${WP_BASE}/wp/v2/posts?slug=${encodeURIComponent(slug)}&post_type=case-studie&_embed=1&_fields=id,title,content,excerpt,date,slug,link,featured_media,tags,categories,_links`;

  const res = await fetch(endpoint).catch(() => null);
  if (!res?.ok) return null;
  const data = await res.json();
  if (!data.length) return null;

  const post = data[0];
  const rawExcerpt = post.excerpt?.rendered || "";
  const plainText  = stripHtml(rawExcerpt);
  const image =
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    post._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes?.large?.source_url ||
    "";

  return {
    id:         post.id,
    title:      stripHtml(post.title?.rendered || ""),
    content:    post.content?.rendered || "",
    excerpt:    plainText,
    date:       post.date || "",
    slug:       post.slug || "",
    link:       post.link || "#",
    image,
    readTime:   estimateReadTime(plainText),
    tags:       post.tags       || [],
    categories: post.categories || [],
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   Related blog posts — query by same tags or categories, exclude current
   Returns: { posts[], totalPages }
   @param {object} opts  — { excludeId, tags[], categories[], page }
───────────────────────────────────────────────────────────────────────── */
export async function fetchRelatedBlogPosts({ excludeId, tags = [], categories = [], page = 1 } = {}) {
  // Build query: prefer tags match, fall back to categories, then latest
  const params = new URLSearchParams({
    per_page: 3,          // ← Changed from 6 to 3
    page,
    _embed:   1,
    _fields:  "id,title,excerpt,date,slug,link,featured_media,_links",
  });

  if (excludeId) params.set("exclude", excludeId);

  // Tags take priority over categories for relatedness
  if (tags.length)       params.set("tags",       tags.join(","));
  else if (categories.length) params.set("categories", categories.join(","));

  const res = await fetch(`${WP_BASE}/wp/v2/posts?${params}`).catch(() => null);
  if (!res?.ok) return { posts: [], totalPages: 1 };

  const data       = await res.json();
  const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1", 10);
  return { posts: data.map(normalisePost), totalPages };
}

/* ─────────────────────────────────────────────────────────────────────────
   Related case studies — same logic, uses CPT endpoint
───────────────────────────────────────────────────────────────────────── */
export async function fetchRelatedCaseStudies({ excludeId, tags = [], categories = [], page = 1 } = {}) {
  const cptSlug = await resolveCptSlug();
  if (!cptSlug) return { posts: [], totalPages: 1 };

  const params = new URLSearchParams({
    per_page: 3,
    page,
    _embed:   1,
    _fields:  "id,title,excerpt,date,slug,link,featured_media,_links",
  });

  if (excludeId) params.set("exclude", excludeId);
  if (tags.length)            params.set("tags",       tags.join(","));
  else if (categories.length) params.set("categories", categories.join(","));

  const res = await fetch(`${WP_BASE}/wp/v2/${cptSlug}?${params}`).catch(() => null);
  if (!res?.ok) return { posts: [], totalPages: 1 };

  const data       = await res.json();
  const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1", 10);
  return { posts: data.map(normalisePost), totalPages };
}
