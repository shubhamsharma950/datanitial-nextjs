import { useEffect, useState } from "react";
import "./HomePage.css";
import HeroSection      from "../components/HeroSection";
import WhoWeAreSection  from "../components/WhoWeAreSection";
import WhyChooseUs      from "../components/WhyChooseUs";
import IndustriesSection from "../components/IndustriesSection";

const WP_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.NEXT_PUBLIC_WP_REST_URL) ||
  "https://darkred-worm-224502.hostingersite.com/wp-json";

const WP_PAGE_URL   = `${WP_BASE}/wp/v2/pages/63?_fields=id,title,content,acf`;
const BLOCK_API_URL = `${WP_BASE}/datainitial/v1/data-services`;

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
      {/* ── Hero Section ── */}
      <HeroSection />

      {/* Renders all Gutenberg blocks exactly as WordPress outputs them */}
      <div className="container">
        <div
          className="wp-page__content wp-block-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* ── ACF Section: Why Choose Us + Cards  ── */}
        <WhyChooseUs />
        {/* ── ACF Section: Who We Are + Cards ── */}
        <WhoWeAreSection />
        {/* ── ACF Section: Industries tabs ── */}
        <IndustriesSection />
      </div>
    </main>
  );
}
