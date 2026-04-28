import { useEffect, useState } from "react";
import "./HomePage.css";

const WP_PAGE_URL =
  "https://darkred-worm-224502.hostingersite.com/wp-json/wp/v2/pages/63?_fields=id,title,content,acf";

/* ═══════════════════════════════════════════════
   SKELETON — shown while fetching
═══════════════════════════════════════════════ */
function PageSkeleton() {
  return (
    <div className="wp-page-skeleton">
      {[80, 60, 100, 70, 90].map((w, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ width: `${w}%`, height: i === 0 ? 48 : 20, marginBottom: 16 }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   HOMEPAGE COMPONENT
   Fetches WordPress page ID 63 and renders its
   Gutenberg block HTML directly — any change in
   WP admin reflects here immediately.
═══════════════════════════════════════════════ */
export default function HomePage() {
  const [html,    setHtml]    = useState("");
  const [title,   setTitle]   = useState("");
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    fetch(WP_PAGE_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setTitle(data?.title?.rendered ?? "");
        setHtml(data?.content?.rendered ?? "");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="wp-page-error">
        <p>Could not load page content. Please try again later.</p>
      </div>
    );
  }

  return (
    <main className="wp-page">
      {/* Renders all Gutenberg blocks exactly as WordPress outputs them */}
      <div
        className="wp-page__content wp-block-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </main>
  );
}
