/**
 * InnerPageLayout.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable layout wrapper for ALL inner pages (About, Solutions, Industries,
 * Resources, Contact, etc.).
 *
 * What it does:
 *  1. Adds `body.inner-page` class → CSS hides the global site header (.hdr)
 *  2. Fetches WordPress page data (ACF fields + featured_media) by pageId
 *  3. Renders <InnerPageHeader> (custom inner-page header, positioned inside banner)
 *  4. Renders <InnerPageBanner> (full-screen hero with dynamic WP content)
 *  5. Renders {children} below the banner (page-specific content)
 *
 * Props:
 *   pageId      {number}  WordPress page ID  (e.g. 10 for About Us)
 *   acfField    {string}  ACF group key      (e.g. "about_page")
 *   fallbackTitle       {string}  Shown when WP data is unavailable
 *   fallbackDescription {string}  Shown when WP data is unavailable
 *   fallbackBg  {string}  CSS color/gradient used when no featured image
 *   children    {node}    Page-specific content rendered below the banner
 *
 * Usage:
 *   <InnerPageLayout pageId={10} acfField="about_page" fallbackTitle="About Us">
 *     <AboutContent />
 *   </InnerPageLayout>
 */

import { useEffect, useState } from "react";
import InnerPageHeader from "./InnerPageHeader";
import InnerPageBanner from "./InnerPageBanner";
import PageLoader from "./PageLoader";
import "./InnerPageLayout.css";

const WP_BASE = "https://darkred-worm-224502.hostingersite.com/wp-json";

export default function InnerPageLayout({
  pageId            = 10,
  acfField          = "about_page",
  fallbackTitle       = "Welcome",
  fallbackDescription = "Empowering businesses with scalable data solutions.",
  fallbackBg        = "linear-gradient(135deg, #0d0f2b 0%, #1a1060 60%, #0d0f2b 100%)",
  children,
}) {
  const [banner,  setBanner]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  /* ── Add / remove body class to suppress global header ── */
  useEffect(() => {
    document.body.classList.add("inner-page");
    return () => document.body.classList.remove("inner-page");
  }, []);

  /* ── Fetch WordPress page data ── */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    async function fetchPageData() {
      try {
        const pageRes = await fetch(
          `${WP_BASE}/wp/v2/pages/${pageId}?_fields=id,title,acf,featured_media`
        );
        if (!pageRes.ok) throw new Error(`HTTP ${pageRes.status}`);
        const page = await pageRes.json();

        /* ── ACF fields ── */
        const acf         = page?.acf?.[acfField] ?? {};
        const title       = acf?.banner_title       || fallbackTitle;
        const description = acf?.banner_discription || fallbackDescription;
        const ctaText     = acf?.banner_button_text || "";
        const ctaLink     = acf?.banner_button_link || "";

        /* ── Featured image ── */
        let featuredImage = null;
        if (page?.featured_media && page.featured_media > 0) {
          try {
            const mediaRes = await fetch(
              `${WP_BASE}/wp/v2/media/${page.featured_media}?_fields=source_url,alt_text`
            );
            if (mediaRes.ok) {
              const media = await mediaRes.json();
              featuredImage = {
                url: media.source_url,
                alt: media.alt_text || title,
              };
            }
          } catch {
            /* featured image unavailable — use fallback gradient */
          }
        }

        if (!cancelled) {
          setBanner({ title, description, ctaText, ctaLink, featuredImage });
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setBanner({
            title:       fallbackTitle,
            description: fallbackDescription,
            ctaText:     "",
            ctaLink:     "",
            featuredImage: null,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPageData();
    return () => { cancelled = true; };
  }, [pageId, acfField, fallbackTitle, fallbackDescription]);

  return (
    <div className="ipl">
      {/* ── Page transition loader — fires on every inner page mount ── */}
      <PageLoader />

      {/* ── Banner section: header is absolutely positioned inside it ── */}
      <div className="ipl__hero">
        <InnerPageHeader />
        <InnerPageBanner
          loading={loading}
          banner={banner}
          fallbackBg={fallbackBg}
        />
      </div>

      {/* ── Page-specific content ── */}
      {children && (
        <div className="ipl__body">
          {children}
        </div>
      )}
    </div>
  );
}
