/**
 * InnerPageBanner.jsx
 * Full-screen hero banner for all inner pages.
 * Accepts dynamic WordPress data: featured image, title, subtitle, CTA.
 *
 * Props:
 *   loading        {boolean}  — show skeleton while data loads
 *   banner         {object}   — { title, description, ctaText, ctaLink, featuredImage: { url, alt } }
 *   fallbackBg     {string}   — optional CSS color/gradient used when no featured image
 */

export default function InnerPageBanner({ loading = false, banner = null, fallbackBg }) {
  const bgStyle = banner?.featuredImage?.url
    ? { backgroundImage: `url(${banner.featuredImage.url})` }
    : fallbackBg
    ? { background: fallbackBg }
    : undefined;

  const hasCtaButton = !loading && banner?.ctaText && banner?.ctaLink;

  return (
    <section
      className="ipb"
      style={bgStyle}
      aria-label={banner?.title ? `${banner.title} banner` : "Page banner"}
    >
      {/* Dark overlay for readability */}
      <div className="ipb__overlay" aria-hidden="true" />

      {/* Decorative gradient orbs */}
      <div className="ipb__orb ipb__orb--1" aria-hidden="true" />
      <div className="ipb__orb ipb__orb--2" aria-hidden="true" />

      <div className="ipb__content">
        {loading ? (
          /* ── Skeleton state ── */
          <div className="ipb__skeleton-wrap" aria-busy="true" aria-label="Loading page content">
            <div className="ipb__skeleton ipb__skeleton--eyebrow" />
            <div className="ipb__skeleton ipb__skeleton--title" />
            <div className="ipb__skeleton ipb__skeleton--title ipb__skeleton--title-short" />
            <div className="ipb__skeleton ipb__skeleton--desc" />
            <div className="ipb__skeleton ipb__skeleton--desc ipb__skeleton--desc-short" />
            <div className="ipb__skeleton ipb__skeleton--btn" />
          </div>
        ) : (
          /* ── Live content ── */
          <>
            {/* Eyebrow label */}
            {/* <span className="ipb__eyebrow" aria-hidden="true">
              {banner?.eyebrow || "Datanitial"}
            </span> */}

            {/* Main heading */}
            <h1 className="ipb__title">
              {banner?.title || "Welcome"}
            </h1>

            {/* Subtitle / description */}
            {banner?.description && (
              <p className="ipb__description">{banner.description}</p>
            )}

            {/* CTA button — only rendered when both text and link are present */}
            {hasCtaButton && (
              <a
                href={banner.ctaLink}
                className="secondary-btn"
                rel={banner.ctaLink.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                {banner.ctaText}
                {/* <svg
                  className="ipb__cta-arrow"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M4 10h12M11 5l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg> */}
              </a>
            )}
          </>
        )}
      </div>

      {/* Bottom fade for smooth page transition */}
      <div className="ipb__bottom-fade" aria-hidden="true" />
    </section>
  );
}
