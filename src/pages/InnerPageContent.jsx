/**
 * InnerPageContent.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable content section rendered below the banner on every inner page.
 *
 * Fetches ACF sections via fetchInnerPage() and renders them through
 * DynamicSectionRenderer. Shows a skeleton while loading.
 *
 * Props:
 *   pageId      {number}  WordPress page ID
 *   acfField    {string}  ACF group key (e.g. "about_page")
 *   badgeText   {string}  Override badge text (falls back to ACF badge_text)
 *   children    {node}    Optional static content appended after dynamic sections
 */

import { useEffect, useState } from "react";
import { fetchInnerPage } from "../services/innerPageApi";
import DynamicSectionRenderer from "../components/DynamicSectionRenderer";
import "./InnerPageContent.css";

/* ── Skeleton loader ── */
function ContentSkeleton() {
  return (
    <div className="ipc__skeleton" aria-busy="true" aria-label="Loading content">
      <div className="skeleton ipc__skeleton-badge" />
      <div className="skeleton ipc__skeleton-h2" />
      <div className="skeleton ipc__skeleton-p" />
      <div className="skeleton ipc__skeleton-p ipc__skeleton-p--short" />
      <div className="skeleton ipc__skeleton-p" />
      <div className="ipc__skeleton-cards">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton ipc__skeleton-card" />
        ))}
      </div>
    </div>
  );
}

export default function InnerPageContent({
  pageId,
  acfField,
  badgeText: badgeOverride,
  children,
}) {
  const [sections, setSections] = useState([]);
  const [badge,    setBadge]    = useState(badgeOverride || "");
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!pageId || !acfField) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchInnerPage(pageId, acfField)
      .then(({ sections: s, banner }) => {
        if (!cancelled) {
          setSections(s);
          if (!badgeOverride && banner?.badgeText) {
            setBadge(banner.badgeText);
          }
        }
      })
      .catch(() => {
        /* silently fail — children still render */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [pageId, acfField, badgeOverride]);

  return (
    <section className="ipc" aria-label="Page content">
      <div className="ipc__inner">
        {loading ? (
          <ContentSkeleton />
        ) : (
          <>
            {/* Badge */}
            {badge && (
              <div className="badge-sec ipc__badge">
                <span className="badge-sec__icon" aria-hidden="true" />
                <span>{badge}</span>
              </div>
            )}

            {/* Dynamic ACF sections */}
            {sections.length > 0 && (
              <DynamicSectionRenderer sections={sections} />
            )}

            {/* Static / page-specific children */}
            {children}
          </>
        )}
      </div>
    </section>
  );
}
