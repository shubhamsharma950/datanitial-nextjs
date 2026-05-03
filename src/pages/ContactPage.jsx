/**
 * ContactPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Contact Us inner page.
 *
 * WordPress setup:
 *   Page ID : 18
 *   ACF Group field name: contact_page
 *
 *   banner (Group)
 *     ├── title       → Text       — banner H1
 *     └── discerption → Text Area  — banner subtitle
 *
 * Banner data is fetched via contactApi (shared cache) and passed directly
 * to InnerPageLayout so it doesn't need to re-fetch the page.
 *
 * Sections:
 *   ContactFormSection  → Section 1 — form + image
 *   ContactInfoSection  → Section 2 — email / phone / address cards
 */

import { useEffect, useState } from "react";
import InnerPageHeader    from "./InnerPageHeader";
import InnerPageBanner    from "./InnerPageBanner";
import PageLoader         from "./PageLoader";
import ContactFormSection from "../components/contact/ContactFormSection";
import ContactInfoSection from "../components/contact/ContactInfoSection";
import { fetchContactPage, WP_BASE, CONTACT_PAGE_ID } from "../components/contact/contactApi";
import "./ContactPage.css";
import "./InnerPageLayout.css";

const FALLBACK_TITLE = "Contact Us";
const FALLBACK_DESC  = "Get in touch with our team. We'd love to hear from you and help your business grow.";

export default function ContactPage() {
  const [banner,  setBanner]  = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── Add inner-page body class (same as InnerPageLayout) ── */
  useEffect(() => {
    document.body.classList.add("inner-page");
    return () => document.body.classList.remove("inner-page");
  }, []);

  /* ── Fetch banner: ACF banner group + featured_media from WP page ── */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        /* Both requests fire in parallel — ACF data + page media ID */
        const [acf, pageRes] = await Promise.all([
          fetchContactPage(),
          fetch(`${WP_BASE}/wp/v2/pages/${CONTACT_PAGE_ID}?_fields=featured_media`),
        ]);

        const b = acf?.banner ?? {};
        const title       = b.title       || FALLBACK_TITLE;
        const description = b.discerption || FALLBACK_DESC;

        /* Resolve featured image URL */
        let featuredImage = null;
        if (pageRes.ok) {
          const pageData   = await pageRes.json();
          const mediaId    = pageData?.featured_media;
          if (mediaId && mediaId > 0) {
            const mediaRes = await fetch(
              `${WP_BASE}/wp/v2/media/${mediaId}?_fields=source_url,alt_text`
            );
            if (mediaRes.ok) {
              const media = await mediaRes.json();
              featuredImage = {
                url: media.source_url,
                alt: media.alt_text || title,
              };
            }
          }
        }

        if (!cancelled) {
          setBanner({ title, description, ctaText: "", ctaLink: "", featuredImage });
        }
      } catch {
        if (!cancelled) {
          setBanner({
            title:        FALLBACK_TITLE,
            description:  FALLBACK_DESC,
            ctaText:      "",
            ctaLink:      "",
            featuredImage: null,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="ipl">
      <PageLoader />

      {/* Banner with header inside */}
      <div className="ipl__hero">
        <InnerPageHeader />
        <InnerPageBanner
          loading={loading}
          banner={banner}
        />
      </div>

      {/* Page content */}
      <div className="ipl__body">
        {/* Section 1 — Contact form + image */}
        <ContactFormSection />

        {/* Section 2 — Email / Phone / Address cards */}
        <ContactInfoSection />
      </div>
    </div>
  );
}
